import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, ImageBackground } from 'react-native';
import { Icon } from "@rneui/themed";

const PlanOverview = ({ plan, navigation }) => {
  const [currentDay, setCurrentDay] = useState(1);

  if (!plan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const { weeks, daysPerWeek } = plan.duration;
  const totalDays = weeks * daysPerWeek;
  const completedDays = currentDay - 1;

  const renderWeeks = () => {
    let weekComponents = [];
    for (let week = 1; week <= weeks; week++) {
      const isCurrentWeek = Math.ceil(currentDay / daysPerWeek) === week;
      weekComponents.push(
        <View key={`week-${week}`} style={styles.weekContainer}>
          <View style={styles.weekIconContainer}>
            <View style={[
              styles.flashIconBox,
              isCurrentWeek ? styles.activeFlashIconBox : styles.inactiveFlashIconBox
            ]}>
              <Icon name="flash" type="ionicon" color="#FFFFFF" size={20} />
            </View>
            {week < weeks && <View style={styles.weekConnector} />}
          </View>
          <View style={styles.weekContent}>
            <View style={styles.weekHeader}>
              <Text style={styles.weekTitle}>WEEK {week}</Text>
              <Text style={styles.weekProgress}>{currentDay}/{daysPerWeek}</Text>
            </View>
            <View style={styles.weekBox}>
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
          </View>
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
        <React.Fragment key={`day-${day}`}>
          <View style={styles.dayItem}>
            <View style={[
              styles.dayButton,
              isCompleted && styles.completedDay,
              isCurrent && styles.currentDay
            ]}>
              <Text style={[styles.dayText, (isCompleted || isCurrent) && styles.activeDayText]}>{day}</Text>
            </View>
          </View>
          {day < daysPerWeek && (
            <Icon name="chevron-forward" type="ionicon" color="#333333" size={20} style={styles.dayConnector} />
          )}
        </React.Fragment>
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
          <Icon name="chevron-left" size={30} color="#FFFFFF" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: -10,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 5,
  },
  progressBar: {
    height: 15,
    backgroundColor: '#333333',
    borderRadius: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressPercentage: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'right',
    marginTop: 5,
  },
  weekContainer: {
    flexDirection: 'row',
    marginBottom: 0, 
  },
  weekIconContainer: {
    alignItems: 'center',
    marginRight: 10,
    height: '100%',
  },
  flashIconBox: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  activeFlashIconBox: {
    backgroundColor: '#FD6300',
  },
  inactiveFlashIconBox: {
    backgroundColor: '#444444',
  },
  weekConnector: {
    position: 'absolute',
    top: 30, 
    left: 14,
    width: 2,
    bottom: -30, 
    backgroundColor: '#444444',
  },
  weekContent: {
    flex: 1,
    paddingBottom: 30,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  weekProgress: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  weekBox: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dayItem: {
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
    backgroundColor: '#FD6300',
  },
  currentDay: {
    backgroundColor: '#FD6300',
  },
  dayText: {
    color: '#999999',
    fontSize: 16,
  },
  activeDayText: {
    color: '#FFFFFF',
  },
  dayConnector: {
    marginHorizontal: 2,
  },
  startButton: {
    backgroundColor: '#FD6300',
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
  scrollView: {
    flex: 1,
  },
});

export default PlanOverview;