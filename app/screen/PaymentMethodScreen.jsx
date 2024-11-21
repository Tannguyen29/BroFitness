import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const PaymentMethodScreen = ({ route, navigation }) => {
  const { plan } = route.params;
  const [selectedMethod, setSelectedMethod] = useState('vnpay'); // Default to VNPay

  const paymentMethods = [
    {
      id: 'vnpay',
      name: 'VNPay',
      description: 'Pay with VNPay',
      icon: require('../../assets/visa-icon.png') // Ensure this path is correct
    }
  ];

  const handleContinue = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const requestData = {
        amount: plan.totalPrice,
        duration: plan.duration,
        orderInfo: `Premium Plan ${plan.duration} ${plan.label}`,
        planId: plan.id
      };

      const response = await axios.post(`${API_BASE_URL}/create-payment`, requestData, {
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.paymentUrl) {
        navigation.navigate('WebViewScreen', { 
          url: response.data.paymentUrl
        });
      } else {
        console.error('6. Error: No payment URL in response');
        Alert.alert('Error', 'Failed to create payment URL');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Select Payment Method</Text>
        </View>

        <View style={styles.planSummary}>
          <Text style={styles.summaryTitle}>Plan Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{plan.duration} {plan.label}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price</Text>
            <Text style={styles.summaryValue}>{plan.totalPrice.toLocaleString()} ₫</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price per week</Text>
            <Text style={styles.summaryValue}>{plan.pricePerWeek.toLocaleString()} ₫</Text>
          </View>
        </View>

        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.selectedMethod
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodContent}>
                <Image source={method.icon} style={styles.methodIcon} />
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>
              </View>
              <View style={styles.radioButton}>
                {selectedMethod === method.id && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  planSummary: {
    backgroundColor: '#2c2c2e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#8E8E93',
    fontSize: 16,
  },
  summaryValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  methodsContainer: {
    marginBottom: 30,
  },
  methodCard: {
    backgroundColor: '#2c2c2e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMethod: {
    borderColor: '#FD6300',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  methodDescription: {
    color: '#8E8E93',
    fontSize: 14,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FD6300',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FD6300',
  },
  continueButton: {
    backgroundColor: '#FD6300',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#4c4c4e',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentMethodScreen;