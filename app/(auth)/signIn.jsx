import {Text, TextInput, View, ScrollView, Image,TouchableOpacity,} from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "../../assets/image/gymLogo.png";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../config/FirebaseConfig";

const appleLogo = require('../../assets/image/apple.png');
const facebookLogo = require('../../assets/image/facebook.png');
const googleLogo = require('../../assets/image/google.png');

const SignIn = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    try {
      const login = await signInWithEmailAndPassword(auth, email, password);
      console.log(login);
      navigation.navigate("MainPage");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleForgotPassword = async () => {
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
          <FormField
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <FormField
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
           <TouchableOpacity onPress={handleForgotPassword}>
              <Text className="text-orange-500 mt-5 left-1/4">Forgot Password?</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-white mr-52 mt-2">Remember Me</Text>
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
            <TouchableOpacity className="border-2 border-white rounded-full px-8 py-2">
              <Image source={facebookLogo} className="w-6 h-10" resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity className="border-2 border-white rounded-full px-8 py-2">
              <Image source={googleLogo} className="w-7 h-10" resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity className="border-2 border-white rounded-full px-8 py-2">
              <Image source={appleLogo} className="w-7 h-10" resizeMode="contain" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignUp")}
            className="mt-4"
          >
            <Text className="text-gray-400">
            Haven't join BroFitness?{" "}
              <Text className="text-orange-500">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
