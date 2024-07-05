import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.55:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const saveUserInfo = async (token, name, personalInfoCompleted) => {
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
    await AsyncStorage.setItem('personalInfoCompleted', JSON.stringify(personalInfoCompleted));
  } catch (error) {
    console.error('Error saving user info:', error);
  }
};

export const getUserInfo = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const name = await AsyncStorage.getItem('userName');
    const personalInfoCompleted = JSON.parse(await AsyncStorage.getItem('personalInfoCompleted')) || false;
    return { token, name, personalInfoCompleted };
  } catch (error) {
    console.error('Error getting user info:', error);
    return { token: null, name: null, personalInfoCompleted: false };
  }
};

export const clearUserInfo = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userName');
    await AsyncStorage.removeItem('personalInfoCompleted');
  } catch (error) {
    console.error('Error clearing user info:', error);
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error verifying OTP';
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/resend-otp`, { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error resending OTP';
  }
};

export const sendResetPasswordEmail = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/send-otp`, { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error sending OTP';
  }
};

export const resetPassword = async (email, newPassword, confirmPassword) => {
  try {
    const response = await axios.post(`${API_URL}/resetpassword`, {
      email,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Error resetting password');
  }
};

export const signIn = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error signing in';
  }
};

export const signUp = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error signing up';
  }
};

export const submitPersonalInfo = async (personalInfo) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await axios.post(`${API_URL}/personal-information-setup`, personalInfo, {
      headers: {
        'x-auth-token': token
      }
    });
    await AsyncStorage.setItem('personalInfoCompleted', 'true');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error submitting personal information';
  }
};

export default apiClient;