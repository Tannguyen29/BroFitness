import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.2.28:5000';

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

export const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post('http://192.168.2.28:5000/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error verifying OTP';
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await axios.post('http://192.168.2.28:5000/resend-otp', { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error resending OTP';
  }
};
export const sendResetPasswordEmail = async (email) => {
  try {
    const response = await axios.post('http://192.168.2.28:5000/send-otp', { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error sending OTP';
  }
};

export const resetPassword = async(email, newPassword, confirmPassword) => {
  try {
    const response = await axios.post('http://192.168.2.28:5000/resetpassword',{
      email,
      newPassword,
      confirmPassword,
    });
    return response.data;
  }catch (error){
    throw new Error(error.response?.data || 'Error resetting password');
  }
};
export default apiClient;
