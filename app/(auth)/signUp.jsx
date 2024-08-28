import { Text,TextInput, View, ScrollView, Image, TouchableOpacity, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from 'axios';
import logo from "../../assets/image/gymLogo.png";

import CustomButton from "../../components/CustomButton";
import Icon from 'react-native-vector-icons/Ionicons'; // Import Icon

const SignUp = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [agree, setAgree] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false); // State for password visibility
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // State for confirm password visibility

  const handleSignUp = async () => {
    setPasswordError("");
    setConfirmPasswordError("");
    setError("");

    const passwordRequirements = [
      { regex: /[!@#$%^&*(),.?":{}|<>]/, message: "Password must contain a special character" },
      { regex: /.{8,}/, message: "Password must be at least 8 characters long" },
      { regex: /\d/, message: "Password must contain at least one number" },
      { regex: /[A-Z]/, message: "Password must contain an uppercase character" },
    ];

    const failedRequirements = passwordRequirements.filter(req => !req.regex.test(password));

    if (failedRequirements.length > 0) {
      setPasswordError(failedRequirements[0].message);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    if (!agree) {
      setError('You must agree to the terms and conditions');
      return;
    }

    try {

      await axios.post('http://192.168.1.66:5000/signup', { name, email, password });

      navigation.navigate("OtpInput", { email });
    } catch (error) {
      setError(error.response ? error.response.data : 'Error signing up');
    }
  };

  const PasswordRequirements = ({ password }) => {
    const requirements = [
      { label: 'Special character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
      { label: 'At least 8 characters', regex: /.{8,}/ },
      { label: 'At least a number', regex: /\d/ },
      { label: 'Uppercase character', regex: /[A-Z]/ },
    ];

    const getStrength = () => {
      return requirements.filter(req => req.regex.test(password)).length / requirements.length;
    };

    return (
      <View className="w-4/5 mt-2">
        <View className="h-1 bg-gray-300 rounded-full mb-3 mt-2">
          <View 
            className="h-1 bg-orange-500 rounded-full" 
            style={{ width: `${getStrength() * 100}%` }} 
          />
        </View>
        <View className="flex-row flex-wrap justify-between ">
          {requirements.map((req, index) => (
            <View key={index} className="flex-row items-center mb-2 w-[48%]">
              {req.regex.test(password) ? (
                <View className="w-4 h-4 rounded-full mr-2 bg-green-500 items-center justify-center">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              ) : (
                <View className="w-4 h-4 rounded-full mr-2 border border-gray-300" />
              )}
              <Text className={`text-sm ${req.regex.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
                {req.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const togglePasswordVisible = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisible = () => {
    setConfirmPasswordVisible(!isConfirmPasswordVisible);
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
          <Text className="text-orange-500 text-2xl font-bold mb-4">
            Create an account
          </Text>
          
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoCapitalize="words"
            textColor='white'
            outlineColor='white'
            style={{ width: '85%', marginBottom: 20, backgroundColor: 'black'}}
            outlineStyle={{
              borderRadius: 15,
            }}
            theme={{
              colors: {
                primary: '#FD6300',
                onSurfaceVariant: 'white',
              },
            }}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            textColor='white'
            outlineColor='white'
            style={{ width: '85%', marginBottom: 20, backgroundColor: 'black'}}
            outlineStyle={{
              borderRadius: 15,
            }}
            theme={{
              colors: {
                primary: '#FD6300',
                onSurfaceVariant: 'white',
              },
            }}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity onPress={togglePasswordVisible} style={styles.icon}>
              <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="white"/>
            </TouchableOpacity>
          </View>
          {passwordError && <Text className="text-red-500 mt-1 w-4/5">{passwordError}</Text>}
          <PasswordRequirements password={password} />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
            />
            <TouchableOpacity onPress={toggleConfirmPasswordVisible} style={styles.icon}>
              <Icon name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={20} color="white"/>
            </TouchableOpacity>
          </View>

          {confirmPasswordError && <Text className="text-red-500 mt-1 w-4/5">{confirmPasswordError}</Text>}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 10,
              right: 45,
              marginTop: 25,
            }}
          >
            <TouchableOpacity
              onPress={() => setAgree(!agree)}
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
              {agree && (
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
            <Text style={{ color: "white" }}>
              I agree to the
              <Text
                onPress={() => setModalVisible(true)}
                style={{ color: "#FD6300" }}
              >
                {" "}
                terms & conditions
              </Text>
            </Text>
          </View>
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

      {/* Modal for terms and conditions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              width: '90%',
              maxHeight: '80%'
            }}
          >
            <ScrollView>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Terms and Conditions</Text>
              <Text style={{ marginBottom: 10 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sit amet ligula id mi cursus gravida. Nulla facilisi. Etiam ut lectus non arcu interdum cursus nec a turpis. Integer condimentum dolor vel nisl sodales convallis. Ut et erat sit amet nulla accumsan hendrerit. Nullam euismod augue ut massa condimentum tincidunt.</Text>
              <Text style={{ marginBottom: 10 }}>Praesent vehicula metus nec nulla auctor, nec interdum nunc fermentum. Phasellus sed nisi non eros laoreet tempus. In congue vel ligula ut tempor. Duis ut nisi non augue vehicula volutpat sit amet ac enim. Suspendisse euismod efficitur velit, et egestas felis ultricies ut.</Text>
              <Text style={{ marginBottom: 10 }}>Vestibulum quis risus non nunc commodo tincidunt. Proin ullamcorper, metus non ultricies feugiat, libero mi vestibulum est, sed facilisis sem lorem at urna. Curabitur ac tincidunt leo. Donec hendrerit tempor nulla, sed consectetur sem cursus id. Ut nec efficitur libero, ut pharetra dui.</Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setModalVisible(!modalVisible)}
              style={{ marginTop: 10, alignSelf: 'center', padding: 10, backgroundColor: '#FD6300', borderRadius: 5 }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = {
  inputContainer: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 15,
    paddingHorizontal: 10,
    marginTop: 15,
    backgroundColor:'#2C2C2E',
  },
  input: {
    flex: 1,
    color: 'white',
    paddingVertical: 10,
  },
  icon: {
    paddingHorizontal: 10,
  },
};

export default SignUp;
