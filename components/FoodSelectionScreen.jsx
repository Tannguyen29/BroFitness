import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native'; 
import { foodDatabaseAppId, foodDatabaseAppKey } from '@env';

const FoodSelectionScreen = ({ route }) => {
  const { mealType } = route.params;
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHistory([
      { name: 'White rice, cooked', calories: 204, amount: '1 cup' },
      { name: 'Avocado', calories: 24, amount: '1 slice' },
      { name: 'Salad', calories: 150, amount: '1 cup, Asian salad' },
    ]);
    fetchInitialSuggestions();
  }, []);

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

  const handleAddFood = (food) => {
    console.log(`Added ${food.name} to ${mealType}`);
    navigation.goBack();
  };

  const handleFoodSelection = (food) => {
    navigation.navigate('FoodDetail', { foodItem: food });
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FD6300" />
            </TouchableOpacity>
            <Text style={styles.title}>{mealType}</Text>
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
          <Text style={styles.tabText}>My Meals</Text>
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