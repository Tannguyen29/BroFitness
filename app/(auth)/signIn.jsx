import {Text, TextInput, View, ScrollView, Image,TouchableOpacity,} from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "../../assets/image/logo.png";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../config/FirebaseConfig";

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

  return (
    <SafeAreaView className="bg-black flex-1">
      <ScrollView contentContainerStyle="flex-grow">
        <View className="w-full justify-center items-center">
          <Image
            source={logo}
            className="w-[180px] h-[200px]"
            resizeMode="contain"
          />
          <Text className="text-white text-2xl font-bold">
            Login into <Text className="text-orange-500">Bro Fitness</Text>
          </Text>
          <FormField
            title="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
          <View>
            <Text className="text-white mr-52">Remember Me</Text>
          </View>
          <CustomButton
            title="Login"
            containerStyle="mt-5 w-4/5 bg-orange-500 items-center justify-center rounded-3xl"
            handlePress={handleSignIn}
          />
          {error && <Text className="text-red-500 mt-4">{error}</Text>}
          <TouchableOpacity
            onPress={() => navigation.navigate("signUp")}
            className="mt-4"
          >
            <Text className="text-gray-400">
              Don't have an account?{" "}
              <Text className="text-orange-500">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
