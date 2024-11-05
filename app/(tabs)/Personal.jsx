import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const Personal = () => {
  const [schedules, setSchedules] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedules = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/student-schedules`, {
        headers: { 'x-auth-token': token }
      });
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSchedules().finally(() => setRefreshing(false));
  }, []);

  const handleScheduleResponse = async (scheduleId, status) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put(`${API_BASE_URL}/schedules/${scheduleId}`, 
        { status },
        { headers: { 'x-auth-token': token } }
      );
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>My Training Schedule</Text>
      {schedules.length === 0 ? (
        <Text style={styles.noSchedule}>No scheduled sessions yet</Text>
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
              <Text style={styles.ptName}>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noSchedule: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  scheduleItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  scheduleInfo: {
    marginBottom: 10,
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  ptName: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  status: {
    textAlign: 'right',
    fontWeight: 'bold',
    marginTop: 10,
  },
  accepted: {
    color: '#4CAF50',
  },
  rejected: {
    color: '#f44336',
  },
});

export default Personal;