import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const CreatePlan = ({ navigation }) => {
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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    fetchAvailableStudents();
    fetchExercises();
  }, []);

  const fetchAvailableStudents = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/pt-plans/pro-users`, {
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

  const handleCreatePlan = async () => {
    try {
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

      await axios.post(`${API_BASE_URL}/pt-plans`, planData, {
        headers: { 'x-auth-token': token }
      });

      Alert.alert('Success', 'Plan created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating plan:', error);
      Alert.alert('Error', 'Failed to create plan');
    }
  };

  const handleViewStudentInfo = async (student) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        `${API_BASE_URL}/pt-plans/student/${student._id}`,
        { headers: { 'x-auth-token': token } }
      );
      setSelectedStudent(response.data);
      setShowStudentModal(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
      Alert.alert('Error', 'Failed to load student details');
    }
  };

  const renderStudentInfoModal = () => (
    <Modal
      visible={showStudentModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowStudentModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Student Information</Text>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowStudentModal(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>

          {selectedStudent && (
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.studentModalName}>{selectedStudent.name}</Text>
              <Text style={styles.studentModalEmail}>{selectedStudent.email}</Text>

              {selectedStudent.personalInfo && (
                <View style={styles.infoContainer}>
                  <InfoRow label="Gender" value={selectedStudent.personalInfo.gender} />
                  <InfoRow label="Age" value={selectedStudent.personalInfo.age} />
                  <InfoRow label="Height" value={`${selectedStudent.personalInfo.height} cm`} />
                  <InfoRow label="Weight" value={`${selectedStudent.personalInfo.weight} kg`} />
                  <InfoRow label="Goal Weight" value={`${selectedStudent.personalInfo.goalWeight} kg`} />
                  <InfoRow label="Activity Level" value={selectedStudent.personalInfo.physicalActivityLevel} />
                  <InfoRow label="Fitness Goal" value={selectedStudent.personalInfo.fitnessGoal} />
                  <InfoRow label="Equipment" value={selectedStudent.personalInfo.equipment} />
                  <InfoRow label="Experience Level" value={selectedStudent.personalInfo.experienceLevel} />
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderStudentSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Students</Text>
      {availableStudents.length > 0 ? (
        <ScrollView style={styles.selectionContainer}>
          {availableStudents.map((student) => (
            <View key={student._id} style={styles.selectionItem}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentEmail}>{student.email}</Text>
                {student.personalInfo && (
                  <Text style={styles.studentDetails}>
                    Level: {student.personalInfo.experienceLevel} | Goal: {student.personalInfo.fitnessGoal}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => handleViewStudentInfo(student)}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} style={styles.infoIcon} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No premium students assigned to you yet
          </Text>
        </View>
      )}
      {renderStudentInfoModal()}
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
              exercise: {
                ...exercise,
                sets: exercise.sets,
                reps: exercise.reps,
                duration: exercise.duration
              }
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
                  <Text style={styles.exerciseName}>{exerciseItem.exercise.name}</Text>
                  <View style={styles.exerciseParams}>
                    <Text style={styles.paramText}>
                      Sets: {exerciseItem.exercise.sets || 0}
                    </Text>
                    <Text style={styles.paramText}>
                      Reps: {exerciseItem.exercise.reps || 0}
                    </Text>
                    <Text style={styles.paramText}>
                      Duration: {exerciseItem.exercise.duration || 0}m
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Create New Plan</Text>
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
        style={styles.createButton}
        onPress={handleCreatePlan}
      >
        <Text style={styles.createButtonText}>Create Plan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

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
sectionTitle: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 16,
},
label: {
  color: 'white',
  fontSize: 16,
  marginBottom: 8,
},
input: {
  backgroundColor: '#1A1A1A',
  color: 'white',
  padding: 12,
  borderRadius: 8,
  marginBottom: 16,
},
selectionContainer: {
  maxHeight: 200,
},
selectionItem: {
  padding: 12,
  borderRadius: 8,
  backgroundColor: '#1A1A1A',
  marginBottom: 8,
},
selectedItem: {
  backgroundColor: 'coral',
},
selectionText: {
  color: 'white',
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
durationContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
durationInput: {
  width: '48%',
},
navigationButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},
navButton: {
  padding: 8,
  backgroundColor: 'coral',
  borderRadius: 8,
},
disabledButton: {
  opacity: 0.5,
},
navButtonText: {
  color: 'white',
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
  padding: 8,
  backgroundColor: '#1A1A1A',
  borderRadius: 8,
  marginRight: 8,
  marginBottom: 8,
},
selectedDayButton: {
  backgroundColor: 'coral',
},
dayButtonText: {
  color: 'white',
},
exerciseSection: {
  marginTop: 16,
},
addExerciseButton: {
  backgroundColor: 'coral',
  padding: 12,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 16,
},
addExerciseButtonText: {
  color: 'white',
  fontWeight: 'bold',
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
removeButton: {
  backgroundColor: '#FF4444',
  padding: 8,
  borderRadius: 8,
},
removeButtonText: {
  color: 'white',
  fontSize: 14,
},
createButton: {
  backgroundColor: 'coral',
  padding: 16,
  borderRadius: 8,
  margin: 16,
  alignItems: 'center',
},
createButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},
section: {
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#333',
},
sectionTitle: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 16,
},
selectionContainer: {
  maxHeight: 200,
},
selectionItem: {
  padding: 12,
  borderRadius: 8,
  backgroundColor: '#1A1A1A',
  marginBottom: 8,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
studentInfo: {
  flex: 1,
},
studentName: {
  fontSize: 16,
  color: 'white',
  fontWeight: 'bold',
},
studentEmail: {
  fontSize: 14,
  color: '#8E8E93',
  marginTop: 2,
},
studentDetails: {
  fontSize: 12,
  color: '#FD6300',
  marginTop: 4,
},
infoButton: {
  padding: 8,
},
infoIcon: {
  color: '#FD6300',
  fontSize: 18,
},
emptyState: {
  padding: 20,
  alignItems: 'center',
},
emptyStateText: {
  color: '#8E8E93',
  fontSize: 16,
  textAlign: 'center',
},
infoButton: {
  padding: 8,
},
infoIcon: {
  color: '#FD6300',
  fontSize: 18,
},
modalContainer: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: '#1A1A1A',
  width: '90%',
  maxHeight: '80%',
  borderRadius: 12,
  overflow: 'hidden',
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#333',
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: 'white',
},
closeModalButton: {
  padding: 8,
},
closeModalText: {
  color: 'coral',
  fontSize: 16,
},
modalScroll: {
  padding: 16,
},
studentModalName: {
  fontSize: 24,
  fontWeight: 'bold',
  color: 'white',
  marginBottom: 4,
},
studentModalEmail: {
  fontSize: 16,
  color: '#888',
  marginBottom: 16,
},
infoContainer: {
  backgroundColor: '#2A2A2A',
  borderRadius: 8,
  padding: 16,
},
infoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#333',
},
infoLabel: {
  color: '#888',
  fontSize: 16,
},
infoValue: {
  color: 'white',
  fontSize: 16,
  fontWeight: '500',
},
});

export default CreatePlan;