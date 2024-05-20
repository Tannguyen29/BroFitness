import {Text, TextInput, View, ScrollView, Image, TouchableOpacity} from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "../../assets/image/logo.png";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../config/FirebaseConfig';

const SignUp = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    try {
      const register = await createUserWithEmailAndPassword(auth, email, password);
      console.log(register);
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
            className="w-[180px] h-[200px]"
            resizeMode="contain"
          />
          <Text className="text-white text-2xl font-bold mt-8">
            Create an account
          </Text>
          <FormField
            title="Name"
            value={name}
            onChangeText={(value) => setName(value)}
            autoCapitalize="words"
          />
          <FormField
            title="Email"
            value={email}
            onChangeText={(value) => setEmail(value)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={password}
            onChangeText={(value) => setPassword(value)}
            secureTextEntry={true}
          />
          <CustomButton
            title="Sign Up"
            containerStyle="mt-5 w-4/5 bg-orange-500 items-center justify-center rounded-3xl"
            handlePress={handleSignUp}
          />
          {error && <Text className="text-red-500 mt-4">{error}</Text>}
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