import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const MyMealsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mealType } = route.params || { mealType: 'Breakfast' }; 
  const [searchQuery, setSearchQuery] = useState('');

  const handleAllTab = () => {
    navigation.navigate('FoodSelectionScreen', { mealType });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('FoodSelectionScreen', { mealType })}>
          <Ionicons name="arrow-back" size={24} color="#FD6300" />
        </TouchableOpacity>
        <Text style={styles.title}>{mealType}</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color="#FD6300" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a meal"
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={styles.tab}
          onPress={handleAllTab}
        >
          <Text style={styles.tabText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>My Meals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>My Recipes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>My Foods</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={styles.quickActionButton} 
          onPress={() => navigation.navigate('AddMeal', { mealType })}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FD6300" />
          <Text style={styles.quickActionText}>Add New Meal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.emptyContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#FD6300" />
          </View>
          <Text style={styles.emptyText}>No custom meals yet</Text>
          <Text style={styles.subText}>Create your first custom meal by clicking the button above</Text>
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
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38393A',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    justifyContent: 'center',
  },
  quickActionText: {
    color: '#FD6300',
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    backgroundColor: 'rgba(253, 99, 0, 0.1)',
    padding: 24,
    borderRadius: 50,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default MyMealsScreen;