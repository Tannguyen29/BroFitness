import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screen/HomeScreen";
import SignIn from "../(auth)/signIn"
import SignUp from "../(auth)/signUp"
import OnboardScreen from "../screen/OnboardScreen";
import BottomNavigation from "./BottomNavigation";

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="OnboardScreen">
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }}/>
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }}/>
        <Stack.Screen name="BottomTabs" component={BottomNavigation} options={{ headerShown: false }}/>
        <Stack.Screen name="OnboardScreen" component={OnboardScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
