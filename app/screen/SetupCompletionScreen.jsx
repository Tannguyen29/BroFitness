import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native'; 

const SetupCompletionScreen = ({ route }) => {
  const { userData } = route.params;
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = new Animated.Value(0);
  const navigation = useNavigation();

  const steps = [
    { title: 'Analyzing your body', info: `${userData.height} cm, ${userData.weight} kg` },
    { title: 'Calculating metabolism', info: `${Math.round(userData.calorieGoal)} kcal` },
    { title: 'Adjusting Activity Level', info: userData.physicalActivityLevel },
    { title: 'Adjusting fitness goal', info: userData.fitnessGoal },
    { title: 'Adjusting fitness level', info: userData.experienceLevel },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            return 0;
          }
          return 100;
        }
        return oldProgress + 1;
      });
    }, 50);

    if (currentStep === steps.length - 1) {
      const navigateTimeout = setTimeout(() => {
        navigation.navigate('BottomTabs');
      }, 6400);

      return () => clearTimeout(navigateTimeout); 
    }

    return () => clearInterval(timer);
  }, [currentStep]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image
          source={require('../../assets/muscleGain.png')}
          style={styles.coachImage}
        />
        <Text style={styles.title}>Your coach is busy working for you...</Text>
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepHeader}>
                <View style={[
                  styles.stepDot,
                  index <= currentStep && styles.activeStepDot
                ]} />
                <View style={styles.stepTextContainer}>
                  <Text style={[
                    styles.stepText,
                    index <= currentStep && styles.activeStepText
                  ]}>
                    {step.title}
                  </Text>
                  {index <= currentStep && (
                    <View style={styles.infoContainer}>
                      <Text style={styles.infoText}>{step.info}</Text>
                      {index < currentStep && (
                        <Icon name="check" size={16} color="#FD6300" style={styles.checkIcon} />
                      )}
                    </View>
                  )}
                </View>
              </View>
              {index === currentStep && (
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progress}%` }]} />
                  <Text style={styles.progressText}>{`${progress}%`}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  coachImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: 'white',
  },
  stepsContainer: {
    width: '100%',
  },
  stepItem: {
    marginBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginRight: 10,
    marginTop: 4,
  },
  activeStepDot: {
    backgroundColor: '#FD6300',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepText: {
    fontSize: 16,
    color: '#757575',
  },
  activeStepText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#FD6300',
    marginRight: 8,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  progressBarContainer: {
    width: '100%',
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginTop: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FD6300',
    borderRadius: 15,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 30,
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default SetupCompletionScreen;
