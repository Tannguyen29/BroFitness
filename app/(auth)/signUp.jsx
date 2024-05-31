import { Text, TextInput, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "../../assets/image/gymLogo.png";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from '../../config/FirebaseConfig';

const appleLogo = require('../../assets/image/apple.png');
const facebookLogo = require('../../assets/image/facebook.png');
const googleLogo = require('../../assets/image/google.png');

const SignUp = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      alert("Verification email sent! Please check your inbox.");
      navigation.navigate("SignIn");
    } catch (error) {
      setError(error.message);
    }
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
          <Text className="text-orange-500 text-2xl font-bold ">
            Create an account
          </Text>
          <FormField
            placeholder="Name"
            value={name}
            onChangeText={(value) => setName(value)}
            autoCapitalize="words"
          />
          <FormField
            placeholder="Email"
            value={email}
            onChangeText={(value) => setEmail(value)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <FormField
            placeholder="Password"
            value={password}
            onChangeText={(value) => setPassword(value)}
            secureTextEntry={true}
          />
          <View>
            <Text className="text-white right-16 mt-5">Agree to term ad conditions</Text>
          </View>
          <CustomButton
            title="Sign Up"
            containerStyle="mt-5 w-4/5 bg-orange-500 items-center justify-center rounded-3xl"
            handlePress={handleSignUp}
          />
          {error && <Text className="text-red-500 mt-4">{error}</Text>}
          <View className="flex-row items-center mt-8 w-4/5">
            <View className="flex-1 h-px bg-gray-600" />
            <Text className="text-gray-400 mx-2">Or sign up with</Text>
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
            onPress={() => navigation.navigate("SignIn")}
            className="mt-4"
          >
            <Text className="text-gray-400">
              Already have an account?{" "}
              <Text className="text-orange-500">Sign in</Text>
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

export default SignUp;
