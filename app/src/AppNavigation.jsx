import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screen/HomeScreen";
import SignIn from "../(auth)/signIn"
import SignUp from "../(auth)/signUp"
import OnboardScreen from "../screen/OnboardScreen";
import BottomNavigation from "./BottomNavigation";
import EmailInput from "../(forgotPassword)/EmailInput";
import OtpInput from "../(auth)/OtpInput";
import ResetPassword from "../(forgotPassword)/ResetPassword";
import OtpForgotPassword from "../(forgotPassword)/OtpForgotPassword";
import FinishResetPassword from "../(forgotPassword)/FinishResetPassword";
import PersonalInformationSetup from "../screen/PersonalInformationSetup";
const Stack = createNativeStackNavigator();

const AppNavigation = ({ initialRoute }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }}/>
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }}/>
        <Stack.Screen name="BottomTabs" component={BottomNavigation} options={{ headerShown: false }}/>
        <Stack.Screen name="OnboardScreen" component={OnboardScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="EmailInput" component={EmailInput} options={{ headerShown: false }}/>
        <Stack.Screen name="OtpInput" component={OtpInput} options={{ headerShown: false }}/>
        <Stack.Screen name="ResetPassword" component={ResetPassword} options={{ headerShown: false }}/>
        <Stack.Screen name="OtpForgotPassword" component={OtpForgotPassword} options={{ headerShown: false }}/>
        <Stack.Screen name="FinishResetPassword" component={FinishResetPassword} options={{ headerShown: false }}/>
        <Stack.Screen name="PersonalInformationSetup" component={PersonalInformationSetup} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;