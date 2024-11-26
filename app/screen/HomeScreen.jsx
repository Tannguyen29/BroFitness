import { ScrollView, Text, View, ImageBackground,Image, Button, Dimensions } from 'react-native';
import { StatusBar } from "expo-status-bar";
import logo from '../../assets/image/logo.png'
import gym from '../../assets/image/gym.jpg'
import CustomButton from '../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
const HomeScreen  = () => {
    const navigation = useNavigation();
    const [premiumStatus, setPremiumStatus] = useState(null);

    useEffect(() => {
        const checkPremiumStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    const response = await axios.get(`${API_BASE_URL}/payment/premium-status`, {
                        headers: { 'x-auth-token': token }
                    });
                    console.log('Home screen - Premium status:', response.data);
                    setPremiumStatus(response.data);
                    
                    const userInfo = await AsyncStorage.getItem('userInfo');
                    if (userInfo) {
                        const parsedInfo = JSON.parse(userInfo);
                        parsedInfo.role = response.data.role;
                        console.log('Updating user info with role:', response.data.role);
                        await AsyncStorage.setItem('userInfo', JSON.stringify(parsedInfo));
                    }
                }
            } catch (error) {
                console.error('Error checking premium status:', error);
            }
        };

        checkPremiumStatus();
        const interval = setInterval(checkPremiumStatus, 3600000);
        return () => clearInterval(interval);
    }, []);

  return (
    <View className="bg-black flex-1">
      <ImageBackground source={gym} resizeMode="cover" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle="flex-grow">
          <View className="w-full justify-center items-center">
            <Image
              source={logo}
              className="w-[180px] h-[200px]"
              resizeMode="contain"
            />
          </View>
          <View className="w-full justify-center items-left pb-1 mt-72 ml-5">
            <Text className="text-white text-3xl font-bold">
              Welcome to <Text className="text-orange-500">Bro Fitness</Text>
            </Text>
            <Text className="text-white mt-3 mr-20">
              This app provides customized workouts, exercise tracking, and
              nutrition plans to build strength and boost overall fitness. Stay
              motivated as you sculpt your body and unleash your potential.
            </Text>
            <View className="flex flex-row gap-2">
              <CustomButton
                title="Sign In"
                handlePress={() => navigation.navigate("SignIn")}
                containerStyle="mt-10 w-48 bg-orange-500 mr-3 items-center justify-center"
              />
              <CustomButton
                title="Sign Up"
                handlePress={() => navigation.navigate("SignUp")}
                containerStyle="mt-10 w-48 border-2 border-white items-center justify-center"
              />
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
      <StatusBar
        backgroundColor="#161622"
        style="light"
        barStyle="light-content"
      />
    </View>
  );
}

export default HomeScreen 