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

const PlanDetailPage = ({ route }) => {
  const navigation = useNavigation();
  const { planId, week, day, completeWorkout } = route.params;
  const [plan, setPlan] = useState(null);
  const [exerciseDetails, setExerciseDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanDetails();
  }, [week, day]);

  const fetchPlanDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/plans/${planId}`);
      setPlan(response.data);
      await fetchExerciseDetails(response.data.weeks[week - 1].days[day - 1].exercises);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching plan details:", error);
      setLoading(false);
    }
  };

  const fetchExerciseDetails = async (exercises) => {
    const details = {};
    for (let exercise of exercises) {
      try {
        const response = await axios.get(`${API_BASE_URL}/exercise-details/${exercise.name}`);
        details[exercise.name] = response.data;
      } catch (error) {
        console.error(`Error fetching details for ${exercise.name}:`, error);
      }
    }
    setExerciseDetails(details);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load plan details</Text>
      </SafeAreaView>
    );
  }

  const currentDay = plan.weeks[week - 1].days[day - 1];

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
          Week {week}, Day {day}
        </Text>
        <Text style={styles.description}>{plan.description}</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{currentDay.level}</Text>
            <Text style={styles.infoValue}>Level</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{currentDay.totalTime}</Text>
            <Text style={styles.infoValue}>Time</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              {currentDay.focusArea.join(", ")}
            </Text>
            <Text style={styles.infoValue}>Focus Area</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsButtonText}>Workout Settings</Text>
          <Text style={styles.settingsButtonSubtext}>
            Sounds, Music, Coach...
          </Text>
        </TouchableOpacity>

        <Text style={styles.exercisesTitle}>
          Exercises ({currentDay.exercises.length})
        </Text>

        {currentDay.exercises.map((exercise, index) => {
          const details = exerciseDetails[exercise.name];
          return (
            <View key={index} style={styles.exerciseItem}>
              {details && details.gifUrl ? (
                <Image
                  source={{ uri: details.gifUrl }}
                  style={styles.exerciseImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[styles.exerciseImage, { backgroundColor: "#ccc" }]}
                />
              )}
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.duration
                    ? `${exercise.duration} seconds`
                    : `x ${exercise.reps}`}
                </Text>
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            navigation.navigate("Workout", {
              exercises: currentDay.exercises.map((exercise) => ({
                ...exercise,
                gifUrl: exerciseDetails[exercise.name]?.gifUrl,
                level: currentDay.level,
              })),
              planId: planId,
              week: week,
              day: day
            })
          }
        >
          <Text style={styles.startButtonText}>Start</Text>
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
    backgroundColor: '#000000',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    marginTop: 60,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoValue: {
    fontSize: 14,
    color: '#888888',
  },
  settingsButton: {
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsButtonSubtext: {
    color: '#888888',
    fontSize: 14,
  },
  exercisesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  exerciseInfo: {
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
  },
  startButton: {
    backgroundColor: '#FD6300',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PlanDetailPage;
