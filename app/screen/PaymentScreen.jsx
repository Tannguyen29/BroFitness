import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const PaymentScreen = ({ route, navigation }) => {
  const { plan } = route.params;
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Test card details
  const TEST_CARD = {
    number: '4242424242424242',
    expiry: '12/25',
    cvv: '123',
    name: 'Test User'
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      // Validate payment method selection
      if (!paymentMethod) {
        Alert.alert('Error', 'Please select a payment method');
        return;
      }
  
      // Validate card details only for visa payment
      if (paymentMethod === 'visa') {
        if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
          Alert.alert('Error', 'Please fill in all card details');
          return;
        }
  
        if (cardNumber !== TEST_CARD.number || 
            expiryDate !== TEST_CARD.expiry || 
            cvv !== TEST_CARD.cvv) {
          Alert.alert('Error', 'Invalid card details. Please use test card.');
          return;
        }
      }
  
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }
  
      // Make sure API_BASE_URL ends without a trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      
      const response = await axios.post(`${baseUrl}/api/process-payment`, {
        planId: plan.id,
        planDuration: plan.duration,
        amount: plan.totalPrice,
        paymentMethod: paymentMethod
      }, {
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data.success) {
        Alert.alert(
          'Success',
          'Payment processed successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('BottomTabs')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Payment Error:', error);
      const errorMessage = error.response?.data?.message || 'Payment failed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return text;
    }
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>
      
      <View style={styles.paymentMethods}>
        <TouchableOpacity 
          style={[
            styles.methodCard,
            paymentMethod === 'visa' && styles.selectedMethod
          ]}
          onPress={() => setPaymentMethod('visa')}
        >
          <Text style={styles.methodText}>Visa Card</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.methodCard,
            paymentMethod === 'test' && styles.selectedMethod
          ]}
          onPress={() => setPaymentMethod('test')}
        >
          <Text style={styles.methodText}>Test Payment</Text>
        </TouchableOpacity>
      </View>

      {paymentMethod === 'visa' && (
        <View style={styles.cardForm}>
          <Text style={styles.testCardInfo}>
            Test Card: {TEST_CARD.number}, {TEST_CARD.expiry}, {TEST_CARD.cvv}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            placeholderTextColor="#8E8E93"
            value={cardNumber}
            onChangeText={(text) => setCardNumber(formatCardNumber(text))}
            maxLength={19}
            keyboardType="numeric"
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="MM/YY"
              placeholderTextColor="#8E8E93"
              value={expiryDate}
              onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
              maxLength={5}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="CVV"
              placeholderTextColor="#8E8E93"
              value={cvv}
              onChangeText={setCvv}
              maxLength={3}
              keyboardType="numeric"
              secureTextEntry
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Card Holder Name"
            placeholderTextColor="#8E8E93"
            value={cardHolderName}
            onChangeText={setCardHolderName}
          />
        </View>
      )}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Plan Duration</Text>
          <Text style={styles.summaryValue}>{plan.duration} {plan.label}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>{plan.totalPrice.toLocaleString()} ₫</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.payButton}
        onPress={handlePayment}
      >
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  methodCard: {
    flex: 1,
    backgroundColor: '#2c2c2e',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMethod: {
    borderColor: '#FD6300',
  },
  methodText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardForm: {
    marginTop: 20,
  },
  testCardInfo: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#2c2c2e',
    padding: 15,
    borderRadius: 10,
    color: 'white',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  summaryContainer: {
    backgroundColor: '#2c2c2e',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  summaryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    color: '#8E8E93',
  },
  summaryValue: {
    color: 'white',
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#FD6300',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;