import React, { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import axios from 'axios';
import { View, ActivityIndicator } from 'react-native';
import HomeScreen from "../screen/HomeScreen";
import SignIn from "../(auth)/signIn";
import SignUp from "../(auth)/signUp";
import OnboardScreen from "../screen/OnboardScreen";
import BottomNavigation from "./BottomNavigation";
import EmailInput from "../(forgotPassword)/EmailInput";
import OtpInput from "../(auth)/OtpInput";
import ResetPassword from "../(forgotPassword)/ResetPassword";
import OtpForgotPassword from "../(forgotPassword)/OtpForgotPassword";
import FinishResetPassword from "../(forgotPassword)/FinishResetPassword";
import PersonalInformationSetup from "../screen/PersonalInformationSetup";
import PlanDetail from "../(tabs)/PlanDetailPage";
import PlanOverview from '../../components/PlanOverview';
import WorkoutScreen from '../screen/WorkoutScreen';
import WorkoutCompletedScreen from '../screen/WorkoutCompletedScreen';
import AllPlan from '../screen/AllPlans'
import ProfileEdit from '../../components/ProfileEdit'
import FoodSelectionScreen from '../../components/FoodSelectionScreen'
import FoodDetail from '../../components/FoodDetailScreen'
import SetupCompletionScreen from '../screen/SetupCompletionScreen'
import { API_BASE_URL } from '@env';

const Stack = createNativeStackNavigator();

const PlanOverviewScreen = ({ route, navigation }) => {
  const { planId } = route.params;
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/plans/${planId}`);
        setPlan(response.data);
      } catch (error) {
        console.error("Error fetching plan:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [planId]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <PlanOverview plan={plan} navigation={navigation} />;
};

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
        <Stack.Screen name="PlanOverview" component={PlanOverviewScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="PlanDetail" component={PlanDetail} options={{ headerShown: false }}/>
        <Stack.Screen name="Workout" component={WorkoutScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="WorkoutCompleted" component={WorkoutCompletedScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="AllPlans" component={AllPlan} options={{ headerShown: false }}/>
        <Stack.Screen name="ProfileEdit" component={ProfileEdit} options={{ headerShown: false }}/>
        <Stack.Screen name="FoodSelectionScreen" component={FoodSelectionScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="FoodDetail" component={FoodDetail} options={{ headerShown: false }}/>
        <Stack.Screen name="SetupCompletion" component={SetupCompletionScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;