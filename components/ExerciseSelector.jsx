import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const ExerciseSelector = ({ route, navigation }) => {
  const { onSelect } = route.params;
  const [focusAreas, setFocusAreas] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);

  useEffect(() => {
    fetchAvailableExercises();
  }, []);

  const fetchAvailableExercises = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/exercises`, {
        headers: { 'x-auth-token': token }
      });
      setAvailableExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleFocusAreaSelect = (area) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter(a => a !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const handleExerciseSelect = (exercise) => {
    if (selectedExercises.includes(exercise)) {
      setSelectedExercises(selectedExercises.filter(e => e !== exercise));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const handleDone = () => {
    route.params.onSelect(selectedExercises);
    navigation.goBack();
  };

  const filteredExercises = availableExercises.filter(exercise =>
    focusAreas.every(area => exercise.targetMuscleGroups?.includes(area))
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Select Exercises</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Select Focus Areas</Text>
        <View style={styles.checkboxGroup}>
          {["chest", "back", "legs", "shoulders", "arms", "abs"].map((area) => (
            <TouchableOpacity
              key={area}
              style={[
                styles.checkbox,
                focusAreas.includes(area) && styles.checkedBox
              ]}
              onPress={() => handleFocusAreaSelect(area)}
            >
              <Text style={styles.checkboxText}>{area}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Available Exercises</Text>
        <ScrollView style={styles.exerciseList}>
          {filteredExercises.map((exercise) => (
            <TouchableOpacity
              key={exercise._id}
              style={[
                styles.exerciseItem,
                selectedExercises.includes(exercise) && styles.selectedExercise
              ]}
              onPress={() => handleExerciseSelect(exercise)}
            >
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.muscleGroups}>
                {exercise.targetMuscleGroups?.join(', ') || 'N/A'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={handleDone}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'coral',
    fontSize: 16,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  checkbox: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    marginRight: 8,
    marginBottom: 8,
  },
  checkedBox: {
    backgroundColor: 'coral',
  },
  checkboxText: {
    color: 'white',
  },
  exerciseList: {
    maxHeight: 200,
  },
  exerciseItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    marginBottom: 8,
  },
  selectedExercise: {
    backgroundColor: 'coral',
  },
  exerciseName: {
    color: 'white',
  },
  muscleGroups: {
    color: '#999999',
  },
  doneButton: {
    backgroundColor: 'coral',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExerciseSelector;