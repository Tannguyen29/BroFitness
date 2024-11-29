import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { getAvatarSource } from '../../utils/avatarHelper';

const NotificationModal = ({ visible, onClose }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible]);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { 'x-auth-token': token }
      });
      
      setNotifications(response.data.notifications);
      
      // Mark as read
      await axios.post(
        `${API_BASE_URL}/notifications/mark-as-read`,
        {},
        { headers: { 'x-auth-token': token } }
      );
    } catch (error) {
      console.error('Error details:', error.response || error);
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Notifications</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.notificationList}>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <View key={index} style={styles.notificationItem}>
                  <Image 
                    source={getAvatarSource(notification.student)}
                    style={styles.studentAvatar}
                  />
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>New Student Assigned</Text>
                    <Text style={styles.studentName}>{notification.student.name}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No new notifications</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Makes modal slide up from bottom
  },
  modalContent: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%', // Takes up to 80% of screen height
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#FD6300',
    fontSize: 16,
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#FD6300',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentName: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
  notificationTime: {
    color: 'gray',
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default NotificationModal; 