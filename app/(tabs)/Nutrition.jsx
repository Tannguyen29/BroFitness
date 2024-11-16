import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getUserInfo } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {API_BASE_URL } from '@env';
const DateSelector = ({ selectedDate, onDateChange }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const toggleCalendar = () => setShowCalendar(!showCalendar);

  const handleDateSelect = (day) => {
    onDateChange(day.dateString);
    setShowCalendar(false);
  };

  const changeDate = (direction) => {
    const newDate = moment(selectedDate).add(direction, 'days');
    onDateChange(newDate.format('YYYY-MM-DD'));
  };

  const getDisplayText = () => {
    const today = moment().startOf('day');
    const selected = moment(selectedDate);
    const diff = selected.diff(today, 'days');

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    return selected.format('ddd, D MMM');
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.arrowButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleCalendar} style={styles.dateDisplay}>
          <Text style={styles.dateText}>{getDisplayText()}</Text>
          <Ionicons name="calendar-outline" size={24} color="white" style={styles.calendarIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Modal
        transparent={true}
        visible={showCalendar}
        onRequestClose={() => setShowCalendar(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowCalendar(false)}
        >
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{ [selectedDate]: { selected: true, selectedColor: '#4A90E2' } }}
              theme={{
                backgroundColor: '#38393a',
                calendarBackground: '#38393a',
                textSectionTitleColor: 'white',
                selectedDayBackgroundColor: '#4A90E2',
                selectedDayTextColor: 'white',
                todayTextColor: '#FD6300',
                dayTextColor: 'white',
                textDisabledColor: '#666',
                monthTextColor: 'white',
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const MacroGoals = ({ carbs, protein, fat, calories, totalCarbs, totalProtein, totalFat, totalCalories }) => {
  const [selectedTab, setSelectedTab] = useState('Macros');
  const tabs = ['Macros', 'Nutrients', 'Calories'];

  const calculateFill = (value, total) => {
    if (!total) return 0;
    return (value / total) * 100;
  };

  return (
    <View style={styles.macroGoalsContainer}>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.selectedTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.selectedTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.macroCircle}>
        <AnimatedCircularProgress
          size={150}
          width={15}
          backgroundWidth={15}
          fill={calculateFill(calories, totalCalories)}
          tintColor="#7DDA58"
          backgroundColor="#F0F0F0"
          arcSweepAngle={360}
          rotation={0}
          lineCap="round"
        >
          {() => (
            <View style={styles.macroTextContainer}>
              <Text style={styles.macroTotalValue}>{calories}</Text>
              <Text style={styles.macroTotalLabel}>Calories left</Text>
            </View>
          )}
        </AnimatedCircularProgress>
        <AnimatedCircularProgress
          size={150}
          width={15}
          backgroundWidth={5}
          fill={calculateFill(protein, totalProtein)}
          tintColor="#E24A8B"
          backgroundColor="transparent"
          arcSweepAngle={360}
          rotation={0}
          lineCap="round"
          style={styles.overlayProgress}
        />
        <AnimatedCircularProgress
          size={150}
          width={15}
          backgroundWidth={5}
          fill={calculateFill(fat, totalFat)}
          tintColor="#E2C44A"
          backgroundColor="transparent"
          arcSweepAngle={360}
          rotation={0}
          lineCap="round"
          style={styles.overlayProgress}
        />
      </View>
      <View style={styles.macroDetailsContainer}>
        <MacroDetail label="Carbs" value={carbs} total={totalCarbs} color="#7DDA58" />
        <MacroDetail label="Protein" value={protein} total={totalProtein} color="#E24A8B" />
        <MacroDetail label="Fat" value={fat} total={totalFat} color="#E2C44A" />
      </View>
    </View>
  );
};

const MacroDetail = ({ label, value, total, color }) => (
  <View style={styles.macroDetailItem}>
    <View style={[styles.macroDetailDot, { backgroundColor: color }]} />
    <Text style={styles.macroDetailValue}>{value}g / {total}g</Text>
    <Text style={styles.macroDetailLabel}>{label}</Text>
  </View>
);

const ProgressItem = ({ icon, value, unit, max, color }) => (
  <View style={styles.progressItemContainer}>
    <View style={styles.progressItemContent}>
      <AnimatedCircularProgress
        size={60}
        width={6}
        fill={(value / max) * 100}
        tintColor={color}
        backgroundColor="#E0E0E0"
        rotation={0}
        lineCap="round"
      >
        {() => (
          <View style={styles.progressItemIconContainer}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
        )}
      </AnimatedCircularProgress>
      <View style={styles.progressItemTextContainer}>
        <Text style={styles.progressItemLabel}>{unit === 'Steps' ? 'Walking' : 'Water'}</Text>
        <Text style={styles.progressItemValue}>{value} {unit}</Text>
      </View>
    </View>
  </View>
);

const MealItem = ({ title, items, selectedDate }) => {
  const navigation = useNavigation();
  
  // Calculate total calories for this meal
  const calories = (items || []).reduce((total, item) => 
    total + (item.calories || 0) * (item.numberOfServings || 1), 0);

  useEffect(() => {
    console.log('Selected date in MealItem changed to:', selectedDate);
  }, [selectedDate]);

  const handleAddFood = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!selectedDate) {
        console.error('No date selected');
        Alert.alert('Error', 'Please select a date');
        return;
      }

      if (userToken) {
        await Promise.all([
          AsyncStorage.setItem('currentMealType', title),
          AsyncStorage.setItem('currentMealDate', selectedDate)
        ]);

        console.log('Stored date:', selectedDate);
        navigation.navigate('FoodSelectionScreen');
      } else {
        Alert.alert('Error', 'Please login to add food');
      }
    } catch (error) {
      console.error('Error in handleAddFood:', error);
      Alert.alert('Error', 'Failed to process request');
    }
  };

  return (
    <View style={styles.mealContainer}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTitle}>{title}</Text>
        <TouchableOpacity onPress={handleAddFood}>
          <Ionicons name="add-circle-outline" size={24} color="#FD6300" />
        </TouchableOpacity>
      </View>
      <Text style={styles.mealCalories}>{calories || 0} cal</Text>
      <View style={styles.itemsContainer}>
        {(items || []).map((item, index) => (
          <View key={index} style={styles.foodItem}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodCalories}>
              {((item.calories || 0) * (item.numberOfServings || 1)).toFixed(0)} cal
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const Nutrition = () => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [userMetrics, setUserMetrics] = useState({
    gender: '',
    age: 0,
    weight: 0,
    height: 0,
    physicalActivityLevel: 'moderate', // default value
    fitnessGoal: 'maintain' // default value
  });
  const [dailyGoals, setDailyGoals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [meals, setMeals] = useState({
    Breakfast: { foods: [], totals: { calories: 0, protein: 0, fat: 0, carbs: 0 } },
    Lunch: { foods: [], totals: { calories: 0, protein: 0, fat: 0, carbs: 0 } },
    Dinner: { foods: [], totals: { calories: 0, protein: 0, fat: 0, carbs: 0 } }
  });

  // Calculate BMR based on user metrics
  const calculateBMR = () => {
    const { gender, weight, height, age } = userMetrics;
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  // Calculate TDEE based on activity level
  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const activityMultipliers = {
      sedentary: 1.2,
      moderate: 1.55,
      active: 1.725,
    };
    return bmr * activityMultipliers[userMetrics.physicalActivityLevel];
  };

  // Calculate calorie goal based on fitness goal
  const calculateCalorieGoal = () => {
    const tdee = calculateTDEE();
    switch (userMetrics.fitnessGoal) {
      case 'loseWeight':
        return tdee - 500;
      case 'buildMuscle':
        return tdee + 300;
      default:
        return tdee;
    }
  };

  // Calculate macro nutrient goals
  const calculateMacroGoals = (totalCalories) => {
    return {
      protein: Math.round((totalCalories * 0.3) / 4), // 30% of calories from protein
      carbs: Math.round((totalCalories * 0.45) / 4), // 45% of calories from carbs
      fat: Math.round((totalCalories * 0.25) / 9), // 25% of calories from fat
    };
  };

  // Fetch user info and calculate goals
  useEffect(() => {
    const fetchUserInfo = async () => {
      const info = await getUserInfo();
      if (info.personalInfoCompleted) {
        setUserMetrics({
          gender: info.gender,
          age: info.age,
          weight: info.weight,
          height: info.height,
          physicalActivityLevel: 'moderate', // You might want to store this in user profile
          fitnessGoal: 'maintain' // You might want to store this in user profile
        });
      }
    };
    fetchUserInfo();
  }, []);

  // Calculate daily goals whenever user metrics change
  useEffect(() => {
    if (userMetrics.weight > 0) {
      const totalCalories = calculateCalorieGoal();
      const macros = calculateMacroGoals(totalCalories);
      setDailyGoals({
        calories: Math.round(totalCalories),
        ...macros
      });
    }
  }, [userMetrics]);

  // Calculate consumed nutrients from meals
  const calculateConsumed = () => {
    if (!meals) {
      console.log('Meals object is null or undefined');
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    
    const consumed = Object.values(meals).reduce((totals, meal) => {
      // Check if meal and meal.foods exist
      if (!meal || !Array.isArray(meal.foods)) {
        console.log('Invalid meal structure:', meal);
        return totals;
      }
      
      // Calculate totals from foods array
      const mealTotals = meal.foods.reduce((foodTotals, food) => ({
        calories: foodTotals.calories + (food.calories || 0) * (food.numberOfServings || 1),
        protein: foodTotals.protein + (food.protein || 0) * (food.numberOfServings || 1),
        carbs: foodTotals.carbs + (food.carbs || 0) * (food.numberOfServings || 1),
        fat: foodTotals.fat + (food.fat || 0) * (food.numberOfServings || 1)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
      return {
        calories: totals.calories + mealTotals.calories,
        protein: totals.protein + mealTotals.protein,
        carbs: totals.carbs + mealTotals.carbs,
        fat: totals.fat + mealTotals.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
    console.log('Calculated consumed nutrients:', consumed);
    return consumed;
  };

  // Calculate remaining nutrients
  const calculateRemaining = () => {
    const consumed = calculateConsumed();
    const remaining = {
      calories: Math.max(0, dailyGoals.calories - consumed.calories),
      protein: Math.max(0, dailyGoals.protein - consumed.protein),
      carbs: Math.max(0, dailyGoals.carbs - consumed.carbs),
      fat: Math.max(0, dailyGoals.fat - consumed.fat)
    };

    console.log('Calories Goal:', dailyGoals.calories);
    console.log('Calories Consumed:', consumed.calories);
    console.log('Calories Remaining:', remaining.calories);

    return remaining;
  };

  // Fetch meals for selected date
  const fetchMealByType = async (mealType, date) => {
    try {
      const userInfo = await getUserInfo();
      if (!userInfo.userId || !userInfo.token) {
        throw new Error('User authentication required');
      }
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const response = await axios.get(
        `${API_BASE_URL}/meals/${formattedDate}/${mealType}`,
        {
          headers: { 'x-auth-token': userInfo.token }
        }
      );
      
      // Return response data directly as it already has the foods array
      return response.data || { foods: [] };
    } catch (error) {
      console.log(`Error fetching ${mealType}:`, error);
      return { foods: [] };
    }
  };

  // Update all meals for selected date
  useFocusEffect(
    React.useCallback(() => {
      const updateMeals = async () => {
        try {
          const [breakfast, lunch, dinner] = await Promise.all([
            fetchMealByType('Breakfast', selectedDate),
            fetchMealByType('Lunch', selectedDate),
            fetchMealByType('Dinner', selectedDate)
          ]);
          
          setMeals({
            Breakfast: {
              foods: breakfast?.foods || [],
              totals: breakfast?.totals || { calories: 0, protein: 0, fat: 0, carbs: 0 }
            },
            Lunch: {
              foods: lunch?.foods || [],
              totals: lunch?.totals || { calories: 0, protein: 0, fat: 0, carbs: 0 }
            },
            Dinner: {
              foods: dinner?.foods || [],
              totals: dinner?.totals || { calories: 0, protein: 0, fat: 0, carbs: 0 }
            }
          });
        } catch (error) {
          console.error('Error updating meals:', error);
          // Set default values on error
          setMeals({
            Breakfast: { foods: [], totals: { calories: 0, protein: 0, fat: 0, carbs: 0 } },
            Lunch: { foods: [], totals: { calories: 0, protein: 0, fat: 0, carbs: 0 } },
            Dinner: { foods: [], totals: { calories: 0, protein: 0, fat: 0, carbs: 0 } }
          });
        }
      };
      updateMeals();
    }, [selectedDate])
  );

  const remaining = calculateRemaining();

  return (


<ScrollView style={styles.container}>
      <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      
      <MacroGoals
        carbs={remaining.carbs}
        protein={remaining.protein}
        fat={remaining.fat}
        calories={remaining.calories}
        totalCarbs={dailyGoals.carbs}
        totalProtein={dailyGoals.protein}
        totalFat={dailyGoals.fat}
        totalCalories={dailyGoals.calories}
      />
      <View style={styles.progressContainer}>
        <ProgressItem icon="water-outline" value={54.7} unit="FL OZ" max={100} color="#4A90E2" />
        <ProgressItem icon="footsteps-outline" value={6876} unit="Steps" max={10000} color="#E24A8B" />
      </View>
      {Object.entries(meals).map(([mealType, meal]) => (
        <MealItem
          key={mealType}
          title={mealType}
          calories={meal.totals.calories}
          items={meal.foods}
          selectedDate={selectedDate}
        />
        
      ))}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    marginBottom: 70
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -80,
    marginTop: 10
  },
  arrowButton: {
    padding: 10,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dateText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarIcon: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    backgroundColor: '#38393a',
    borderRadius: 10,
    padding: 10,
    width: '90%',
  },
  macroGoalsContainer: {
    backgroundColor: '#38393a',
    borderRadius: 20,
    padding: 20,
    margin: 10,
    alignItems: 'center',

  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 'bold',
  },
  selectedTabText: {
    color: '#FD6300',
  },
  macroCircle: {
    position: 'relative',
    width: 150,
    height: 150,
  },
  overlayProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  macroTextContainer: {
    alignItems: 'center',
  },
  macroTotalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  macroTotalLabel: {
    fontSize: 14,
    color: 'white',
  },
  macroDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  macroDetailItem: {
    alignItems: 'center',
  },
  macroDetailDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  macroDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  macroDetailLabel: {
    fontSize: 12,
    color: 'white',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  progressItemContainer: {
    backgroundColor: '#38393a',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  progressItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressItemIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressItemTextContainer: {
    marginLeft: 15,
  },
  progressItemLabel: {
    fontSize: 14,
    color: 'white',
  },
  progressItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: '#FD6300',
    borderRadius: 15,
    padding: 5,
  },
  mealContainer: {
    backgroundColor: '#38393a',
    borderRadius: 15,
    marginHorizontal: 10,
    marginBottom: 15,
    padding: 15,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FD6300',
  },
  mealCalories: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
    marginBottom: 10,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#4A4B4C',
    paddingTop: 10,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  foodName: {
    fontSize: 14,
    color: 'white',
  },
  foodCalories: {
    fontSize: 14,
    color: 'white',
  },
});

export default Nutrition;