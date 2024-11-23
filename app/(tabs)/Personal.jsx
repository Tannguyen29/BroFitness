import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const PersonalTraining = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const [personalPlans, setPersonalPlans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Fetch schedules
      const scheduleResponse = await axios.get(`${API_BASE_URL}/student-schedules`, {
        headers: { 'x-auth-token': token }
      });
      setSchedules(scheduleResponse.data);

      // Fetch personal plans
      const plansResponse = await axios.get(`${API_BASE_URL}/student-pt-plans`, {
        headers: { 'x-auth-token': token }
      });
      setPersonalPlans(plansResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const handleScheduleResponse = async (scheduleId, status) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put(
        `${API_BASE_URL}/schedules/${scheduleId}`,
        { status },
        { headers: { 'x-auth-token': token } }
      );
      fetchData();
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const navigateToPTPlanOverview = (plan) => {
    navigation.navigate('PTPlansOverview', { plan });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Training Schedule</Text>
        {schedules.length === 0 ? (
          <Text style={styles.noDataText}>No scheduled sessions yet</Text>
        ) : (
          schedules.map((schedule) => (
            <View key={schedule._id} style={styles.scheduleItem}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleDate}>
                  Date: {formatDate(schedule.date)}
                </Text>
                <Text style={styles.scheduleTime}>
                  Time: {schedule.startTime} - {schedule.endTime}
                </Text>
                <Text style={styles.trainerName}>
                  Trainer: {schedule.ptName}
                </Text>
              </View>
              {schedule.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => handleScheduleResponse(schedule._id, 'accepted')}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleScheduleResponse(schedule._id, 'rejected')}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
              {schedule.status !== 'pending' && (
                <Text style={[
                  styles.status,
                  schedule.status === 'accepted' ? styles.accepted : styles.rejected
                ]}>
                  {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      <View style={styles.sectionPt}>
        <Text style={styles.sectionTitle}>Personal Training Plans</Text>
        {personalPlans.length === 0 ? (
          <Text style={styles.noDataText}>No personal training plans assigned</Text>
        ) : (
          personalPlans.map((plan) => (
            <TouchableOpacity
              key={plan._id}
              style={styles.planItem}
              onPress={() => navigateToPTPlanOverview(plan)}
            >
              <Text style={styles.planTitle}>{plan.title}</Text>
              <View style={styles.planDetails}>
                <Text style={styles.planInfo}>
                  Level: {plan.targetAudience.experienceLevels.join(', ')}
                </Text>
                <Text style={styles.planInfo}>
                  Goals: {plan.targetAudience.fitnessGoals.join(', ')}
                </Text>
                <Text style={styles.planInfo}>
                  Equipment: {plan.targetAudience.equipmentNeeded.join(', ')}
                </Text>
                <Text style={styles.planInfo}>
                  Duration: {plan.duration.weeks} weeks, {plan.duration.daysPerWeek} days/week
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
  },
  sectionPt:{
    padding: 16,
    marginBottom: 70
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 8,
  },
  scheduleItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  scheduleInfo: {
    marginBottom: 8,
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  trainerName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    padding: 8,
    borderRadius: 4,
    width: '48%',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  status: {
    textAlign: 'right',
    fontWeight: '600',
    marginTop: 8,
  },
  accepted: {
    color: '#4CAF50',
  },
  rejected: {
    color: '#f44336',
  },
  planItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  planDetails: {
    gap: 4,
  },
  planInfo: {
    fontSize: 14,
    color: '#666',
  },
});

export default PersonalTraining;