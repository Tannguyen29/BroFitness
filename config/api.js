import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '@env';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
    
    if (token) {
      const response = await apiClient.get('/user-info', {
        headers: { 'x-auth-token': token }
      });
      
      const { name, personalInfo, avatarUrl, role } = response.data;
      const { gender, age, weight, height } = personalInfo;
      
      return { 
        token, 
        name, 
        personalInfoCompleted: true,
        gender,
        age,
        weight,
        height,
        avatarUrl,

        role

      };
    }
    
    return { 
      token: null, 
      name: null, 
      personalInfoCompleted: false, 
      avatarUrl: null,
      role: 'free' 
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return { 
      token: null, 
      name: null, 
      personalInfoCompleted: false, 
      avatarUrl: null,
      role: 'free'
    };
  }
};

export const updateUserInfo = async (userData) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await axios.put(`${API_BASE_URL}/user-info`, userData, {
      headers: { 'x-auth-token': token }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user info:', error);
    throw error;
  }
};

export const uploadAvatar = async (uri) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const formData = new FormData();
    
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('avatar', {
      uri,
      name: `avatar.${fileType}`,
      type: `image/${fileType}`
    });

    const response = await axios.post(`${API_BASE_URL}/upload-avatar`, formData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.avatarUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
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
    const response = await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error verifying OTP';
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/resend-otp`, { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error resending OTP';
  }
};

export const sendResetPasswordEmail = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/send-otp`, { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error sending OTP';
  }
};

export const resetPassword = async (email, newPassword, confirmPassword) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/resetpassword`, {
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
    const response = await axios.post(`${API_BASE_URL}/signin`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error signing in';
  }
};

export const signUp = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup`, { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'Error signing up';
  }
};

export const submitPersonalInfo = async (personalInfo) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await axios.post(`${API_BASE_URL}/personal-information-setup`, personalInfo, {
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