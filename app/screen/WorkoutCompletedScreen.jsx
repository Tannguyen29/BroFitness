import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Icon } from "@rneui/themed";

const WorkoutCompletedScreen = ({ route, navigation }) => {
  const { exercises, totalTime, calories } = route.params;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.shareText}>SHARE</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>WORKOUT COMPLETED!</Text>
        <Text style={styles.subtitle}>DAY 1</Text>
        <Text style={styles.workoutName}>STRONGER LOWER BODY</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>
        <Text style={styles.feedbackTitle}>How do you feel</Text>
        <View style={styles.feedbackContainer}>
          <TouchableOpacity style={styles.feedbackButton}>
            <Icon name="layers" type="feather" size={24} color="#FFF" />
            <Text style={styles.feedbackText}>Hard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedbackButton}>
            <Icon name="layers" type="feather" size={24} color="#FFF" />
            <Text style={styles.feedbackText}>Just right</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedbackButton}>
            <Icon name="layers" type="feather" size={24} color="#FFF" />
            <Text style={styles.feedbackText}>Easy</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.finishButton}
        onPress={() => navigation.navigate('BottomTabs')}
      >
        <Text style={styles.finishButtonText}>FINISH</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  shareText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    top: 30,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
  },
  subtitle: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 10,
  },
  workoutName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  feedbackTitle: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 40,
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  feedbackButton: {
    alignItems: 'center',
  },
  feedbackText: {
    color: '#FFF',
    marginTop: 5,
  },
  finishButton: {
    backgroundColor: '#FD6300',
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WorkoutCompletedScreen;