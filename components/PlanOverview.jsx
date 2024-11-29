import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, ImageBackground, Modal } from 'react-native';
import { Icon } from "@rneui/themed";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfo } from '../config/api';
import { EventRegister } from 'react-native-event-listeners';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import LottieView from 'lottie-react-native';
const PlanOverview = ({ plan, navigation, route }) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState(0);
  const [lastUnlockTime, setLastUnlockTime] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isWorkoutLocked, setIsWorkoutLocked] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getProgressKey = (userId) => {
    return `plan_progress_${userId}_${plan._id}`;
  };

  useEffect(() => {
    const listener = EventRegister.addEventListener('workoutCompleted', (data) => {
      if (data.planId === plan._id) {
        completeWorkout();
      }
    });

    return () => {
      EventRegister.removeEventListener(listener);
    };
  }, []);

  const loadProgress = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!plan?._id) {
        console.error('Plan ID is undefined');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/plan-progress/${plan._id}/start`,
        {},
        { 
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.isExisting) {
        console.log('Loaded existing plan progress');
      } else {
        console.log('Started new plan progress');
      }
      
      const progress = response.data.progress;
      if (progress) {
        setCurrentDay(progress.currentDay);
        setCompletedDays(progress.completedWorkouts.length);
        setLastUnlockTime(progress.lastUnlockTime);
        setIsCompleted(progress.completedWorkouts.length >= 
          (plan.duration.weeks * plan.duration.daysPerWeek));
      }
    } catch (error) {
      if (error.response?.status !== 400) {
        console.log('Error loading plan progress:', error.message);
      }
    }
  };

  const completeWorkout = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const completedDay = parseInt(currentDay);
      
      if (isNaN(completedDay)) {
        console.error('Invalid currentDay value:', currentDay);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/plan-progress/${plan._id}/progress`,
        {
          completedDay: completedDay
        },
        { 
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Progress response:', response.data);
      
      const { progress } = response.data;
      setCompletedDays(progress.completedWorkouts.length);
      setCurrentDay(progress.currentDay);
      setLastUnlockTime(new Date(progress.lastUnlockTime));
      setIsCompleted(progress.isCompleted);

    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const { weeks, daysPerWeek } = plan.duration;
  const totalDays = weeks * daysPerWeek;

  const renderWeeks = () => {
    let weekComponents = [];
    for (let week = 1; week <= weeks; week++) {
      const isCurrentWeek = Math.ceil(currentDay / daysPerWeek) === week;
      weekComponents.push(
        <View key={`week-${week}`} style={styles.weekContainer}>
          <View style={styles.weekIconContainer}>
            <View style={[
              styles.flashIconBox,
              isCurrentWeek ? styles.activeFlashIconBox : styles.inactiveFlashIconBox
            ]}>
              <Icon name="flash" type="ionicon" color="#FFFFFF" size={20} />
            </View>
            {week < weeks && <View style={styles.weekConnector} />}
          </View>
          <View style={styles.weekContent}>
            <View style={styles.weekHeader}>
              <Text style={styles.weekTitle}>WEEK {week}</Text>
              <Text style={styles.weekProgress}>{currentDay}/{daysPerWeek}</Text>
            </View>
            <View style={styles.weekBox}>
              <View style={styles.daysContainer}>
                {renderDays(week)}
              </View>
              {renderStartButton(week)}
            </View>
          </View>
        </View>
      );
    }
    return weekComponents;
  };

  const renderDays = (week) => {
    let dayComponents = [];
    for (let day = 1; day <= daysPerWeek; day++) {
      const absoluteDay = (week - 1) * daysPerWeek + day;
      const isCompleted = absoluteDay < currentDay;
      const isCurrent = absoluteDay === currentDay;
      const isLocked = absoluteDay > currentDay;

      dayComponents.push(
        <React.Fragment key={`day-${day}`}>
          <TouchableOpacity 
            style={styles.dayItem}
            onPress={() => handleDayPress(week, day)}
            disabled={isLocked || (isCurrent && !canStartWorkout())}
          >
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
          </TouchableOpacity>
          {day < daysPerWeek && (
            <Icon name="chevron-forward" type="ionicon" color="#333333" size={20} style={styles.dayConnector} />
          )}
        </React.Fragment>
      );
    }
    return dayComponents;
  };

  const handleDayPress = (week, day) => {
    const absoluteDay = (week - 1) * daysPerWeek + day;
    
    if (absoluteDay === currentDay && canStartWorkout() && !isWorkoutLocked) {
      navigation.navigate('PlanDetail', {
        planId: plan._id,
        week,
        day: absoluteDay
      });
    }
  };

  const canStartWorkout = () => {
    if (!lastUnlockTime || completedDays === 0) return true;
    
    const now = new Date();
    const lastWorkout = new Date(lastUnlockTime);
    
    const isSameDay = 
      lastWorkout.getDate() === now.getDate() &&
      lastWorkout.getMonth() === now.getMonth() &&
      lastWorkout.getFullYear() === now.getFullYear();
    
    return !isSameDay && 
           (currentDay <= plan.duration.weeks * plan.duration.daysPerWeek);
  };

  const handleStartButtonPress = () => {
    if (isCompleted) {
      setShowCompletionModal(true);
    } else {
      handleDayPress(Math.ceil(currentDay / daysPerWeek), currentDay % daysPerWeek || daysPerWeek);
    }
  };

  const resetPlan = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(
        `${API_BASE_URL}/plans/${plan._id}/start`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      
      setCompletedDays(0);
      setCurrentDay(1);
      setIsCompleted(false);
      setShowCompletionModal(false);
      setLastUnlockTime(null);
    } catch (error) {
      console.error('Error resetting plan:', error);
    }
  };

  const continueFromLastDay = () => {
    setIsCompleted(false);
    setShowCompletionModal(false);
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userInfo = await getUserInfo();
        if (userInfo && userInfo.token) {
          setUserId(userInfo.token);
          await loadProgress(userInfo.token);
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    initializeUser();
  }, []);

  const resetTimer = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(
        `${API_BASE_URL}/plans/${plan._id}/reset-timer`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      
      setLastUnlockTime(null);
      alert('Timer has been reset. You can now complete another workout.');
    } catch (error) {
      console.error('Error resetting timer:', error);
    }
  };

  useEffect(() => {
    const checkWorkoutStatus = () => {
      if (lastUnlockTime) {
        const now = new Date();
        const lastWorkout = new Date(lastUnlockTime);
        
        const isSameDay = 
          lastWorkout.getDate() === now.getDate() &&
          lastWorkout.getMonth() === now.getMonth() &&
          lastWorkout.getFullYear() === now.getFullYear();
        
        setIsWorkoutLocked(isSameDay);
      }
    };

    checkWorkoutStatus();
  }, [lastUnlockTime]);

  const renderStartButton = (week) => {
    const isDisabled = !canStartWorkout() || isWorkoutLocked;
    return (
      <TouchableOpacity 
        style={[
          styles.startButton, 
          isDisabled && styles.disabledButton
        ]}
        onPress={() => handleDayPress(week, 1)}
        disabled={isDisabled}
      >
        <Text style={styles.startButtonText}>
          {week === Math.ceil(currentDay / daysPerWeek) ? 'START' : 'LOCKED'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../assets/animation/Loading.json')}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
        </View>
      ) : (
        <>
          <ImageBackground 
            source={plan.backgroundImage ? { uri: plan.backgroundImage } : require('../assets/banner/banner1.jpg')}
            style={styles.header}
          >
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={30} color="#FD6300" />
            </TouchableOpacity>
            <Text style={styles.title}>{plan.title.toUpperCase()}</Text>
            <Text style={styles.subtitle}>{plan.subtitle.toUpperCase()}</Text>
          </ImageBackground>

          <View style={styles.content}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{completedDays} / {totalDays} Days Finished</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(completedDays / totalDays) * 100}%` }]} />
              </View>
              <Text style={styles.progressPercentage}>{Math.round((completedDays / totalDays) * 100)}%</Text>
            </View>
            <ScrollView style={styles.scrollView}>
              {renderWeeks()}
            </ScrollView>
            {isCompleted && (
              <TouchableOpacity 
                style={styles.startButton}
                onPress={handleStartButtonPress}
              >
                <Text style={styles.startButtonText}>
                  FINISHED
                </Text>
              </TouchableOpacity>
            )}
            {__DEV__ && (  // Chỉ hiển thị trong development mode
              <TouchableOpacity 
                style={[styles.startButton, { marginTop: 5 }]} 
                onPress={resetTimer}
              >
                <Text style={styles.startButtonText}>Reset Timer (Dev Only)</Text>
              </TouchableOpacity>
            )}
          </View>

          <Modal
            visible={showCompletionModal}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Congratulations!</Text>
                <Text style={styles.modalText}>You've completed the plan. What would you like to do next?</Text>
                <TouchableOpacity style={styles.modalButton} onPress={resetPlan}>
                  <Text style={styles.modalButtonText}>Start Over</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={continueFromLastDay}>
                  <Text style={styles.modalButtonText}>Continue from Last Day</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => navigation.navigate("AllPlans")}>
                  <Text style={styles.modalButtonText}>More plan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => setShowCompletionModal(false)}>
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  header: {
    height: 200,
    justifyContent: 'flex-end',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    backgroundColor: '#000000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 5,
  },
  progressBar: {
    height: 15,
    backgroundColor: '#333333',
    borderRadius: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FD6300',
    borderRadius: 10,
  },
  progressPercentage: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'right',
    marginTop: 5,
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
  weekContent: {
    flex: 1,
    paddingBottom: 30,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  weekProgress: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  weekBox: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
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
  dayButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
  },
  completedDay: {
    backgroundColor: '#666666', 
  },
  currentDay: {
    backgroundColor: '#FD6300', 
  },
  lockedDay: {
    backgroundColor: '#444444', 
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  completedDayText: {
    color: '#CCCCCC', 
  },
  currentDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  activeDayText: {
    color: '#FFFFFF',
  },
  dayConnector: {
    marginHorizontal: 2,
  },
  startButton: {
    backgroundColor: '#FD6300',
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#FD6300',
    padding: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
});

export default PlanOverview;