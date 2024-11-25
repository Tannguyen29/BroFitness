import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import { Icon } from "@rneui/themed";
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PTPlansDetail = ({ route }) => {
  const navigation = useNavigation();
  const { planId, planDetails, currentWeek, currentDay } = route.params;
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanDetails();
  }, [currentWeek, currentDay]);

  const fetchPlanDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/student-pt-plans/${planId}`, {
        headers: { 'x-auth-token': token }
      });
      setPlan(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching PT plan details:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FD6300" />
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load PT plan details</Text>
      </SafeAreaView>
    );
  }

  const currentWeekData = plan.weeks[currentWeek - 1];
  const currentDayData = currentWeekData?.days[currentDay - 1];

  if (!currentDayData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid week or day</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollViewContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={30} color="#FD6300" />
        </TouchableOpacity>

        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.subtitle}>
          Week {currentWeek}, Day {currentDay}
        </Text>

        <View style={styles.trainerInfo}>
          <Icon name="user" type="feather" size={20} color="#FD6300" />
          <Text style={styles.trainerName}>Trainer: {plan.ptId?.name || 'Unknown'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{currentDayData.level}</Text>
            <Text style={styles.infoValue}>Level</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              {currentDayData.exercises.length}
            </Text>
            <Text style={styles.infoValue}>Exercises</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              {Array.from(new Set(currentDayData.focusArea)).join(", ")}
            </Text>
            <Text style={styles.infoValue}>Focus Area</Text>
          </View>
        </View>

        <Text style={styles.exercisesTitle}>
          Today's Exercises ({currentDayData.exercises.length})
        </Text>

        {currentDayData.exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseItem}>
            <Image
              source={{ uri: exercise.gifUrl || '/placeholder.gif' }}
              style={styles.exerciseImage}
              resizeMode="cover"
            />
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseDetails}>
                {exercise.sets} sets × {exercise.reps} reps
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            navigation.navigate("Workout", {
              exercises: currentDayData.exercises.map(exercise => ({
                ...exercise,
                level: currentDayData.level
              })),
              planId: planId,
              week: currentWeek,
              day: currentDay,
              planType: 'pt'
            })
          }
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  scrollViewContainer: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    right:170
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  trainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  trainerName: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoValue: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  exercisesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#333333',
  },
  exerciseInfo: {
    marginLeft: 15,
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exerciseDetails: {
    color: '#888888',
    fontSize: 14,
    marginTop: 4,
  },
  startButton: {
    backgroundColor: '#FD6300',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PTPlansDetail;