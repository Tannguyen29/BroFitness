import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.55:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const saveUserInfo = async (token, name) => {
  try {
    if (token) {
      await AsyncStorage.setItem('userToken', token);
    } else {
      await AsyncStorage.removeItem('userToken');
    }
    
    if (name) {
      await AsyncStorage.setItem('userName', name);
    } else {
      await AsyncStorage.removeItem('userName');
    }
  } catch (error) {
    console.error('Error saving user info:', error);
  }
};

export const getUserInfo = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const name = await AsyncStorage.getItem('userName');
    return { token, name };
  } catch (error) {
    console.error('Error getting user info:', error);
    return { token: null, name: null };
  }
};

export const clearUserInfo = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userName');
  } catch (error) {
    console.error('Error clearing user info:', error);
  }
};

export default apiClient;
