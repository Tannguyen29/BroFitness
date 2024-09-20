import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Icon } from "@rneui/themed";
import Slider from "@react-native-community/slider";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveUserInfo, getUserInfo } from "../../config/api";
import WheelPicker from "@quidone/react-native-wheel-picker";
import ProgressBar from "react-native-progress/Bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from '@env';

const PersonalInformationSetup = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [gender, setGender] = useState(null);
  const [birthYear, setBirthYear] = useState(2009);
  const [age, setAge] = useState(new Date().getFullYear() - 2009);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [fitnessGoal, setFitnessGoal] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [bodyParts, setBodyParts] = useState([]);
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [physicalActivityLevel, setPhysicalActivityLevel] = useState(null);

  const handleBodyPartToggle = (part) => {
    if (part === "fullBody") {
      if (bodyParts.includes("fullBody")) {
        setBodyParts([]);
      } else {
        setBodyParts([
          "fullBody",
          "chest",
          "back",
          "legs",
          "shoulders",
          "arms",
          "abs",
        ]);
      }
    } else {
      if (bodyParts.includes(part)) {
        setBodyParts(
          bodyParts.filter((item) => item !== part && item !== "fullBody")
        );
      } else {
        const newBodyParts = bodyParts.filter((item) => item !== "fullBody");
        setBodyParts([...newBodyParts, part]);
      }
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1: // Gender
        return gender !== null;
      case 2: // Target Body Parts
        return bodyParts.length > 0;
      case 3: // Birth Year
        return birthYear !== null;
      case 4: // Height
        return height !== null;
      case 5: // Weight
        return weight !== null;
      case 6: // Exercise Level
        return experienceLevel !== null;
      case 7: // Physical Activity Level
        return physicalActivityLevel !== null;
      case 8: // Fitness Goal
        return fitnessGoal !== null;
      case 9: // Available Equipment
        return equipment !== null;
      default:
        return true;
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 2009 - 1944 + 1 }, (_, i) => ({
    value: 2009 - i,
    label: (2009 - i).toString(),
  }));

  const calculateAge = useCallback(
    (birthYear) => {
      return currentYear - birthYear;
    },
    [currentYear]
  );

  useEffect(() => {
    setAge(calculateAge(birthYear));
  }, [birthYear, calculateAge]);

  const handleYearChange = useCallback(({ item: { value } }) => {
    setBirthYear(value);
  }, []);

  const convertHeight = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    return fromUnit === "cm" ? value / 30.48 : value * 30.48;
  };

  const handleHeightChange = (value) => {
    setHeight(
      heightUnit === "cm" ? Math.round(value) : parseFloat(value.toFixed(1))
    );
  };

  const toggleHeightUnit = () => {
    const newUnit = heightUnit === "cm" ? "ft" : "cm";
    const newHeight = convertHeight(height, heightUnit, newUnit);
    setHeightUnit(newUnit);
    setHeight(newHeight);
  };

  const convertWeight = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    return fromUnit === "kg" ? value * 2.20462 : value / 2.20462;
  };

  const handleWeightChange = (value) => {
    setWeight(parseFloat(value.toFixed(1)));
  };

  const toggleWeightUnit = () => {
    const newUnit = weightUnit === "kg" ? "lb" : "kg";
    const newWeight = convertWeight(weight, weightUnit, newUnit);
    setWeightUnit(newUnit);
    setWeight(newWeight);
  };

  const calculateBMI = () => {
    const heightInMeters = heightUnit === "cm" ? height / 100 : height * 0.3048;
    const weightInKg = weightUnit === "kg" ? weight : weight / 2.20462;
    return weightInKg / (heightInMeters * heightInMeters);
  };

  const activityLevels = [
    {
      id: "sedentary",
      title: "Sedentary (Office Worker)",
      description: "Little to no exercise",
      image: require("../../assets/Activity/sedentary.png"),
    },
    {
      id: "moderate",
      title: "Moderately Active",
      description: "Exercise 1-3 times/week",
      image: require("../../assets/Activity/moderate.png"),
    },
    {
      id: "active",
      title: "Active",
      description: "Exercise 3-5 times/week",
      image: require("../../assets/Activity/active.png"),
    },
  ];

  const fitnessGoals = [
    {
      id: "loseWeight",
      title: "Lose Weight",
      image: require("../../assets/Goal/weightLoss.png"),
    },
    {
      id: "buildMuscle",
      title: "Build Muscle",
      image: require("../../assets/Goal/muscleGain.png"),
    },
    {
      id: "keepFit",
      title: "Keep Fit",
      image: require("../../assets/Goal/KeepFit.png"),
    },
  ];

  const availableEquipment = [
    {
      id: "Body Weight",
      title: "No Equipment",
      image: require("../../assets/Equipment/None.png"),
    },
    {
      id: "dumbbells",
      title: "Dumbbells",
      image: require("../../assets/Equipment/Dumbbells.png"),
    },
    {
      id: "machines",
      title: "Gym Machines",
      image: require("../../assets/Equipment/Machines.png"),
    },
  ];

  const getBMIMessage = (bmi) => {
    if (bmi < 18.5) {
      return "You're underweight. A balanced diet and strength training can help you reach a healthier weight.";
    } else if (bmi >= 18.5 && bmi < 25) {
      return "Your weight is in the normal range. Keep up the good work with a balanced diet and regular exercise!";
    } else if (bmi >= 25 && bmi < 30) {
      return "You're overweight. A combination of diet and exercise can help you achieve a healthier weight.";
    } else {
      return "You're in the obese range. Consider consulting a healthcare professional for a personalized weight loss plan.";
    }
  };

  const experienceLevels = [
    {
      id: "beginner",
      title: "Beginner",
      description: "New to fitness or returning after a long break",
      image: require("../../assets/Experience/beginner.png"),
    },
    {
      id: "intermediate",
      title: "Intermediate",
      description: "Consistent workout routine for 6+ months",
      image: require("../../assets/Experience/intermediate.png"),
    },
    {
      id: "advanced",
      title: "Advanced",
      description: "Experienced with various workout techniques",
      image: require("../../assets/Experience/advanced.png"),
    },
  ];

  const handleSubmit = async () => {
    try {

      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        `${API_BASE_URL}/personal-information-setup`,
        {
          gender,
          age,
          height:
            heightUnit === "cm" ? height : convertHeight(height, "ft", "cm"),
          weight:
            weightUnit === "kg" ? weight : convertWeight(weight, "lb", "kg"),
          physicalActivityLevel,
          fitnessGoal,
          equipment,
          experienceLevel,
          bodyParts,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
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
      component: (
        <View style={styles.section}>
          <Text style={styles.welcomeTitle}>Hello!</Text>
          <Text style={styles.welcomeText}>
            I'm your personal coach. Let's get to know you better to create a
            personalized plan just for you.
          </Text>
          <Image
            source={require("../../assets/image/logo5.png")}
            style={styles.coachImage}
          />
        </View>
      ),
    },
    {
      component: (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your gender?</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Knowing your gender helps us tailor the workout for you based on
              your metabolic rate.
            </Text>
          </View>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              onPress={() => setGender("male")}
              style={[
                styles.genderButton,
                gender === "male" && styles.selectedButton,
              ]}
            >
              <Image
                source={require("../../assets/male.png")}
                style={styles.genderImage}
              />
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setGender("female")}
              style={[
                styles.genderButton,
                gender === "female" && styles.selectedButton,
              ]}
            >
              <Image
                source={require("../../assets/female.png")}
                style={styles.genderImage}
              />
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    },
    {
      component: (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Body Parts</Text>
          <View style={styles.bodyPartsContainer}>
            <View style={styles.imageContainer}>
              <Image
                source={
                  gender === "male"
                    ? require("../../assets/male.png")
                    : require("../../assets/female.png")
                }
                style={styles.bodyImage}
              />
            </View>
            <View style={styles.bodyPartButtonsContainer}>
              {[
                "fullBody",
                "chest",
                "back",
                "legs",
                "shoulders",
                "arms",
                "abs",
              ].map((part) => (
                <TouchableOpacity
                  key={part}
                  onPress={() => handleBodyPartToggle(part)}
                  style={[
                    styles.bodyPartButton,
                    bodyParts.includes(part) && styles.selectedBodyPart,
                  ]}
                >
                  <Text style={styles.bodyPartButtonText}>
                    {part === "fullBody"
                      ? "Full Body"
                      : part.charAt(0).toUpperCase() + part.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ),
    },
    {
      component: (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your birth year?</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Knowing your birth year helps us tailor the workout for you based
              on your metabolic rate.
            </Text>
          </View>
          <Text style={styles.ageText}>
            Your age: <Text style={styles.ageNumber}>{age}</Text> years
          </Text>
          <View style={styles.pickerContainer}>
            <WheelPicker
              data={years}
              onValueChanged={handleYearChange}
              selectedIndex={years.findIndex(
                (year) => year.value === birthYear
              )}
              itemHeight={80}
              width={200}
              itemTextStyle={styles.wheelPickerText}
            />
            <View style={styles.selectedOverlay} pointerEvents="none" />
          </View>
        </View>
      ),
    },
    {
      component: (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your height?</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              This will help us adjust the workouts to best suit your physique.
            </Text>
          </View>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                heightUnit === "cm" && styles.activeUnitButton,
              ]}
              onPress={toggleHeightUnit}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  heightUnit === "cm" && styles.activeUnitButtonText,
                ]}
              >
                cm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                heightUnit === "ft" && styles.activeUnitButton,
              ]}
              onPress={toggleHeightUnit}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  heightUnit === "ft" && styles.activeUnitButtonText,
                ]}
              >
                ft
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.measurementValue}>
            {height.toFixed(heightUnit === "cm" ? 0 : 1)} {heightUnit}
          </Text>
          <Slider
            style={styles.slider}
            value={height}
            onValueChange={handleHeightChange}
            minimumValue={heightUnit === "cm" ? 130 : 4.5}
            maximumValue={heightUnit === "cm" ? 220 : 7.4}
            step={heightUnit === "cm" ? 1 : 0.1}
            minimumTrackTintColor="#FD6300"
            maximumTrackTintColor="#ffffff"
            thumbTintColor="#FD6300"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>
              {heightUnit === "cm" ? "130" : "4.5"}
            </Text>
            <Text style={styles.sliderLabel}>
              {heightUnit === "cm" ? "175" : "6"}
            </Text>
            <Text style={styles.sliderLabel}>
              {heightUnit === "cm" ? "220" : "7.4"}
            </Text>
          </View>
        </View>
      ),
    },
    {
      component: (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your current weight?</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                weightUnit === "kg" && styles.activeUnitButton,
              ]}
              onPress={toggleWeightUnit}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  weightUnit === "kg" && styles.activeUnitButtonText,
                ]}
              >
                kg
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                weightUnit === "lb" && styles.activeUnitButton,
              ]}
              onPress={toggleWeightUnit}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  weightUnit === "lb" && styles.activeUnitButtonText,
                ]}
              >
                lb
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.measurementValue}>
            {weight.toFixed(1)} {weightUnit}
          </Text>
          <Slider
            style={styles.slider}
            value={weight}
            onValueChange={handleWeightChange}
            minimumValue={weightUnit === "kg" ? 40 : 88}
            maximumValue={weightUnit === "kg" ? 150 : 330}
            step={0.1}
            minimumTrackTintColor="#FD6300"
            maximumTrackTintColor="#ffffff"
            thumbTintColor="#FD6300"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>
              {weightUnit === "kg" ? "40" : "88"}
            </Text>
            <Text style={styles.sliderLabel}>
              {weightUnit === "kg" ? "95" : "209"}
            </Text>
            <Text style={styles.sliderLabel}>
              {weightUnit === "kg" ? "150" : "330"}
            </Text>
          </View>
          <View style={styles.bmiBox}>
            <Text style={styles.bmiTitle}>Your Current BMI</Text>
            <Text style={styles.bmiValue}>{calculateBMI().toFixed(1)}</Text>
            <Text style={styles.bmiDescription}>
              {getBMIMessage(calculateBMI())}
            </Text>
          </View>
        </View>
      ),
    },
    {
      component: (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What's your fitness experience?
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Select your fitness experience level. This helps us tailor the
              intensity of your workouts.
            </Text>
          </View>
          {experienceLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.experienceItem,
                experienceLevel === level.id && styles.selectedExperience,
              ]}
              onPress={() => setExperienceLevel(level.id)}
            >
              <View style={styles.experienceInfo}>
                <Text style={styles.experienceTitle}>{level.title}</Text>
                <Text style={styles.experienceDescription}>
                  {level.description}
                </Text>
              </View>
              <Image source={level.image} style={styles.experienceImage} />
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
    {
      component: (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Activity Level</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Select your typical activity level. This helps us tailor your
              workout plan.
            </Text>
          </View>
          {activityLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.activityItem,
                physicalActivityLevel === level.id && styles.selectedActivity,
              ]}
              onPress={() => setPhysicalActivityLevel(level.id)}
            >
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{level.title}</Text>
                <Text style={styles.activityDescription}>
                  {level.description}
                </Text>
              </View>
              <Image source={level.image} style={styles.activityImage} />
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
    {
      component: (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your main goal?</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              We'll tailor the best blend of strength and cardio training to
              align with your goal.
            </Text>
          </View>
          {fitnessGoals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalItem,
                fitnessGoal === goal.id && styles.selectedGoal,
              ]}
              onPress={() => setFitnessGoal(goal.id)}
            >
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Image source={goal.image} style={styles.goalImage} />
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
    {
      component: (
        <ScrollView style={styles.section}>
          <Text style={styles.sectionTitle}>What equipment do you have?</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Select the equipment you have access to. We'll tailor your
              workouts accordingly.
            </Text>
          </View>
          {availableEquipment.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.equipmentItem,
                equipment === item.id && styles.selectedEquipment,
              ]}
              onPress={() => setEquipment(item.id)}
            >
              <View style={styles.equipmentInfo}>
                <Text style={styles.equipmentTitle}>{item.title}</Text>
              </View>
              <Image source={item.image} style={styles.equipmentImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep < steps.length - 1) {
      if (isStepValid(currentStep)) {
        setCurrentStep(currentStep + 1);
      } else {
        Alert.alert(
          "Incomplete Information",
          "Please complete the current step before proceeding.",
          [{ text: "OK" }]
        );
      }
    } else {
      if (isStepValid(currentStep)) {
        handleSubmit();
      } else {
        Alert.alert(
          "Incomplete Information",
          "Please complete all steps before submitting.",
          [{ text: "OK" }]
        );
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentStep > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
          <Icon name="chevron-left" size={30} color="#FD6300" />
        </TouchableOpacity>
      )}
      {currentStep > 0 && (
        <View style={styles.progressBarContainer}>
          <ProgressBar
            progress={currentStep / (steps.length - 1)}
            width={null}
            height={10}
            color="#FD6300"
            unfilledColor="#1c1c1c"
            borderWidth={0}
          />
        </View>
      )}
      <View style={styles.scrollView}>
        <Text style={styles.title}>{steps[currentStep].title}</Text>
        {steps[currentStep].component}
      </View>
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.navButton,
            !isStepValid(currentStep) && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!isStepValid(currentStep)}
        >
          <Text style={styles.navButtonText}>
            {currentStep === steps.length - 1 ? "Submit" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  progressBarContainer: {
    position: 'static',
    top: 55,
    width: 370,
    left: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "white",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
    zIndex: 1,
  },
  disabledButton: {
    backgroundColor: "#888",
    opacity: 0.7,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "white",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: "white",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  genderButton: {
    width: "48%",
    height: 500,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  selectedButton: {
    borderColor: "#FD6300",
    borderWidth: 2,
  },
  genderImage: {
    width: 250,
    height: "100%",
    resizeMode: "contain",
  },
  genderText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  buttonText: {
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
  },
  bodyPartsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bodyImage: {
    width: 180,
    height: 400,
    resizeMode: "center",
  },
  bodyPartButtonsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  bodyPartButton: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
    top: 50,
  },
  selectedBodyPart: {
    backgroundColor: "rgba(253, 99, 0, 0.3)",
    borderColor: "#FD6300",
  },
  bodyPartButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  pickerContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 40,
  },
  wheelPickerText: {
    fontSize: 24,
    color: "white",
  },
  selectedOverlay: {
    position: "absolute",
    top: "50%",
    width: 200,
    height: 80,
    marginTop: -40,
    borderWidth: 2,
    borderColor: "#FD6300",
    borderRadius: 25,
    backgroundColor: "rgba(253, 99, 0, 0.1)",
  },
  ageText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
    color: "white",
  },
  ageNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FD6300",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "black",
  },
  navButton: {
    backgroundColor: "#FD6300",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 20,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "white",
  },
  welcomeText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "white",
  },
  coachImage: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },
  readyButton: {
    backgroundColor: "#000",
  },
  unitToggle: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    borderRadius: 15,
  },
  unitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#FD6300",
  },
  activeUnitButton: {
    backgroundColor: "#FD6300",
  },
  unitButtonText: {
    color: "#FD6300",
    fontWeight: "bold",
  },
  activeUnitButtonText: {
    color: "#FFFFFF",
  },
  measurementValue: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "white",
  },
  slider: {
    width: "100%",
    height: 50,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  sliderLabel: {
    color: "white",
  },
  bmiBox: {
    backgroundColor: "#F0F8FF",
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  bmiTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FD6300",
    marginBottom: 10,
  },
  bmiDescription: {
    fontSize: 16,
    color: "#333",
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedActivity: {
    borderColor: "#FD6300",
    borderWidth: 2,
    backgroundColor: "rgba(253, 99, 0, 0.1)",
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  activityDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  activityImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  experienceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedExperience: {
    borderColor: "#FD6300",
    borderWidth: 2,
    backgroundColor: "rgba(253, 99, 0, 0.1)",
  },
  experienceInfo: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  experienceDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  experienceImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  goalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedGoal: {
    borderColor: "#FD6300",
    borderWidth: 2,
    backgroundColor: "rgba(253, 99, 0, 0.1)",
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  goalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  equipmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedEquipment: {
    borderColor: "#FD6300",
    borderWidth: 2,
    backgroundColor: "rgba(253, 99, 0, 0.1)",
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  equipmentDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  equipmentImage: {
    width: 100,
    height: 80,
    borderRadius: 10,
  },
});

export default PersonalInformationSetup;
