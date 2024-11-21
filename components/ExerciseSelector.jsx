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
  const { weekNumber, dayNumber, experienceLevels, equipmentNeeded } = route.params;
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

  const handleDone = async () => {
    try {
      if (selectedExercises.length > 0) {
        const data = {
          exercises: selectedExercises,
          weekNumber: weekNumber,
          dayNumber: dayNumber
        };
        await AsyncStorage.setItem('selectedExercises', JSON.stringify(data));
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving selected exercises:', error);
    }
  };

  const filteredExercises = availableExercises.filter(exercise =>
    (experienceLevels.length === 0 || 
     experienceLevels.includes(exercise.difficulty)) &&
    (equipmentNeeded.length === 0 || 
     equipmentNeeded.includes(exercise.equipment)) &&
    (focusAreas.length === 0 || 
     focusAreas.every(area => exercise.bodyPart?.includes(area)))
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

      {(experienceLevels.length > 0 || equipmentNeeded.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.label}>Active Filters:</Text>
          {experienceLevels.length > 0 && (
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Experience Levels:</Text>
              <Text style={styles.filterValue}>
                {experienceLevels.join(', ')}
              </Text>
            </View>
          )}
          {equipmentNeeded.length > 0 && (
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Equipment:</Text>
              <Text style={styles.filterValue}>
                {equipmentNeeded.join(', ')}
              </Text>
            </View>
          )}
        </View>
      )}

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
              <Text style={[
                styles.checkboxText,
                focusAreas.includes(area) && styles.checkedText
              ]}>
                {area}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          Available Exercises {filteredExercises.length > 0 && `(${filteredExercises.length})`}
        </Text>
        <ScrollView style={styles.exerciseList}>
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise._id}
                style={[
                  styles.exerciseItem,
                  selectedExercises.includes(exercise) && styles.selectedExercise
                ]}
                onPress={() => handleExerciseSelect(exercise)}
              >
                <Text style={[
                  styles.exerciseName,
                  selectedExercises.includes(exercise) && styles.selectedText
                ]}>
                  {exercise.name}
                </Text>
                <Text style={styles.muscleGroups}>
                  {exercise.targetMuscleGroups?.join(', ') || 'N/A'}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noExercisesText}>
              No exercises found for selected focus areas
            </Text>
          )}
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
  checkedText: {
    color: '#000000',
  },
  selectedText: {
    color: '#000000',
  },
  noExercisesText: {
    color: '#999999',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    color: '#999999',
    marginRight: 8,
  },
  filterValue: {
    color: 'coral',
    flex: 1,
  },
});

export default ExerciseSelector;