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
      
      const scheduleResponse = await axios.get(`${API_BASE_URL}/student-schedules`, {
        headers: { 'x-auth-token': token }
      });
      setSchedules(scheduleResponse.data);

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
    navigation.navigate('PTPlansOverview', { selectedPlanId: plan._id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FD6300" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#FD6300"
        />
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
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  section: {
    padding: 16,
  },
  sectionPt: {
    padding: 16,
    marginBottom: 70
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 16,
    marginTop: 8,
  },
  scheduleItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scheduleInfo: {
    marginBottom: 8,
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  trainerName: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    padding: 14,
    borderRadius: 25,
    width: '48%',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#FD6300',
  },
  rejectButton: {
    backgroundColor: '#444444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  status: {
    textAlign: 'right',
    fontWeight: '600',
    marginTop: 8,
  },
  accepted: {
    color: '#FD6300',
  },
  rejected: {
    color: '#666666',
  },
  planItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  planDetails: {
    gap: 4,
  },
  planInfo: {
    fontSize: 14,
    color: '#999999',
  },
});

export default PersonalTraining;