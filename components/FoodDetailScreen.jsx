import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { nutritionAppId, nutritionAppKey } from '@env';

const FoodDetailScreen = ({ route }) => {
  const { mealType } = route.params;
  const { foodItem } = route.params;
  const navigation = useNavigation();
  const [nutritionInfo, setNutritionInfo] = useState(null);
  const [servingSize, setServingSize] = useState('1');
  const [servingUnit, setServingUnit] = useState('cup');
  const [numberOfServings, setNumberOfServings] = useState(1);

  useEffect(() => {
    fetchNutritionInfo();
  }, [servingSize, servingUnit]);

  const fetchNutritionInfo = async () => {
    try {
      const ingredient = `${servingSize} ${servingUnit} ${foodItem.name}`;
      const response = await fetch(
        `https://api.edamam.com/api/nutrition-data?app_id=${nutritionAppId}&app_key=${nutritionAppKey}&ingr=${encodeURIComponent(ingredient)}`
      );
      const data = await response.json();
      if (data.totalWeight === 0) {
        console.log('No nutrition data found for this food item');
        setNutritionInfo(null);
      } else {
        setNutritionInfo(data);
      }
    } catch (error) {
      console.error('Error fetching nutrition info:', error);
      setNutritionInfo(null);
    }
  };

  const handleAddFood = () => {
    if (!nutritionInfo) return;
    
    const newFood   = {
      name: foodItem.name,
      calories: Math.round(nutritionInfo.calories * numberOfServings),
      protein: Math.round(getNutrientValue('PROCNT') * numberOfServings),
      fat: Math.round(getNutrientValue('FAT') * numberOfServings),
      carbs: Math.round(getNutrientValue('CHOCDF') * numberOfServings),
      servingSize,
      servingUnit,
      numberOfServings,
    };

    // Pass the food data back and update selectedFoods
    navigation.navigate('FoodSelectionScreen', {
      selectedFood: newFood
    });
  };
  
  const getNutrientValue = (nutrient, defaultValue = 0) => {
    return Math.round(nutritionInfo?.totalNutrients?.[nutrient]?.quantity) || defaultValue;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FD6300" />
        </TouchableOpacity>
        <Text style={styles.title}>{foodItem.name}</Text>
        <TouchableOpacity onPress={handleAddFood}>
          <Ionicons name="add" size={24} color="#FD6300" />
        </TouchableOpacity>
      </View>

      <View style={styles.nutritionContainer}>
        <Text style={styles.nutritionTitle}>Nutrition Facts</Text>
        {nutritionInfo ? (
          <>
            <Text style={styles.nutritionItem}>Calories: {nutritionInfo.calories || 0}</Text>
            <Text style={styles.nutritionItem}>Protein: {getNutrientValue('PROCNT')}g</Text>
            <Text style={styles.nutritionItem}>Fat: {getNutrientValue('FAT')}g</Text>
            <Text style={styles.nutritionItem}>Carbs: {getNutrientValue('CHOCDF')}g</Text>
          </>
        ) : (
          <Text style={styles.nutritionItem}>No nutrition data available</Text>
        )}
      </View>

      <View style={styles.servingContainer}>
        <Text style={styles.servingTitle}>Serving Size</Text>
        <View style={styles.servingInputContainer}>
          <TextInput
            style={styles.servingInput}
            value={servingSize}
            onChangeText={(text) => setServingSize(text)}
            keynpx ardType="numeric"
          />
          <TextInput
            style={styles.servingInput}
            value={servingUnit}
            onChangeText={setServingUnit}
          />
        </View>
      </View>

      <View style={styles.servingContainer}>
        <Text style={styles.servingTitle}>Number of Servings</Text>
        <View style={styles.servingInputContainer}>
          <TouchableOpacity onPress={() => setNumberOfServings(Math.max(1, numberOfServings - 1))}>
            <Ionicons name="remove" size={24} color="#FD6300" />
          </TouchableOpacity>
          <TextInput
            style={styles.servingInput}
            value={numberOfServings.toString()}
            onChangeText={(text) => setNumberOfServings(parseInt(text) || 1)}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={() => setNumberOfServings(numberOfServings + 1)}>
            <Ionicons name="add" size={24} color="#FD6300" />
          </TouchableOpacity>
        </View>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FD6300',
  },
  nutritionContainer: {
    padding: 16,
    backgroundColor: '#38393A',
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  nutritionItem: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 4,
  },
  servingContainer: {
    padding: 16,
    backgroundColor: '#38393A',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  servingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  servingInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servingInput: {
    backgroundColor: '#1E1F21',
    color: '#FFF',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 8,
    textAlign: 'center',
  },
});

export default FoodDetailScreen;