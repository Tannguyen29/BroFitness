import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { Icon } from "@rneui/themed";

const PTPlansOverview = ({ navigation, route }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { selectedPlanId } = route.params;

  const fetchPlan = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/student-pt-plans/${selectedPlanId}`, {
        headers: { 'x-auth-token': token }
      });
      setPlan(response.data);
    } catch (error) {
      console.error('Error fetching PT plan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [selectedPlanId]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPlan().finally(() => setRefreshing(false));
  }, [selectedPlanId]);

  const renderDays = (week, daysPerWeek, currentDay) => {
    let dayComponents = [];
    for (let day = 1; day <= daysPerWeek; day++) {
      const absoluteDay = (week - 1) * daysPerWeek + day;
      const isCompleted = absoluteDay < currentDay;
      const isCurrent = absoluteDay === currentDay;
      const isLocked = absoluteDay > currentDay;

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

  const handlePlanPress = () => {
    navigation.navigate('PTPlansDetail', { 
      planId: plan._id,
      planDetails: plan,
      currentWeek: 1,
      currentDay: 1
    });
  };

  const renderWeeks = (plan) => {
    const completedDays = plan.progress?.length || 0;
    const currentDay = completedDays + 1;
    const weeks = plan.duration?.weeks || 0;
    const daysPerWeek = plan.duration?.daysPerWeek || 0;

    let weekComponents = [];
    for (let week = 1; week <= weeks; week++) {
      const isCurrentWeek = Math.ceil(currentDay / daysPerWeek) === week;
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
                {Math.min(daysPerWeek, currentDay - ((week - 1) * daysPerWeek))}/{daysPerWeek}
              </Text>
            </View>
            
            <View style={styles.weekBox}>
              <View style={styles.daysContainer}>
                {renderDays(week, daysPerWeek, currentDay)}
              </View>
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => handlePlanPress()}
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FD6300" />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="calendar" type="feather" size={50} color="#666" />
        <Text style={styles.emptyText}>Plan not found</Text>
      </View>
    );
  }

  const totalDays = (plan.duration?.weeks || 0) * (plan.duration?.daysPerWeek || 0);
  const completedDays = plan.progress?.length || 0;

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
            {completedDays} / {totalDays} Days Finished
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(completedDays / totalDays) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressPercentage}>
            {Math.round((completedDays / totalDays) * 100)}%
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
});

export default PTPlansOverview;