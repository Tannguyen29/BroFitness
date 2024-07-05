import { Text, View, ScrollView, Image, TouchableOpacity, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from 'axios';
import logo from "../../assets/image/gymLogo.png";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";

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
      await axios.post('http://192.168.1.55:5000/signup', { name, email, password });
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
          {passwordError && <Text className="text-red-500 mt-1 w-4/5">{passwordError}</Text>}
          <PasswordRequirements password={password} />
          <FormField
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={(value) => setConfirmPassword(value)}
            secureTextEntry={true}
          />
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.75)",
          }}
        >
          <View
            style={{
              margin: 20,
              padding: 20,
              backgroundColor: "white",
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "black",
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Terms and Conditions
            </Text>
            <ScrollView>
              <Text style={{ color: "black" }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed
                nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis
                ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.
                Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent
                taciti sociosqu ad litora torquent per conubia nostra, per
                inceptos himenaeos. Curabitur sodales ligula in libero. Sed
                dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh.
                Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed
                convallis tristique sem. Proin ut ligula vel nunc egestas
                porttitor. Morbi lectus risus, iaculis vel, suscipit quis,
                luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet.
                Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed,
                euismod in, nibh. Quisque volutpat condimentum velit. Class
                aptent taciti sociosqu ad litora torquent per conubia nostra,
                per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non
                tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum
                ante quis turpis. Nulla facilisi. Ut fringilla. Suspendisse
                potenti. Nunc feugiat mi a tellus consequat imperdiet.
                Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in
                justo eu magna luctus suscipit. Sed lectus. Integer euismod
                lacus luctus magna. Quisque cursus, metus vitae pharetra auctor,
                sem massa mattis sem, at interdum magna augue eget diam.
                Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                posuere cubilia Curae; Morbi lacinia molestie dui. Praesent
                blandit dolor. Sed non quam. In vel mi sit amet augue congue
                elementum. Morbi in ipsum sit amet pede facilisis laoreet. Donec
                lacus nunc, viverra nec.
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 10,
                padding: 10,
                backgroundColor: "#FD6300",
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignUp;