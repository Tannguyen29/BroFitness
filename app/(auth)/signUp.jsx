import { Text, View, ScrollView, Image, TouchableOpacity, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from 'axios';
import logo from "../../assets/image/gymLogo.png";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";

const appleLogo = require('../../assets/image/apple.png');
const facebookLogo = require('../../assets/image/facebook.png');
const googleLogo = require('../../assets/image/google.png');

const SignUp = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [agree, setAgree] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSignUp = async () => {
    if (!agree) {
      setError('You must agree to the terms and conditions');
      return;
    }
    try {
      await axios.post('http://192.168.1.36:5000/signup', { name, email, password });
      alert("User registered successfully! Please sign in.");
      navigation.navigate("SignIn");
    } catch (error) {
      setError(error.response ? error.response.data : 'Error signing up');
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 , right:45, marginTop:25}}>
            <TouchableOpacity onPress={() => setAgree(!agree)} style={{
              height: 24, width: 24, borderRadius: 12, borderWidth: 2, borderColor: 'white', alignItems: 'center', justifyContent: 'center', marginRight: 10
            }}>
              {agree && <View style={{ height: 12, width: 12, borderRadius: 6, backgroundColor: '#FD6300'}} />}
            </TouchableOpacity>
            <Text style={{ color: 'white' }}>
              I agree to the 
              <Text onPress={() => setModalVisible(true)} style={{ color: '#FD6300' }}> terms & conditions</Text>
            </Text>
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
            <TouchableOpacity className="border border-white rounded-full px-8 py-2">
              <Image source={facebookLogo} className="w-6 h-10" resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity className="border border-white rounded-full px-8 py-2">
              <Image source={googleLogo} className="w-7 h-10" resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity className="border border-white rounded-full px-8 py-2">
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

      {/* Modal for terms and conditions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <View style={{ margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
            <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Terms and Conditions</Text>
            <ScrollView>
              <Text style={{ color: 'black' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. 
                Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. 
                Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. 
                Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. 
                Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. 
                Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. 
                Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. 
                Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. 
                Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. 
                Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. 
                Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. 
                Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, 
                at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia 
                Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. 
                Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec.
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 10, padding: 10, backgroundColor: '#FD6300', borderRadius: 10, alignItems: 'center' }}
            >
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignUp;
