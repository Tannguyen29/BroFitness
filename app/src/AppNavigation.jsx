import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screen/HomeScreen";
import SignIn from "../(auth)/signIn"
import SignUp from "../(auth)/signUp"
import OnboardScreen from "../screen/OnboardScreen";
import BottomNavigation from "./BottomNavigation";
import EmailInput from "../(forgotPassword)/EmailInput";
import OtpInput from "../(forgotPassword)/OtpInput";
import ResetPassword from "../(forgotPassword)/ResetPassword";

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
        <Stack.Screen name="EmailInput" component={EmailInput} options={{ headerShown: false }}/>
        <Stack.Screen name="OtpInput" component={OtpInput} options={{ headerShown: false }}/>
        <Stack.Screen name="ResetPassword" component={ResetPassword} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
