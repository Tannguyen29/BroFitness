import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUserInfo, getUserInfo } from '../../config/api';

const PersonalInformationSetup = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [gender, setGender] = useState(null);
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [physicalActivityLevel, setPhysicalActivityLevel] = useState(null);
  const [fitnessGoal, setFitnessGoal] = useState(null);
  const [healthIssues, setHealthIssues] = useState('');
  const [equipment, setEquipment] = useState(null);
  const [dailyExerciseTime, setDailyExerciseTime] = useState(60);
  const [bodyParts, setBodyParts] = useState([]);

  const handleBodyPartToggle = (part) => {
    if (bodyParts.includes(part)) {
      setBodyParts(bodyParts.filter(item => item !== part));
    } else {
      setBodyParts([...bodyParts, part]);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post('http://192.168.2.28:5000/personal-information-setup', {
        gender,
        age,
        height,
        weight,
        physicalActivityLevel,
        fitnessGoal,
        healthIssues,
        equipment,
        dailyExerciseTime,
        bodyParts,
      }, {
        headers: {
          'x-auth-token': token
        }
      });
      console.log(response.data);
      
      const { name } = await getUserInfo();
      await saveUserInfo(token, name, true);
      
      navigation.navigate("BottomTabs");
    } catch (error) {
      console.error(error);
    }
  };

  const steps = [
    {
      title: "Welcome",
      component: (
        <View style={styles.section}>
          <Text style={styles.welcomeTitle}>Hello!</Text>
          <Text style={styles.welcomeText}>I'm your personal coach. Let's get to know you better to create a personalized plan just for you.</Text>
          <Image 
            source={require('../../assets/image/gym.jpg')} 
            style={styles.coachImage}
          />
        </View>
      )
    },
    {
      title: "Gender",
      component: (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity onPress={() => setGender('male')} style={[styles.genderButton, gender === 'male' && styles.selectedButton]}>
              <Text style={styles.buttonText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGender('female')} style={[styles.genderButton, gender === 'female' && styles.selectedButton]}>
              <Text style={styles.buttonText}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGender('other')} style={[styles.genderButton, gender === 'other' && styles.selectedButton]}>
              <Text style={styles.buttonText}>Other</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    },
    {
      title: "Age",
      component: (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age: {age} years</Text>
          <Slider
            value={age}
            onValueChange={(value) => setAge(Math.round(value))}
            minimumValue={18}
            maximumValue={100}
            step={1}
          />
        </View>
      )
    },
    {
      title: "Height and Weight",
      component: (
        <View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Height: {height} cm</Text>
            <Slider
              value={height}
              onValueChange={(value) => setHeight(Math.round(value))}
              minimumValue={140}
              maximumValue={220}
              step={1}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weight: {weight} kg</Text>
            <Slider
              value={weight}
              onValueChange={(value) => setWeight(Math.round(value))}
              minimumValue={40}
              maximumValue={150}
              step={1}
            />
          </View>
        </View>
      )
    },
    {
      title: "Activity Level and Fitness Goal",
      component: (
        <View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Physical Activity Level</Text>
            <Picker
              selectedValue={physicalActivityLevel}
              onValueChange={(itemValue) => setPhysicalActivityLevel(itemValue)}
            >
              <Picker.Item label="Select activity level" value={null} />
              <Picker.Item label="Low" value="low" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="High" value="high" />
            </Picker>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fitness Goal</Text>
            <Picker
              selectedValue={fitnessGoal}
              onValueChange={(itemValue) => setFitnessGoal(itemValue)}
            >
              <Picker.Item label="Select fitness goal" value={null} />
              <Picker.Item label="Weight Loss" value="weightLoss" />
              <Picker.Item label="Muscle Gain" value="muscleGain" />
              <Picker.Item label="Overall Health" value="overallHealth" />
            </Picker>
          </View>
        </View>
      )
    },
    {
      title: "Health Issues and Equipment",
      component: (
        <View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Issues</Text>
            <TextInput
              style={styles.input}
              onChangeText={setHealthIssues}
              value={healthIssues}
              placeholder="Enter any health issues"
              multiline
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Equipment</Text>
            <Picker
              selectedValue={equipment}
              onValueChange={(itemValue) => setEquipment(itemValue)}
            >
              <Picker.Item label="Select equipment" value={null} />
              <Picker.Item label="Dumbbells" value="dumbbells" />
              <Picker.Item label="Machines" value="machines" />
              <Picker.Item label="Resistance Bands" value="resistanceBands" />
              <Picker.Item label="None" value="none" />
            </Picker>
          </View>
        </View>
      )
    },
    {
      title: "Exercise Time and Body Parts",
      component: (
        <View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Exercise Time: {dailyExerciseTime} minutes</Text>
            <Slider
              value={dailyExerciseTime}
              onValueChange={(value) => setDailyExerciseTime(Math.round(value))}
              minimumValue={30}
              maximumValue={180}
              step={1}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target Body Parts</Text>
            <View style={styles.bodyPartsContainer}>
              {['chest', 'back', 'legs', 'shoulders', 'arms', 'abs'].map((part) => (
                <TouchableOpacity
                  key={part}
                  onPress={() => handleBodyPartToggle(part)}
                  style={[styles.bodyPartButton, bodyParts.includes(part) && styles.selectedButton]}
                >
                  <Text style={styles.buttonText}>{part.charAt(0).toUpperCase() + part.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )
    },
  ];

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{steps[currentStep].title}</Text>
      {steps[currentStep].component}
      <View style={styles.navigationButtons}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.navButton, currentStep === 0 && styles.readyButton]} 
          onPress={handleNext}
        >
          <Text style={styles.navButtonText}>
            {currentStep === 0 ? "I'M READY" : currentStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  bodyPartsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bodyPartButton: {
    width: '48%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  coachImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
  },
  readyButton: {
    backgroundColor: '#000',
  },
});

export default PersonalInformationSetup;