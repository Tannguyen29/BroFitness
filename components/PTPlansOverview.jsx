import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { Icon } from "@rneui/themed";
import { EventRegister } from 'react-native-event-listeners';

const PTPlansOverview = ({ navigation, route }) => {
  // Kiểm tra params
  if (!route?.params?.selectedPlanId) {
    console.error('No planId provided');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid plan data</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState(null);
  const { selectedPlanId } = route.params;

  // Thêm useEffect để fetch data khi component mount
  useEffect(() => {
    fetchPlan();
  }, []);

  useEffect(() => {
    const listener = EventRegister.addEventListener('workoutCompleted', async (data) => {
      if (data.planId === selectedPlanId) {
        await saveWorkoutProgress(data.workoutData);
      }
    });

    return () => {
      EventRegister.removeEventListener(listener);
    };
  }, [selectedPlanId]);

  // Thêm hàm onRefresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPlan().finally(() => setRefreshing(false));
  }, []);

  const saveWorkoutProgress = async (workoutData) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error("No user token found");
      }

      const response = await axios.post(
        `${API_BASE_URL}/pt-plan-progress/${selectedPlanId}/progress`,
        { 
          completedDay: workoutData.completedDay
        },
        { headers: { 'x-auth-token': token } }
      );

      if (response.data) {
        setProgress(response.data.progress);
        await fetchPlan();
      }
    } catch (error) {
      console.error("Error saving PT workout progress:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save workout progress"
      );
    }
  };

  // Sửa lại fetchPlan để cũng lấy progress từ AsyncStorage
  const fetchPlan = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      // Lấy thông tin plan và progress trong cùng một request
      const response = await axios.get(
        `${API_BASE_URL}/student-pt-plans/${selectedPlanId}`, 
        { headers: { 'x-auth-token': token } }
      );
      
      setPlan(response.data);
      
      // Cập nhật progress từ response
      if (response.data.progress) {
        setProgress(response.data.progress);
        
        // Lưu progress vào AsyncStorage như backup
        const progressKey = `pt_plan_progress_${token}_${selectedPlanId}`;
        await AsyncStorage.setItem(progressKey, JSON.stringify(response.data.progress));
      }
    } catch (error) {
      console.error('Error fetching PT plan:', error);
      Alert.alert('Error', 'Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm start plan
  const startPlan = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        `${API_BASE_URL}/pt-plan-progress/${selectedPlanId}/start`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      setProgress(response.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('Plan already started');
      } else {
        console.error('Error starting plan:', error);
        Alert.alert('Error', 'Failed to start plan. Please try again.');
      }
    }
  };

  const handlePlanPress = async () => {
    
    if (!progress) {
      await startPlan();
    }
    
    navigation.navigate('PTPlansDetail', { 
      planId: plan._id,
      planDetails: plan,
      currentWeek: Math.ceil(progress?.currentDay / plan.duration.daysPerWeek) || 1,
      currentDay: progress?.currentDay || 1
    });
  };

  // Cập nhật renderDays để sử dụng progress mới
  const renderDays = (week, daysPerWeek) => {
    let dayComponents = [];
    for (let day = 1; day <= daysPerWeek; day++) {
      const absoluteDay = (week - 1) * daysPerWeek + day;
      const isCompleted = progress?.completedWorkouts?.some(
        workout => workout.dayNumber === absoluteDay
      );
      const isCurrent = progress?.currentDay === absoluteDay;
      const isLocked = !progress?.currentDay || absoluteDay > progress.currentDay;

      // Phần render UI giữ nguyên
      dayComponents.push(
        <React.Fragment key={`day-${day}`}>
          <View style={styles.dayItem}>
            <View style={[
              styles.dayButton,
              isCompleted && styles.completedDay,
              isCurrent && styles.currentDay,
              isLocked && styles.lockedDay
            ]}>
              {isLocked ? (
                <Icon name="lock" type="feather" color="#999999" size={16} />
              ) : (
                <Text style={[
                  styles.dayText,
                  isCompleted && styles.completedDayText,
                  isCurrent && styles.currentDayText
                ]}>
                  {day}
                </Text>
              )}
            </View>
          </View>
          {day < daysPerWeek && (
            <Icon name="chevron-forward" type="ionicon" color="#333333" size={20} style={styles.dayConnector} />
          )}
        </React.Fragment>
      );
    }
    return dayComponents;
  };

  // Sửa lại renderWeeks để kiểm tra plan tồn tại
  const renderWeeks = (plan) => {
    if (!plan?.duration) {
      console.error('Invalid plan data:', plan);
      return null;
    }

    const weeks = plan.duration.weeks;
    const daysPerWeek = plan.duration.daysPerWeek;
    const currentWeek = Math.ceil((progress?.currentDay || 1) / daysPerWeek);

    let weekComponents = [];
    for (let week = 1; week <= weeks; week++) {
      const isCurrentWeek = currentWeek === week;
      const completedDaysInWeek = progress?.completedWorkouts?.filter(
        workout => workout.weekNumber === week
      ).length || 0;

      weekComponents.push(
        <View key={`week-${week}`} style={styles.weekContainer}>
          <View style={styles.weekSideContainer}>
            <View style={[
              styles.flashIconBox,
              isCurrentWeek ? styles.activeFlashIconBox : styles.inactiveFlashIconBox
            ]}>
              <Icon name="flash" type="ionicon" color="#FFFFFF" size={20} />
            </View>
            {week < weeks && <View style={styles.weekConnector} />}
          </View>
          
          <View style={styles.weekMainContent}>
            <View style={styles.weekHeader}>
              <View style={styles.weekTitleContainer}>
                <Text style={styles.weekTitle}>WEEK {week}</Text>
              </View>
              <Text style={styles.weekProgress}>
                {completedDaysInWeek}/{daysPerWeek}
              </Text>
            </View>
            
            <View style={styles.weekBox}>
              <View style={styles.daysContainer}>
                {renderDays(week, daysPerWeek)}
              </View>
              <TouchableOpacity 
                style={[
                  styles.startButton,
                  !isCurrentWeek && styles.disabledButton
                ]}
                onPress={handlePlanPress}
                disabled={!isCurrentWeek}
              >
                <Text style={styles.startButtonText}>
                  {isCurrentWeek ? 'START' : 'LOCKED'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
    return weekComponents;
  };

  // Sửa lại return statement để hiển thị loading và error states
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FD6300" />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load plan details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPlan}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-left" size={30} color="#FD6300" />
      </TouchableOpacity>
      
      <View style={styles.planCard}>
        <Text style={styles.planTitle}>{plan.title}</Text>
        <Text style={styles.trainerName}>Trainer: {plan.ptName}</Text>
                 
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {progress?.completedWorkouts?.length || 0} / {plan.duration?.weeks * plan.duration?.daysPerWeek} Days Finished
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${((progress?.completedWorkouts?.length || 0) / 
                    (plan.duration?.weeks * plan.duration?.daysPerWeek)) * 100}%` 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressPercentage}>
            {Math.round(((progress?.completedWorkouts?.length || 0) / 
              (plan.duration?.weeks * plan.duration?.daysPerWeek)) * 100)}%
          </Text>
        </View>

        <View style={styles.weeksContainer}>
          {renderWeeks(plan)}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
  },
  backButton: {
    marginBottom: 20,
    right: 180
  },
  planCard: {
    marginBottom: 24,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trainerName: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FD6300',
    borderRadius: 4,
  },
  progressPercentage: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'right',
  },
  weekContainer: {
    flexDirection: 'row',
    marginBottom: 0, 
  },
  weekIconContainer: {
    alignItems: 'center',
    marginRight: 10,
    height: '100%',
  },
  flashIconBox: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  activeFlashIconBox: {
    backgroundColor: '#FD6300',
  },
  inactiveFlashIconBox: {
    backgroundColor: '#444444',
  },
  weekConnector: {
    position: 'absolute',
    top: 30, 
    left: 14,
    width: 2,
    bottom: -30, 
    backgroundColor: '#444444',
  },
  weekSideContainer: {
    alignItems: 'center',
    marginRight: 12,
    height: '100%',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  weekProgress: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  weekMainContent: {
    flex: 1,
  },
  weekBox: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 15
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dayItem: {
    alignItems: 'center',
  },
  dayConnector: {
    marginHorizontal: 4,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FD6300',
  },
  completedDay: {
    backgroundColor: '#666666',
  },
  lockedDay: {
    backgroundColor: '#333333',
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#FD6300',
    borderRadius: 25,
    padding: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentDay: {
    backgroundColor: '#FD6300',
  },
  completedDayText: {
    color: '#999999',
  },
  currentDayText: {
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FD6300',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#FD6300',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PTPlansOverview;