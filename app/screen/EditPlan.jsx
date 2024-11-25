import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const EditPlan = ({ route, navigation }) => {
  const { planId } = route.params;
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [fitnessGoals, setFitnessGoals] = useState([]);
  const [equipmentNeeded, setEquipmentNeeded] = useState([]);
  const [activityLevels, setActivityLevels] = useState([]);
  const [weeks, setWeeks] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [exercises, setExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);

  useEffect(() => {
    fetchPlanDetails();
    fetchAvailableStudents();
    fetchExercises();
  }, []);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/pt-plans/${planId}`, {
        headers: { 'x-auth-token': token }
      });
      
      const plan = response.data;
      

      setTitle(plan.title);
      setSelectedStudents(plan.students.map(student => student.studentId._id || student.studentId));
      setExperienceLevels(plan.targetAudience.experienceLevels || []);
      setFitnessGoals(plan.targetAudience.fitnessGoals || []);
      setEquipmentNeeded(plan.targetAudience.equipmentNeeded || []);
      setActivityLevels(plan.targetAudience.activityLevels || []);
      setWeeks(plan.duration.weeks.toString());
      setDaysPerWeek(plan.duration.daysPerWeek.toString());

      const transformedExercises = [];
      plan.weeks.forEach(week => {
        week.days.forEach(day => {
          day.exercises.forEach(exercise => {
            transformedExercises.push({
              weekNumber: week.weekNumber,
              dayNumber: day.dayNumber,
              exercise: {
                _id: exercise.exerciseId,
                name: exercise.name,
                duration: exercise.duration,
                sets: exercise.sets,
                reps: exercise.reps,
                type: exercise.type,
                gifUrl: exercise.gifUrl
              }
            });
          });
        });
      });
      setExercises(transformedExercises);
    } catch (error) {
      console.error('Error fetching plan details:', error);
      Alert.alert('Error', 'Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/pro-users`, {
        headers: { 'x-auth-token': token }
      });
      setAvailableStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchExercises = async () => {
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

  const handleUpdatePlan = async () => {
    try {
      if (!title.trim()) {
        Alert.alert('Error', 'Please enter a plan title');
        return;
      }
      if (!weeks || parseInt(weeks) <= 0) {
        Alert.alert('Error', 'Please enter a valid number of weeks');
        return;
      }
      if (!daysPerWeek || parseInt(daysPerWeek) <= 0) {
        Alert.alert('Error', 'Please enter a valid number of days per week');
        return;
      }
      if (selectedStudents.length === 0) {
        Alert.alert('Error', 'Please select at least one student');
        return;
      }
      if (experienceLevels.length === 0) {
        Alert.alert('Error', 'Please select at least one experience level');
        return;
      }
      if (fitnessGoals.length === 0) {
        Alert.alert('Error', 'Please select at least one fitness goal');
        return;
      }
      if (equipmentNeeded.length === 0) {
        Alert.alert('Error', 'Please select at least one equipment type');
        return;
      }
      if (exercises.length === 0) {
        Alert.alert('Error', 'Please add at least one exercise to the plan');
        return;
      }

      const token = await AsyncStorage.getItem('userToken');
      const planData = {
        title,
        targetAudience: {
          experienceLevels,
          fitnessGoals,
          equipmentNeeded,
          activityLevels,
        },
        duration: {
          weeks: parseInt(weeks),
          daysPerWeek: parseInt(daysPerWeek),
        },
        students: selectedStudents,
        exercises: exercises.map(ex => ({
          weekNumber: ex.weekNumber,
          dayNumber: ex.dayNumber,
          exercise: ex.exercise
        }))
      };

      await axios.put(`${API_BASE_URL}/pt-plans/${planId}`, planData, {
        headers: { 'x-auth-token': token }
      });

      Alert.alert('Success', 'Plan updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating plan:', error);
      Alert.alert('Error', 'Failed to update plan');
    }
  };

  const handleAddExercise = () => {
    navigation.navigate('ExerciseSelector', {
      weekNumber: currentWeek,
      dayNumber: currentDay,
      experienceLevels,
      equipmentNeeded,
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const exercisesString = await AsyncStorage.getItem('selectedExercises');
        if (exercisesString) {
          const data = JSON.parse(exercisesString);
          setExercises(prevExercises => [
            ...prevExercises,
            ...data.exercises.map(exercise => ({
              weekNumber: data.weekNumber,
              dayNumber: data.dayNumber,
              exercise: exercise
            }))
          ]);
          await AsyncStorage.removeItem('selectedExercises');
        }
      } catch (error) {
        console.error('Error getting selected exercises:', error);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const renderStudentSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Students</Text>
      <ScrollView style={styles.selectionContainer}>
        {availableStudents.map((student) => (
          <TouchableOpacity
            key={student._id}
            style={[
              styles.selectionItem,
              selectedStudents.includes(student._id) && styles.selectedItem
            ]}
            onPress={() => {
              if (selectedStudents.includes(student._id)) {
                setSelectedStudents(selectedStudents.filter(id => id !== student._id));
              } else {
                setSelectedStudents([...selectedStudents, student._id]);
              }
            }}
          >
            <Text style={styles.selectionText}>{student.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTargetAudienceSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Target Audience</Text>
      
      <Text style={styles.label}>Experience Levels</Text>
      <View style={styles.checkboxGroup}>
        {['beginner', 'intermediate', 'advanced'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.checkbox,
              experienceLevels.includes(level) && styles.checkedBox
            ]}
            onPress={() => {
              if (experienceLevels.includes(level)) {
                setExperienceLevels(experienceLevels.filter(l => l !== level));
              } else {
                setExperienceLevels([...experienceLevels, level]);
              }
            }}
          >
            <Text style={styles.checkboxText}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Fitness Goals</Text>
      <View style={styles.checkboxGroup}>
        {['loseWeight', 'buildMuscle', 'keepFit'].map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[
              styles.checkbox,
              fitnessGoals.includes(goal) && styles.checkedBox
            ]}
            onPress={() => {
              if (fitnessGoals.includes(goal)) {
                setFitnessGoals(fitnessGoals.filter(g => g !== goal));
              } else {
                setFitnessGoals([...fitnessGoals, goal]);
              }
            }}
          >
            <Text style={styles.checkboxText}>{goal}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Equipment Needed</Text>
      <View style={styles.checkboxGroup}>
        {['body weight', 'dumbbell', 'barbell'].map((equipment) => (
          <TouchableOpacity
            key={equipment}
            style={[
              styles.checkbox,
              equipmentNeeded.includes(equipment) && styles.checkedBox
            ]}
            onPress={() => {
              if (equipmentNeeded.includes(equipment)) {
                setEquipmentNeeded(equipmentNeeded.filter(e => e !== equipment));
              } else {
                setEquipmentNeeded([...equipmentNeeded, equipment]);
              }
            }}
          >
            <Text style={styles.checkboxText}>{equipment}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderWorkoutPlanner = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Workout Schedule</Text>
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, currentWeek === 1 && styles.disabledButton]}
          onPress={() => setCurrentWeek(currentWeek - 1)}
          disabled={currentWeek === 1}
        >
          <Text style={styles.navButtonText}>Previous Week</Text>
        </TouchableOpacity>
        
        <Text style={styles.weekText}>Week {currentWeek}</Text>
        
        <TouchableOpacity
          style={[styles.navButton, currentWeek === parseInt(weeks) && styles.disabledButton]}
          onPress={() => setCurrentWeek(currentWeek + 1)}
          disabled={currentWeek === parseInt(weeks)}
        >
          <Text style={styles.navButtonText}>Next Week</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dayButtons}>
        {[...Array(parseInt(daysPerWeek))].map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              currentDay === index + 1 && styles.selectedDayButton
            ]}
            onPress={() => setCurrentDay(index + 1)}
          >
            <Text style={styles.dayButtonText}>Day {index + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.exerciseSection}>
        <Text style={styles.label}>Add Exercises for Day {currentDay}</Text>
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={handleAddExercise}
        >
          <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
        </TouchableOpacity>

        <ScrollView style={styles.exerciseList}>
          {exercises
            .filter(e => e.weekNumber === currentWeek && e.dayNumber === currentDay)
            .map((exerciseItem, index) => (
              <View key={index} style={styles.exerciseItem}>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseName}>
                    {exerciseItem.exercise.name}
                  </Text>
                  <View style={styles.exerciseParams}>
                    <Text style={styles.paramText}>
                      Sets: {exerciseItem.exercise.sets || 0}
                    </Text>
                    <Text style={styles.paramText}>
                      Reps: {exerciseItem.exercise.reps || 0}
                    </Text>
                    <Text style={styles.paramText}>
                      Duration: {exerciseItem.exercise.duration || 0} min
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    setExercises(exercises.filter((_, i) => i !== index));
                  }}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading plan details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Plan</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Plan Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter plan title"
          placeholderTextColor="#666"
        />
      </View>

      {renderStudentSelection()}
      {renderTargetAudienceSection()}

      <View style={styles.section}>
        <Text style={styles.label}>Duration</Text>
        <View style={styles.durationContainer}>
          <TextInput
            style={[styles.input, styles.durationInput]}
            value={weeks}
            onChangeText={setWeeks}
            placeholder="Weeks"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.durationInput]}
            value={daysPerWeek}
            onChangeText={setDaysPerWeek}
            placeholder="Days/Week"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>
      </View>

      {weeks && daysPerWeek && renderWorkoutPlanner()}

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdatePlan}
      >
        <Text style={styles.updateButtonText}>Update Plan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    marginBottom: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationInput: {
    width: '48%',
  },
  selectionContainer: {
    maxHeight: 200,
  },
  selectionItem: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedItem: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: 'coral',
  },
  selectionText: {
    color: 'white',
    fontSize: 16,
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  checkbox: {
    backgroundColor: '#1A1A1A',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  checkedBox: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: 'coral',
  },
  checkboxText: {
    color: 'white',
    fontSize: 14,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 8,
    width: 120,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  weekText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayButton: {
    backgroundColor: '#1A1A1A',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 80,
  },
  selectedDayButton: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: 'coral',
  },
  dayButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  exerciseSection: {
    marginTop: 16,
  },
  exerciseList: {
    maxHeight: 200,
  },
  exerciseItem: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseDetails: {
    flex: 1,
    marginRight: 10,
  },
  exerciseName: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  exerciseParams: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paramText: {
    color: '#888',
    fontSize: 12,
  },
  addExerciseButton: {
    backgroundColor: 'coral',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addExerciseButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#FF4444',
    padding: 8,
    borderRadius: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  updateButton: {
    backgroundColor: 'coral',
    padding: 16,
    borderRadius: 8,
    margin: 20,
    marginBottom: 70,
  },
  updateButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditPlan;