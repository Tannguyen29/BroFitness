import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentMethodScreen = ({ route, navigation }) => {
  const { plan } = route.params;
  const [selectedMethod, setSelectedMethod] = useState(null);

  const paymentMethods = [
    {
      id: 'visa',
      name: 'Credit/Debit Card',
      description: 'Pay with Visa, Mastercard',
      icon: require('../../assets/visa-icon.png') // Make sure to add this image
    },
    {
      id: 'test',
      name: 'Test Payment',
      description: 'For testing purposes only',
      icon: require('../../assets/visa-icon.png') // Make sure to add this image
    }
  ];

  const handleContinue = () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    navigation.navigate('PaymentDetails', {
      plan: plan,
      paymentMethod: selectedMethod
    });
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
          style={[
            styles.continueButton,
            !selectedMethod && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedMethod}
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