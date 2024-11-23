import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { Icon } from "@rneui/themed";

const PTPlansOverview = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlans = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/student-pt-plans`, {
        headers: { 'x-auth-token': token }
      });
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching PT plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPlans().finally(() => setRefreshing(false));
  }, []);

  const handlePlanPress = (plan) => {
    navigation.navigate('PTPlansDetail', { 
      planId: plan._id,
      planDetails: plan,
      currentWeek: 1,
      currentDay: 1
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FD6300" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
            <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={30} color="#FD6300" />
        </TouchableOpacity>
      <Text style={styles.title}>Your PT Plans</Text>
      {plans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="calendar" type="feather" size={50} color="#666" />
          <Text style={styles.emptyText}>No PT plans assigned yet</Text>
        </View>
      ) : (
        plans.map((plan) => (
          <TouchableOpacity
            key={plan._id}
            style={styles.planCard}
            onPress={() => handlePlanPress(plan)}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.trainerName}>Trainer: {plan.ptName}</Text>
            </View>
            <View style={styles.planInfo}>
              <View style={styles.infoItem}>
                <Icon name="calendar" type="feather" size={16} color="#FD6300" />
                <Text style={styles.infoText}>
                  {plan.duration?.weeks || 0} weeks, {plan.duration?.daysPerWeek || 0} days/week
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="target" type="feather" size={16} color="#FD6300" />
                <Text style={styles.infoText}>
                  {plan.targetAudience?.experienceLevels?.join(', ') || 'N/A'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="flag" type="feather" size={16} color="#FD6300" />
                <Text style={styles.infoText}>
                  {plan.targetAudience?.fitnessGoals?.join(', ') || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${((plan.progress?.length || 0) / ((plan.duration?.weeks || 0) * (plan.duration?.daysPerWeek || 0))) * 100}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {plan.progress?.length || 0}/{(plan.duration?.weeks || 0) * (plan.duration?.daysPerWeek || 0)} workouts completed
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  backButton: {
    marginBottom: 20,
    right:180
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  planCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  planHeader: {
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trainerName: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  planInfo: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FD6300',
    borderRadius: 3,
  },
  progressText: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'right',
  },
});

export default PTPlansOverview;