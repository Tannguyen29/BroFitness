import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainPage from '../(tabs)/MainPage';
import Profiles from '../(tabs)/profile';
import Calendars from '../(tabs)/Calendar';
import Nutrition from '../(tabs)/Nutrition';
import Personal from '../(tabs)/Personal';
import { Home, Profile, Calendar, Discover, TaskSquare } from 'iconsax-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const Tab = createBottomTabNavigator();

const BottomNavigation = () => {
  const [userRole, setUserRole] = useState('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        
        if (!token) {
          console.log('No token found');
          setUserRole('free');
          setIsLoading(false);
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/user-info`, {
          headers: { 'x-auth-token': token }
        });

        setUserRole(response.data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
        if (error.response) {
          console.log('Error response:', error.response.data);
          console.log('Error status:', error.response.status);
        }
        setUserRole('free');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (isLoading) {
    return null;
  }

  const getTabScreens = () => {    
    const screens = [
      <Tab.Screen key="MainPage" name="MainPage" component={MainPage} />,
      <Tab.Screen key="Nutrition" name="Nutrition" component={Nutrition} />,
      <Tab.Screen key="Personal" name="Personal" component={Personal} />,
    ];

    if (userRole === 'PT') {
      screens.push(<Tab.Screen key="Calendar" name="Calendar" component={Calendars} />);
    }

    screens.push(<Tab.Screen key="Profile" name="Profile" component={Profiles} />);

    return screens;
  };

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
          } else {
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
          } else if (route.name === 'Personal') {
            labelText = 'Personal';
          } else {
            labelText = 'Nutrition';
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
      {getTabScreens()}
    </Tab.Navigator>
  );
};

export default BottomNavigation;