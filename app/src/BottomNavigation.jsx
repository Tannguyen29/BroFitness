import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainPage from '../(tabs)/MainPage';
import Profiles from '../(tabs)/profile';
import Calendars from '../(tabs)/Calendar';
import Discovers from '../(tabs)/Discover';
import Personal from '../(tabs)/Personal';
import { Home, Profile, Calendar, Discover, TaskSquare } from 'iconsax-react-native';

const Tab = createBottomTabNavigator();

const TabBarRadius = 25;

const BottomNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="MainPage"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'MainPage') {
            return <Home size={size} color={focused ? 'coral' : "#676767"} />;
          } else if (route.name === 'Calendar') {
            return <Calendar size={size} color={focused ? 'coral' : "#676767"} />;
          } else if (route.name === 'Profile') {
            return <Profile size={size} color={focused ? 'coral' : "#676767"} />;
          } else if (route.name === 'Personal') {
            return <TaskSquare size={size} color={focused ? 'coral' : "#676767"} />;
          }else {
            return <Discover size={size} color={focused ? 'coral' : "#676767"} />;
          }
        },
        tabBarLabel: ({ focused }) => {
          if (!focused) return null;

          let labelText;
          if (route.name === 'MainPage') {
            labelText = 'Home';
          } else if (route.name === 'Profile') {
            labelText = 'Profile';
          } else if (route.name === 'Calendar') {
            labelText = 'Calendar';
          }else if (route.name === 'Personal') {
            labelText = 'Personal';
          } else {
            labelText = 'Discover';
          }

          return <Text style={{ fontSize: 12, fontWeight: 'bold', color: focused ? 'coral' : "#676767" }}>{labelText}</Text>;
        },
        tabBarItemStyle: {
          flexDirection: 'column',
          alignItems: 'center',
          top: 5,
        },
        tabBarStyle: {
          position: 'absolute',
          height: 75,
          paddingBottom: 30,
          backgroundColor: 'black',
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen name="MainPage" component={MainPage} />
      <Tab.Screen name="Discover" component={Discovers} />
      <Tab.Screen name="Personal" component={Personal} />
      <Tab.Screen name="Calendar" component={Calendars} />
      <Tab.Screen name="Profile" component={Profiles} />
    </Tab.Navigator>
  );
};

export default BottomNavigation;
