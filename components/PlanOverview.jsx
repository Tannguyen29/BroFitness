import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, ImageBackground } from 'react-native';
import { Icon } from "@rneui/themed";

const PlanOverview = ({ plan, navigation }) => {
  const [currentDay, setCurrentDay] = useState(1);

  if (!plan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const { weeks, daysPerWeek } = plan.duration;
  const totalDays = weeks * daysPerWeek;
  const completedDays = currentDay - 1;

  const renderWeeks = () => {
    let weekComponents = [];
    for (let week = 1; week <= weeks; week++) {
      weekComponents.push(
        <View key={`week-${week}`} style={styles.weekContainer}>
          <View style={styles.weekHeader}>
            <Icon name="flash" type="ionicon" color="#0080FF" size={24} />
            <Text style={styles.weekTitle}>WEEK {week}</Text>
            <Text style={styles.weekProgress}>{currentDay}/{daysPerWeek}</Text>
          </View>
          <View style={styles.daysContainer}>
            {renderDays(week)}
          </View>
          {week === 1 && (
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => navigation.navigate('PlanDetail', { planId: plan._id, week: 1, day: currentDay })}
            >
              <Text style={styles.startButtonText}>START</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return weekComponents;
  };

  const renderDays = (week) => {
    let dayComponents = [];
    for (let day = 1; day <= daysPerWeek; day++) {
      const absoluteDay = (week - 1) * daysPerWeek + day;
      const isCompleted = absoluteDay < currentDay;
      const isCurrent = absoluteDay === currentDay;

      dayComponents.push(
        <View key={`day-${day}`} style={styles.dayItem}>
          <View style={[
            styles.dayButton,
            isCompleted && styles.completedDay,
            isCurrent && styles.currentDay
          ]}>
            <Text style={[styles.dayText, (isCompleted || isCurrent) && styles.activeDayText]}>{day}</Text>
          </View>
          {day < daysPerWeek && <View style={styles.dayConnector} />}
        </View>
      );
    }
    return dayComponents;
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={plan.backgroundImage ? { uri: plan.backgroundImage } : require('../assets/banner/banner1.jpg')}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{plan.title.toUpperCase()}</Text>
        <Text style={styles.subtitle}>{plan.subtitle.toUpperCase()}</Text>
      </ImageBackground>
      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{completedDays} / {totalDays} Days Finished</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedDays / totalDays) * 100}%` }]} />
          </View>
          <Text style={styles.progressPercentage}>{Math.round((completedDays / totalDays) * 100)}%</Text>
        </View>
        <ScrollView style={styles.scrollView}>
          {renderWeeks()}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 200,
    justifyContent: 'flex-end',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    backgroundColor: '#000000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0080FF',
    borderRadius: 3,
  },
  progressPercentage: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'right',
    marginTop: 5,
  },
  weekContainer: {
    marginBottom: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
  },
  weekProgress: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedDay: {
    backgroundColor: '#0080FF',
  },
  currentDay: {
    backgroundColor: '#0080FF',
  },
  dayText: {
    color: '#999999',
    fontSize: 14,
  },
  activeDayText: {
    color: '#FFFFFF',
  },
  dayConnector: {
    height: 2,
    width: 10,
    backgroundColor: '#333333',
    marginHorizontal: 2,
  },
  startButton: {
    backgroundColor: '#0080FF',
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlanOverview;