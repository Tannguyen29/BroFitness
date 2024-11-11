import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PremiumPlans = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('12months');

  const plans = [
    {
      id: '1month',
      duration: 1,
      label: 'Month',
      pricePerWeek: 62250,
      totalPrice: 249000,
      period: 'each month'
    },
    {
      id: '12months',
      duration: 12,
      label: 'Months',
      pricePerWeek: 19354,
      totalPrice: 929000,
      period: 'each year',
      isHottest: true
    },
    {
      id: '3months',
      duration: 3,
      label: 'Months',
      pricePerWeek: 41583,
      totalPrice: 499000,
      period: 'each quarter'
    }
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      const selectedPlanData = plans.find(plan => plan.id === selectedPlan);
      navigation.navigate('PaymentMethod', { plan: selectedPlanData });
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
        
        <View style={styles.headerSection}>
          <Image 
            source={require('../assets/Equipment/None.png')}  
            style={styles.headerImage}
          />
          <Text style={styles.title}>GET PERSONALIZED PLAN!</Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity 
              key={plan.id}
              onPress={() => handleSelectPlan(plan.id)}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.selectedPlan,
                plan.id === '12months' && selectedPlan === '12months' && styles.hottestPlan
              ]}
            >
              {plan.isHottest && selectedPlan === '12months' && (
                <View style={styles.hottestLabel}>
                  <Text style={styles.hottestText}>HOTTEST</Text>
                </View>
              )}
              <Text style={styles.duration}>{plan.duration}</Text>
              <Text style={styles.durationLabel}>{plan.label}</Text>
              <Text style={styles.pricePerWeek}>
                {plan.pricePerWeek.toLocaleString()} ₫/week
              </Text>
              <Text style={styles.totalPrice}>
                {plan.totalPrice.toLocaleString()} ₫
              </Text>
              <Text style={styles.period}>{plan.period}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>CONTINUE</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          Payment will be charged to your account at confirmation of purchase. Subscriptions will automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period. Your account will be charged for renewal, in accordance with your plan, within 24 hours prior to the end of the current period.
        </Text>
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
  headerSection: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#2c2c2e',
    borderRadius: 10,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    borderColor: '#FD6300',
  },
  hottestPlan: {
    borderColor: '#FD6300',
  },
  hottestLabel: {
    backgroundColor: '#FD6300',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    position: 'absolute',
    top: -15,
  },
  hottestText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  duration: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  durationLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  pricePerWeek: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 5,
  },
  totalPrice: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  period: {
    fontSize: 14,
    color: '#FD6300',
  },
  continueButton: {
    backgroundColor: '#FD6300',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimerText: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
});

export default PremiumPlans;