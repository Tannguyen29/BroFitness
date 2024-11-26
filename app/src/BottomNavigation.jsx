import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainPage from '../(tabs)/MainPage';
import Profiles from '../(tabs)/profile';
import Calendars from '../(tabs)/Calendar';
import Nutrition from '../(tabs)/Nutrition';
import Personal from '../(tabs)/Personal';
import PTPlans from '../(tabs)/PTPlans'; 
import { Home, Profile, Calendar, Discover, TaskSquare, Edit } from 'iconsax-react-native';
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
          setUserRole('free');
          setIsLoading(false);
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/users/info`, {
          headers: { 'x-auth-token': token }
        });

        setUserRole(response.data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
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
    ];

    if (userRole === 'PT') {
      screens.push(
        <Tab.Screen key="Plans" name="Plans" component={PTPlans} />,
        <Tab.Screen key="Calendar" name="Calendar" component={Calendars} />
      );
    } else {
      screens.push(
        <Tab.Screen 
          key="Personal" 
          name="Personal" 
          component={Personal}
          listeners={{
            tabPress: (e) => {
              if (userRole === 'free') {
                // Prevent navigation to Personal tab
                e.preventDefault();
                // You can add alert or navigation to premium subscription page here
                alert('Please upgrade to Premium to access Personal features');
              }
            },
          }}
        />
      );
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
            return <TaskSquare size={size} color={userRole === 'free' ? '#999999' : (focused ? 'coral' : "#676767")} />;
          } else if (route.name === 'Plans') {
            return <Edit size={size} color={focused ? 'coral' : "#676767"} />;
          } else {
            return <Discover size={size} color={focused ? 'coral' : "#676767"} />;
          }
        },
        tabBarLabel: ({ focused }) => {
          if (!focused) return null;

          let labelText = route.name === 'MainPage' ? 'Home' : route.name;
          return (
            <Text style={{ 
              fontSize: 12, 
              fontWeight: 'bold', 
              color: route.name === 'Personal' && userRole === 'free' 
                ? '#999999' 
                : (focused ? 'coral' : "#676767")
            }}>
              {labelText}
            </Text>
          );
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