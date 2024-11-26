import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const PTPlans = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    fetchPlans();   
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPlans();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/pt-plans`, {
        headers: { 'x-auth-token': token }
      });
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const navigateToCreatePlan = () => {
    navigation.navigate('CreatePlan');
  };

  const handleEditPlan = (plan) => {
    navigation.navigate('EditPlan', { planId: plan._id });
  };

  const handleViewProgress = async (plan) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.get(
        `${API_BASE_URL}/pt-plan-progress/${plan._id}/students-progress`,
        { headers: { 'x-auth-token': token } }
      );

      const updatedPlan = {
        ...plan,
        students: response.data.students
      };

      setSelectedPlan(updatedPlan);
      setShowProgress(true);
    } catch (error) {
      console.error('Error fetching students progress:', error);
      Alert.alert(
        'Error', 
        'Failed to load students progress. Please try again.'
      );
    }
  };

  const renderProgressModal = () => (
    <Modal
      visible={showProgress}
      transparent
      animationType="slide"
      onRequestClose={() => setShowProgress(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Student Progress</Text>
          <ScrollView>
            {selectedPlan?.students.map((student) => (
              <View key={student.studentId} style={styles.progressItem}>
                <Text style={styles.studentName}>{student.name}</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${(student.completedWorkouts.length / 
                          (selectedPlan.duration.weeks * selectedPlan.duration.daysPerWeek)) * 100}%` 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {student.completedWorkouts.length} / 
                  {selectedPlan.duration.weeks * selectedPlan.duration.daysPerWeek} days completed
                </Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowProgress(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPlanItem = ({ item }) => (
    <View style={styles.planItem}>
      <Text style={styles.planTitle}>{item.title}</Text>
      <Text style={styles.planInfo}>
        Duration: {item.duration.weeks} weeks, {item.duration.daysPerWeek} days/week
      </Text>
      <Text style={styles.planInfo}>
        Experience Levels: {item.targetAudience.experienceLevels.join(', ')}
      </Text>
      <Text style={styles.planInfo}>
        Equipment: {item.targetAudience.equipmentNeeded.join(', ')}
      </Text>
      <Text style={styles.planInfo}>
        Students: {item.students.length}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleEditPlan(item)}
        >
          <Text style={styles.buttonText}>Edit Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleViewProgress(item)}
        >
          <Text style={styles.buttonText}>View Progress</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>My Training Plans</Text>
      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPlans}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : plans.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noPlansText}>No plans created yet</Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          renderItem={renderPlanItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchPlans}
        />
      )}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={navigateToCreatePlan}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      {renderProgressModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 60,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 20,
    marginBottom: 20,
  },
  listContainer: {
    padding: 16,
  },
  planItem: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  planInfo: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 8,
    width: '48%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: 'coral',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
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
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressItem: {
    marginBottom: 16,
  },
  studentName: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'coral',
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: 'coral',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: 'coral',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noPlansText: {
    color: '#888',
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default PTPlans;