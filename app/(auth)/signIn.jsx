import React, { useState, useEffect } from "react";
import { Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import logo from "../../assets/image/gymLogo.png";
import CustomButton from "../../components/CustomButton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUserInfo, getUserInfo } from "../../config/api";
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { API_BASE_URL } from '@env';

const appleLogo = require('../../assets/image/apple.png');
const facebookLogo = require('../../assets/image/facebook.png');
const googleLogo = require('../../assets/image/google.png');

const SignIn = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  useEffect(() => {
    const checkLoginStatus = async () => {
      const { token, name, personalInfoCompleted } = await getUserInfo();
      if (token) {
        if (personalInfoCompleted) {
          navigation.navigate("BottomTabs");
        } else {
          navigation.navigate("PersonalInformationSetup");
        }
      }
    };

    const loadRememberMeState = async () => {
      try {
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');
        if (savedRememberMe !== null) {
          setRememberMe(savedRememberMe === 'true');
        }
      } catch (error) {
        console.error('Error loading remember me state:', error);
      }
    };

    checkLoginStatus();
    loadRememberMeState();
  }, []);

  useEffect(() => {
    const loadSavedCredentials = async () => {
      if (rememberMe) {
        try {
          const savedEmail = await AsyncStorage.getItem('savedEmail');
          const savedPassword = await AsyncStorage.getItem('savedPassword');
          if (savedEmail) setEmail(savedEmail);
          if (savedPassword) setPassword(savedPassword);
        } catch (error) {
          console.error('Error loading saved credentials:', error);
        }
      }
    };

    loadSavedCredentials();
  }, [rememberMe]);

  const handleRememberMe = async (value) => {
    setRememberMe(value);
    try {
      await AsyncStorage.setItem('rememberMe', value.toString());
    } catch (error) {
      console.error('Error saving remember me state:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, { email, password });
      const { token, name, personalInfoCompleted } = response.data;
  
      await saveUserInfo(token, name || email, personalInfoCompleted);
  
      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
      } else {
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
      }
  
      if (!personalInfoCompleted) {
        navigation.navigate("PersonalInformationSetup");
      } else {
        navigation.navigate("BottomTabs");
      }
    } catch (error) {
      setError(error.response ? error.response.data : 'Error signing in');
    }
  };

  const getInputStyle = (isFocused, hasValue) => {
    if (isFocused || hasValue) {
      return {
        backgroundColor: 'black',
        color: 'white',
      };
    }
    return {
      backgroundColor: '#38393A',
      color: '#C7D1D9',
    };
  };

  return (
    <SafeAreaView className="bg-black flex-1">
      <ScrollView contentContainerStyle="flex-grow">
        <View className="w-full justify-center items-center">
          <Image
            source={logo}
            className="w-[70px] h-[150px]"
            resizeMode="contain"
          />
          <Text className="text-white text-2xl font-bold mb-8">
            Welcome to <Text className="text-orange-500">Bro Fitness</Text>
          </Text>
          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            textColor='white'
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            style={[
              { width: '85%', marginBottom: 20 },
              getInputStyle(isEmailFocused, email.length > 0)
            ]}
            outlineStyle={{
              borderRadius: 20,
            }}
            outlineColor={isEmailFocused || email.length > 0 ? 'white' : 'transparent'}
            activeOutlineColor='#FD6300'
            theme={{
              colors: {
                primary: '#FD6300',
                onSurfaceVariant: isEmailFocused || email.length > 0 ? 'white' : '#C7D1D9',
              },
            }}
          />
          <View style={{ position: 'relative', width: '85%', marginBottom: 10 }}>
            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              mode="outlined"
              secureTextEntry={!showPassword} 
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              style={[
                { width: '100%', paddingRight: 50 }, 
                getInputStyle(isPasswordFocused, password.length > 0)
              ]}
              outlineStyle={{
                borderRadius: 20,
              }}
              outlineColor={isPasswordFocused || password.length > 0 ? 'white' : 'transparent'}
              activeOutlineColor='#FD6300'
              textColor='white'
              theme={{
                colors: {
                  primary: '#FD6300',
                  onSurfaceVariant: isPasswordFocused || password.length > 0 ? 'white' : '#C7D1D9',
                },
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 15,
                top: '50%',
                transform: [{ translateY: -12 }], 
              }}
            >
              <Icon name={showPassword ? 'visibility-off' : 'visibility'} size={24} color="white" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("EmailInput")}>
            <Text className="text-orange-500 mt-5 left-1/4">
              Forgot Password?
            </Text>
          </TouchableOpacity>
          <View
            style={{ flexDirection: "row", alignItems: "center", right: 100 }}
          >
            <TouchableOpacity
              onPress={() => handleRememberMe(!rememberMe)}
              style={{
                height: 24,
                width: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "white",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              {rememberMe && (
                <View
                  style={{
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: "#FD6300",
                  }}
                />
              )}
            </TouchableOpacity>
            <Text style={{ color: "white" }}>Remember Me</Text>
          </View>
          <CustomButton
            title="Sign In"
            containerStyle="mt-10 w-4/5 bg-orange-500 items-center justify-center rounded-3xl"
            handlePress={handleSignIn}
          />
          {error && <Text className="text-red-500 mt-4">{error}</Text>}
          <View className="flex-row items-center mt-12 w-4/5">
            <View className="flex-1 h-px bg-gray-600" />
            <Text className="text-gray-400 mx-2">Or sign In with</Text>
            <View className="flex-1 h-px bg-gray-600" />
          </View>
          <View className="flex-row justify-around mt-6 w-4/5 mb-12">
            <TouchableOpacity className="border border-white rounded-full px-8 py-2">
              <Image
                source={facebookLogo}
                className="w-6 h-10"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity className="border border-white rounded-full px-8 py-2">
              <Image
                source={googleLogo}
                className="w-7 h-10"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity className="border border-white rounded-full px-8 py-2">
              <Image
                source={appleLogo}
                className="w-7 h-10"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignUp")}
            className="mt-4"
          >
            <Text className="text-gray-400">
              Haven't joined BroFitness?{" "}
              <Text className="text-orange-500">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <StatusBar
        backgroundColor="#161622"
        style="light"
        barStyle="light-content"
      />
    </SafeAreaView>
  );
};

export default SignIn;
