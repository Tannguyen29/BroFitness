import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
const PaymentResultScreen = ({ navigation }) => {
  const route = useRoute();
  const { status, message } = route.params || { status: 'success' };

  useEffect(() => {
    if (status === 'success') {
      const refreshUserData = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
              const response = await axios.get(`${API_BASE_URL}/user-info`, {
                headers: {
                  'x-auth-token': token
                }
              });
              
              console.log(`Retry ${retryCount + 1} - User data:`, response.data);
              
              if (response.data.role === 'premium') {
                await AsyncStorage.setItem('userInfo', JSON.stringify(response.data));
                break;
              }
              
              await new Promise(resolve => setTimeout(resolve, 2000));
              retryCount++;
            }
            
            if (retryCount === maxRetries) {
              console.warn('Failed to confirm premium status after', maxRetries, 'retries');
            }
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      };
      refreshUserData();
    }
  }, [status]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {status === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: 'HomeScreen' }],
          })}
        >
          <Text style={styles.buttonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FD6300',
    padding: 15,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentResultScreen; 