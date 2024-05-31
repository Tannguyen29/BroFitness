import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainPage from '../(tabs)/MainPage';
import Profile from '../(tabs)/profile';

const Tab = createBottomTabNavigator();

const BottomNavigation = () => {
  return (
    <Tab.Navigator initialRouteName="MainPage">
      <Tab.Screen name="MainPage" component={MainPage} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomNavigation;
