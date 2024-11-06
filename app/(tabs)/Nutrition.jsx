import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getUserInfo } from '../../config/api';
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

const MacroGoals = ({ carbs, protein, fat, total }) => {
  const [selectedTab, setSelectedTab] = useState('Macros');
  const tabs = ['Macros', 'Nutrients', 'Calories'];

  const calculateFill = (value) => (value / (carbs + protein + fat)) * 100;

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
          fill={100}
          tintColor="#7DDA58"
          backgroundColor="#F0F0F0"
          arcSweepAngle={360}
          rotation={0}
          lineCap="round"
        >
          {() => (
            <View style={styles.macroTextContainer}>
              <Text style={styles.macroTotalValue}>{total}</Text>
              <Text style={styles.macroTotalLabel}>Calories left</Text>
            </View>
          )}
        </AnimatedCircularProgress>
        <AnimatedCircularProgress
          size={150}
          width={15}
          backgroundWidth={5}
          fill={calculateFill(protein)}
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
          fill={calculateFill(fat)}
          tintColor="#E2C44A"
          backgroundColor="transparent"
          arcSweepAngle={360}
          rotation={0}
          lineCap="round"
          style={styles.overlayProgress}
        />
      </View>
      <View style={styles.macroDetailsContainer}>
        <MacroDetail label="Carbs" value={carbs} color="#7DDA58" />
        <MacroDetail label="Protein" value={protein} color="#E24A8B" />
        <MacroDetail label="Fat" value={fat} color="#E2C44A" />
      </View>
    </View>
  );
};

const MacroDetail = ({ label, value, color }) => (
  <View style={styles.macroDetailItem}>
    <View style={[styles.macroDetailDot, { backgroundColor: color }]} />
    <Text style={styles.macroDetailValue}>{value}g</Text>
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

const MealItem = ({ title, calories, items }) => {
  const navigation = useNavigation();

  const handleAddFood = () => {
    navigation.navigate('FoodSelectionScreen', { mealType: title });
  };

  return (
    <View style={styles.mealContainer}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTitle}>{title}</Text>
        <TouchableOpacity onPress={handleAddFood}>
          <Ionicons name="add-circle-outline" size={24} color="#FD6300" />
        </TouchableOpacity>
      </View>
      <Text style={styles.mealCalories}>{calories} cal</Text>
      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.foodItem}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodCalories}>{item.calories} cal</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const Nutrition = ({ route }) => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [breakfastItems, setBreakfastItems] = useState([]);
  const [lunchItems, setLunchItems] = useState([]);
  const [dinnerItems, setDinnerItems] = useState([]);
  const [caloriesLeft, setCaloriesLeft] = useState(0);
  const totalCalories = breakfastItems.reduce((total, item) => total + (parseFloat(item.calories) || 0), 0) +
    lunchItems.reduce((total, item) => total + (parseFloat(item.calories) || 0), 0) +
    dinnerItems.reduce((total, item) => total + (parseFloat(item.calories) || 0), 0);

  const totalCarbs = breakfastItems.reduce((total, item) => total + (parseFloat(item.carbs) || 0), 0) +
    lunchItems.reduce((total, item) => total + (parseFloat(item.carbs) || 0), 0) +
    dinnerItems.reduce((total, item) => total + (parseFloat(item.carbs) || 0), 0);

  const totalProtein = breakfastItems.reduce((total, item) => total + (parseFloat(item.protein) || 0), 0) +
    lunchItems.reduce((total, item) => total + (parseFloat(item.protein) || 0), 0) +
    dinnerItems.reduce((total, item) => total + (parseFloat(item.protein) || 0), 0);

  const totalFat = breakfastItems.reduce((total, item) => total + (parseFloat(item.fat) || 0), 0) +
    lunchItems.reduce((total, item) => total + (parseFloat(item.fat) || 0), 0) +
    dinnerItems.reduce((total, item) => total + (parseFloat(item.fat) || 0), 0);

  const calculateBMR = (gender, weight, height, age) => {
    if (gender === 'male') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  };
  
  useEffect(() => {
    const fetchUserInfoAndCalculateCalories = async () => {
      const userInfo = await getUserInfo();
  
      if (userInfo.personalInfoCompleted) {
        const { gender, age, weight, height } = userInfo;
        const bmr = calculateBMR(gender, weight, height, age);
  
        // Calculate remaining calories and round to the nearest whole number
        const remainingCalories = bmr - totalCalories;
        setCaloriesLeft(remainingCalories > 0 ? Math.round(remainingCalories) : 0);
      }
    };
  
    fetchUserInfoAndCalculateCalories();
  }, [totalCalories]);
  


  useEffect(() => {
    if (route.params?.addedFood) {
      const { mealType, addedFood } = route.params;
  
      const updateMealItems = (mealItems, setMealItems) => {
        const existingFoodIndex = mealItems.findIndex(item => item.name === addedFood.name);
  
        if (existingFoodIndex !== -1) {
          // If the food item already exists, accumulate the values
          const updatedMealItems = mealItems.map((item, index) => {
            if (index === existingFoodIndex) {
              return {
                ...item,
                calories: Math.round(parseFloat(item.calories) + parseFloat(addedFood.calories)),
                protein: Math.round(parseFloat(item.protein) + parseFloat(addedFood.protein)),
                fat: Math.round(parseFloat(item.fat) + parseFloat(addedFood.fat)),
                carbs: Math.round(parseFloat(item.carbs) + parseFloat(addedFood.carbs)),
                numberOfServings: item.numberOfServings + addedFood.numberOfServings,
              };
            }
            return item;
          });
          setMealItems(updatedMealItems);
        } else {
          setMealItems([...mealItems, addedFood]);
        }
      };
  
      if (mealType === 'Breakfast') {
        updateMealItems(breakfastItems, setBreakfastItems);
      } else if (mealType === 'Lunch') {
        updateMealItems(lunchItems, setLunchItems);
      } else if (mealType === 'Dinner') {
        updateMealItems(dinnerItems, setDinnerItems);
      }
    }
  }, [route.params?.addedFood]);
  


  return (
    <ScrollView style={styles.container}>
      <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <MacroGoals carbs={totalCarbs} protein={totalProtein} fat={totalFat} total={caloriesLeft} />

      <View style={styles.progressContainer}>
        <ProgressItem icon="water-outline" value={54.7} unit="FL OZ" max={100} color="#4A90E2" />
        <ProgressItem icon="footsteps-outline" value={6876} unit="Steps" max={10000} color="#E24A8B" />
      </View>

      <MealItem
        title="Breakfast"
        calories={breakfastItems.reduce((total, item) => total + item.calories, 0)}
        items={breakfastItems}
      />

      <MealItem
        title="Lunch"
        calories={lunchItems.reduce((total, item) => total + item.calories, 0)}
        items={lunchItems}
      />

      <MealItem
        title="Dinner"
        calories={dinnerItems.reduce((total, item) => total + item.calories, 0)}
        items={dinnerItems}
      />
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