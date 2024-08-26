import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from "@rneui/themed";
import { Audio } from 'expo-av';

const WorkoutScreen = ({ route }) => {
  const navigation = useNavigation();
  const { exercises } = route.params;
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [setCount, setSetCount] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [tickSound, setTickSound] = useState();
  const [clockTickSound, setClockTickSound] = useState();

  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadSounds() {
      const tickAudio = new Audio.Sound();
      const clockTickAudio = new Audio.Sound();
      try {
        await tickAudio.loadAsync(require('../../assets/tick.mp3'));
        await clockTickAudio.loadAsync(require('../../assets/clock_tick.mp3'));
        setTickSound(tickAudio);
        setClockTickSound(clockTickAudio);
      } catch (error) {
        console.error('Không thể tải âm thanh:', error);
      }
    }

    loadSounds();

    return () => {
      if (tickSound) tickSound.unloadAsync();
      if (clockTickSound) clockTickSound.unloadAsync();
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isResting && restTime > 0) {
      interval = setInterval(() => {
        setRestTime((prevTime) => prevTime - 1);
        playClockTickSound();
      }, 1000);
    } else if (isResting && restTime === 0) {
      setIsResting(false);
      if (setCount < currentExercise.sets) {
        setSetCount(setCount + 1);
      } else {
        handleNextExercise();
      }
    }
    return () => clearInterval(interval);
  }, [isResting, restTime]);

  const playTickSound = async () => {
    try {
      await tickSound.replayAsync();
    } catch (error) {
      console.error('Sound Error tick:', error);
    }
  };
  
  const playClockTickSound = async () => {
    try {
      await clockTickSound.replayAsync();
    } catch (error) {
      console.error('Sound Error clock tick:', error);
    }
  };

  const handleComplete = async () => {
    if (isResting) {
      if (clockTickSound) {
        await clockTickSound.stopAsync();
      }
      await playTickSound();
      setIsResting(false);
      if (setCount < currentExercise.sets) {
        setSetCount(setCount + 1);
      } else {
        handleNextExercise();
      }
    } else {
      await playTickSound();
      setIsResting(true);
      setRestTime(calculateRestTime(currentExercise.level));
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSetCount(1);
    } else {
      navigation.navigate('WorkoutCompleted', {
        exercises: exercises,
        totalTime: totalTime,
        calories: calculateCalories(),
      });
    }
  };

  const calculateCalories = () => {
    return Math.floor(Math.random() * 100) + 50;
  };

  const calculateRestTime = (level) => {
    switch(level.toLowerCase()) {
      case 'beginner': return 45;
      case 'intermediate': return 40;
      case 'advanced': return 35;
      default: return 45;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderProgressBar = () => {
    const totalExercises = exercises.length;
    const progress = (currentExerciseIndex / totalExercises) * 100;

    return (
      <View style={styles.progressBarContainer}>
        {[...Array(totalExercises)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index <= currentExerciseIndex ? styles.progressSegmentCompleted : null
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" type="antdesign" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.exerciseProgress}>
          <Text style={styles.exerciseProgressText}>
            Exercises {currentExerciseIndex + 1}/{exercises.length}
          </Text>
          <Text style={styles.totalTimeText}>{formatTime(totalTime)}</Text>
        </View>
        <TouchableOpacity>
          <Icon name="camera" type="feather" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {renderProgressBar()}
      <Image 
        source={{ uri: currentExercise.gifUrl }} 
        style={styles.exerciseImage}
        resizeMode="contain"
      />
      <View style={styles.bottomContainer}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{currentExercise.name.toUpperCase()}</Text>
          {isResting ? (
            <Text style={styles.restTimeText}>Rest: {restTime}s</Text>
          ) : (
            <Text style={styles.repsText}>x {currentExercise.reps}</Text>
          )}
        </View>
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.completeButton, isResting && styles.skipButton]} 
            onPress={handleComplete}
          >
            {isResting ? (
              <Text style={styles.skipButtonText}>Skip</Text>
            ) : (
              <Icon name="check" type="feather" size={30} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    top: 20
  },
  exerciseProgress: {
    alignItems: 'center',
  },
  exerciseProgressText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalTimeText: {
    fontSize: 14,
    color: '#888',
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 2,
  },
  progressSegmentCompleted: {
    backgroundColor: '#FD6300',
  },
  exerciseImage: {
    width: '100%',
    height: '60%',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
    padding: 50,
    paddingTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    bottom: 20
  },
  repsText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  restTimeText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  controlsContainer: {
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#FD6300',
    borderRadius: 30,
    width: 140,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    width: 140,
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WorkoutScreen;