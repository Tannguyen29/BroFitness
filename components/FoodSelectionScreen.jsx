import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native'; 
import { foodDatabaseAppId, foodDatabaseAppKey } from '@env';
import axios from 'axios';
import { nutritionAppId, nutritionAppKey,API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
const FoodSelectionScreen = ({ route }) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [currentMealType, setCurrentMealType] = useState('');
  useEffect(() => {
    setHistory([
      { name: 'White rice, cooked', calories: 204, amount: '1 cup' },
      { name: 'Avocado', calories: 24, amount: '1 slice' },
      { name: 'Salad', calories: 150, amount: '1 cup, Asian salad' },
    ]);
    fetchInitialSuggestions();
  }, []);
  useEffect(() => {
    console.log('Route params:', route.params);
  }, []);
  useEffect(() => {
    const getMealType = async () => {
      try {
        const savedMealType = await AsyncStorage.getItem('currentMealType');
        if (savedMealType) {
          setCurrentMealType(savedMealType);
          console.log('Loaded meal type:', savedMealType);
        }
      } catch (error) {
        console.error('Error loading meal type:', error);
      }
    };

    getMealType();
  }, []);
  const fetchNutritionInfo = async (foodName) => {
    try {
      const ingredient = `1 serving ${foodName}`;
      const response = await fetch(
        `https://api.edamam.com/api/nutrition-data?app_id=${nutritionAppId}&app_key=${nutritionAppKey}&ingr=${encodeURIComponent(ingredient)}`
      );
      const data = await response.json();
      if (data.totalWeight === 0) {
        console.log('No nutrition data found for this food item');
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching nutrition info:', error);
      return null;
    }
  };
  const getNutrientValue = (nutritionInfo, nutrient, defaultValue = 0) => {
    return Math.round(nutritionInfo?.totalNutrients?.[nutrient]?.quantity) || defaultValue;
  };

  const fetchInitialSuggestions = async () => {
    setIsLoading(true); 
    const initialFoods = ['chicken', 'pho', 'black coffee', 'honey', 'strawberry', 'avocado', 'bacon', 'bun cha', 'cooked white rice', 'egg'];
    const suggestions = [];

    for (const food of initialFoods) {
      try {
        const response = await fetch(
          `https://api.edamam.com/api/food-database/v2/parser?app_id=${foodDatabaseAppId}&app_key=${foodDatabaseAppKey}&ingr=${encodeURIComponent(food)}`
        );
        const data = await response.json();
        if (data.hints && data.hints.length > 0) {
          const foodItem = data.hints[0].food;
          suggestions.push({
            name: foodItem.label,
            calories: Math.round(foodItem.nutrients.ENERC_KCAL),
            amount: '1 serving'
          });
        }
      } catch (error) {
        console.error(`Error fetching data for ${food}:`, error);
      }
    }

    setFoodSuggestions(suggestions);
    setIsLoading(false); // Stop loading
  };

  const fetchFoodSuggestions = async (query) => {
    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://api.edamam.com/api/food-database/v2/parser?app_id=${foodDatabaseAppId}&app_key=${foodDatabaseAppKey}&ingr=${query}`
        );
        const data = await response.json();
        setFoodSuggestions(data.hints.slice(0, 10).map(hint => ({
          name: hint.food.label,
          calories: Math.round(hint.food.nutrients.ENERC_KCAL),
          amount: '1 serving'
        })));
      } catch (error) {
        console.error('Error fetching food suggestions:', error);
      }
    } else if (query.length === 0) {
      fetchInitialSuggestions();
    }
  };

  const handleAddFood = async (food) => {
    // Tìm kiếm món ăn trong danh sách đã chọn
    const existingFoodIndex = selectedFoods.findIndex(
      item => item.name === food.name && 
              item.servingSize === '1' && 
              item.servingUnit === 'serving'
    );

    if (existingFoodIndex !== -1) {
      // Nếu món ăn đã tồn tại, tăng số lượng serving
      const updatedFoods = [...selectedFoods];
      const existingFood = updatedFoods[existingFoodIndex];
      
      const newNumberOfServings = existingFood.numberOfServings + 1;
      
      updatedFoods[existingFoodIndex] = {
        ...existingFood,
        numberOfServings: newNumberOfServings,
        calories: Math.round((existingFood.calories / existingFood.numberOfServings) * newNumberOfServings),
        protein: Math.round((existingFood.protein / existingFood.numberOfServings) * newNumberOfServings),
        fat: Math.round((existingFood.fat / existingFood.numberOfServings) * newNumberOfServings),
        carbs: Math.round((existingFood.carbs / existingFood.numberOfServings) * newNumberOfServings),
      };
      
      setSelectedFoods(updatedFoods);
    } else {
      // Nếu là món ăn mới, thêm vào danh sách
      const nutritionInfo = await fetchNutritionInfo(food.name);
      
      const newSelectedFood = {
        name: food.name,
        calories: nutritionInfo ? Math.round(nutritionInfo.calories) : food.calories,
        protein: nutritionInfo ? getNutrientValue(nutritionInfo, 'PROCNT') : 0,
        fat: nutritionInfo ? getNutrientValue(nutritionInfo, 'FAT') : 0,
        carbs: nutritionInfo ? getNutrientValue(nutritionInfo, 'CHOCDF') : 0,
        servingSize: '1',
        servingUnit: 'serving',
        numberOfServings: 1,
      };
      
      setSelectedFoods(prev => [...prev, newSelectedFood]);
    }
  };

  const handleFoodSelection = (food) => {
    navigation.navigate('FoodDetail', {
      foodItem: food,
      mealType: currentMealType
    });
  };
  

  useEffect(() => {
    console.log('Selected Foods Updated:', selectedFoods);
  }, [selectedFoods]);

  useEffect(() => {
    if (route.params?.selectedFood) {
      const newFood = route.params.selectedFood;
      // Tìm kiếm món ăn trong danh sách đã chọn với cùng serving size và unit
      const existingFoodIndex = selectedFoods.findIndex(
        item => item.name === newFood.name && 
                item.servingUnit === newFood.servingUnit
      );

      if (existingFoodIndex !== -1) {
        // Nếu món ăn đã tồn tại với cùng serving size và unit, cộng dồn số lượng
        const updatedFoods = [...selectedFoods];
        const existingFood = updatedFoods[existingFoodIndex];
        
        const newNumberOfServings = existingFood.numberOfServings + newFood.numberOfServings;
        
        updatedFoods[existingFoodIndex] = {
          ...existingFood,
          numberOfServings: newNumberOfServings,
          calories: Math.round((existingFood.calories / existingFood.numberOfServings) * newNumberOfServings),
          protein: Math.round((existingFood.protein / existingFood.numberOfServings) * newNumberOfServings),
          fat: Math.round((existingFood.fat / existingFood.numberOfServings) * newNumberOfServings),
          carbs: Math.round((existingFood.carbs / existingFood.numberOfServings) * newNumberOfServings),
        };
        
        setSelectedFoods(updatedFoods);
      } else {
        
        setSelectedFoods(prev => [...prev, newFood]);
      }
    }
  }, [route.params?.selectedFood]);

  const handleSaveMeal = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const currentMealType = await AsyncStorage.getItem('currentMealType');
      const currentMealDate = await AsyncStorage.getItem('currentMealDate');
      
      // Add detailed logging
      console.log('Saving meal with date (raw):', currentMealDate);
      console.log('Date object created:', new Date(currentMealDate));
      console.log('ISO string:', new Date(currentMealDate).toISOString());
      
      // Kiểm tra điều kiện trước khi gọi API
      if (!currentMealType || selectedFoods.length === 0) {
        Alert.alert('Error', 'Please select meal type and add foods');
        return;
      }
  
      if (!currentMealDate) {
        Alert.alert('Error', 'Meal date not found');
        return;
      }

      // Ensure date is properly formatted as ISO string
      const formattedDate = new Date(currentMealDate).toISOString();
  
      const response = await axios.post(`${API_BASE_URL}/savemeals`, {
        mealType: currentMealType,
        foods: selectedFoods,
        date: formattedDate // Send as ISO string
      }, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('Request payload:', {
        mealType: currentMealType,
        foods: selectedFoods.length,
        date: formattedDate
      });
      console.log('Response:', response.data);
      
      // Clear selected foods và mealType sau khi save thành công
      setSelectedFoods([]);
      await Promise.all([
        AsyncStorage.removeItem('currentMealType'),
        AsyncStorage.removeItem('currentMealDate')
      ]); // Xóa cả mealType và date khỏi storage
      
      Alert.alert('Success', 'Meal saved successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack() // Quay về màn hình trước
        }
      ]);
      
    } catch (error) {
      console.error('Error saving meal:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to save meal. Please try again later.';
      Alert.alert('Error', errorMessage);
    }
  };
  const renderFoodItem = ({ item, section }) => (
    <TouchableOpacity style={styles.foodItem} onPress={() => handleFoodSelection(item)}>
      <View style={styles.foodItemLeft}>
        {section.title === 'Suggestions' && (
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.checkIcon} />
        )}
        <View>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodDetails}>{item.calories} cal, {item.amount}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => handleAddFood(item)}>
        <Ionicons name="add" size={24} color="#FD6300" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  
  
  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../assets/animation/Loading.json')}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSaveMeal}>
              <Ionicons name="arrow-back" size={24} color="#FD6300" />
            </TouchableOpacity>
            <Text style={styles.title}>{currentMealType}</Text>
          </View>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={24} color="#FD6300" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a food"
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                fetchFoodSuggestions(text);
              }}
            />
          </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText} onPress={() => navigation.navigate('MyMeal')}>My Meals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>My Recipes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>My Foods</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="camera-outline" size={24} color="#FD6300" />
          <Text style={styles.quickActionText}>Scan a Meal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="barcode-outline" size={24} color="#FD6300" />
          <Text style={styles.quickActionText}>Scan a Barcode</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>History</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>Most Recent</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={history}
          renderItem={({ item }) => renderFoodItem({ item, section: { title: 'History' } })}
          keyExtractor={(item, index) => `history-${index}`}
          ListEmptyComponent={<Text style={styles.emptyText}>No history available</Text>}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
        </View>
        <FlatList
          data={foodSuggestions}
          renderItem={({ item }) => renderFoodItem({ item, section: { title: 'Suggestions' } })}
          keyExtractor={(item, index) => `suggestion-${index}`}
          ListEmptyComponent={<Text style={styles.emptyText}>No suggestions available</Text>}
        />
      </View>
      </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1F21',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FD6300',
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38393A',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFF',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FD6300',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
  },
  activeTabText: {
    color: '#FD6300',
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#38393A',
    borderRadius: 8,
    padding: 16,
    width: '45%',
  },
  quickActionText: {
    color: '#FD6300',
    marginTop: 8,
  },
  listContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  sectionAction: {
    color: '#FD6300',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#38393A',
  },
  foodItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 12,
  },
  foodName: {
    fontSize: 16,
    color: '#FFF',
  },
  foodDetails: {
    fontSize: 14,
    color: '#888',
  },
  addButton: {
    padding: 8,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
});

export default FoodSelectionScreen;