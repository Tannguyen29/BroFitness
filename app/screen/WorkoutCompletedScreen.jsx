import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Icon } from "@rneui/themed";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventRegister } from 'react-native-event-listeners';
import { getUserInfo } from '../../config/api';

const WorkoutCompletedScreen = ({ route, navigation }) => {
  const { exercises, totalTime, calories, planId, week, day } = route.params;
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    saveWorkoutProgress();
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const saveWorkoutProgress = async () => {
    setIsSaving(true);
    try {
      const userInfo = await getUserInfo();
      if (!userInfo || !userInfo.token) {
        throw new Error("No user token found");
      }

      const userId = userInfo.token;
      const progressKey = `plan_progress_${userId}_${planId}`;
      
      const savedProgress = await AsyncStorage.getItem(progressKey);
      let progress = savedProgress ? JSON.parse(savedProgress) : { 
        completedDays: 0,
        lastUnlockTime: null,
        workoutHistory: []
      };
      
      progress.completedDays += 1;
      progress.lastUnlockTime = new Date().toISOString();
      
      const workoutData = {
        completedDay: day,
        date: new Date().toISOString(),
        duration: totalTime,
        calories: calories,
        exercisesCompleted: exercises.length,
        week: week,
        day: day
      };
      
      if (!progress.workoutHistory) {
        progress.workoutHistory = [];
      }
      progress.workoutHistory.push(workoutData);

      await AsyncStorage.setItem(progressKey, JSON.stringify(progress));

      EventRegister.emit('workoutCompleted', {
        planId: planId,
        workoutData: {
          completedDay: day,
          ...workoutData
        }
      });

    } catch (error) {
      console.error("Error saving workout progress:", error);
      Alert.alert(
        "Error",
        "Failed to save workout progress. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeedbackSelect = (feedback) => {
    setSelectedFeedback(feedback);
  };

  const handleShare = () => {
    Alert.alert("Share", "Share functionality will be implemented here");
  };

  const handleFinish = () => {
    navigation.replace('BottomTabs'); 
  };

  if (isSaving) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FD6300" />
        <Text style={styles.loadingText}>Saving your progress...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareText}>SHARE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>WORKOUT COMPLETED!</Text>
        <Text style={styles.subtitle}>DAY {day}</Text>
        <Text style={styles.workoutName}>WEEK {week} COMPLETED</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>

        <Text style={styles.feedbackTitle}>How do you feel?</Text>
        <View style={styles.feedbackContainer}>
          {['Hard', 'Just right', 'Easy'].map((feedback) => (
            <TouchableOpacity 
              key={feedback}
              style={[
                styles.feedbackButton,
                selectedFeedback === feedback && styles.selectedFeedbackButton
              ]}
              onPress={() => handleFeedbackSelect(feedback)}
            >
              <Icon 
                name="layers" 
                type="feather" 
                size={24} 
                color={selectedFeedback === feedback ? '#FD6300' : '#FFF'} 
              />
              <Text style={[
                styles.feedbackText,
                selectedFeedback === feedback && styles.selectedFeedbackText
              ]}>
                {feedback}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.finishButton}
        onPress={handleFinish}
      >
        <Text style={styles.finishButtonText}>FINISH</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  shareText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    top: 30,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
  },
  subtitle: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 10,
  },
  workoutName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  feedbackTitle: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 40,
    marginBottom: 20,
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  feedbackButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    width: '30%',
  },
  selectedFeedbackButton: {
    borderColor: '#FD6300',
    backgroundColor: 'rgba(253, 99, 0, 0.1)',
  },
  feedbackText: {
    color: '#FFF',
    marginTop: 5,
  },
  selectedFeedbackText: {
    color: '#FD6300',
  },
  finishButton: {
    backgroundColor: '#FD6300',
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WorkoutCompletedScreen;