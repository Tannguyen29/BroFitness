import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { resetPassword } from '../../config/api';
import Icon from 'react-native-vector-icons/Ionicons'; 

const ResetPassword = ({ route, navigation }) => {
  const { email } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleResetPassword = async () => {
    const passwordRequirements = [
      { regex: /[!@#$%^&*(),.?":{}|<>]/, message: "Password must contain a special character" },
      { regex: /.{8,}/, message: "Password must be at least 8 characters long" },
      { regex: /\d/, message: "Password must contain at least one number" },
      { regex: /[A-Z]/, message: "Password must contain an uppercase character" },
    ];

    const failedRequirements = passwordRequirements.filter(req => !req.regex.test(newPassword));

    if (failedRequirements.length > 0) {
      setPasswordError(failedRequirements[0].message);
      return;
    }

    try {
      await resetPassword(email, newPassword, confirmPassword);
      navigation.navigate('FinishResetPassword');
    } catch (error) {
      setError(error.message);
    }
  };

  const togglePasswordVisible = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisible = () => {
    setConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const PasswordRequirements = ({ newPassword }) => {
    const requirements = [
      { label: 'Special character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
      { label: 'At least 8 characters', regex: /.{8,}/ },
      { label: 'At least a number', regex: /\d/ },
      { label: 'Uppercase character', regex: /[A-Z]/ },
    ];

    const getStrength = () => {
      return requirements.filter(req => req.regex.test(newPassword)).length / requirements.length;
    };

    return (
      <View className="w-full mt-2">
        <View className="h-1 bg-gray-300 rounded-full mb-3 mt-2 ml-2 mr-3">
          <View 
            className="h-1 bg-orange-500 rounded-full" 
            style={{ width: `${getStrength() * 100}%` }} 
          />
        </View>
        <View className="flex-row flex-wrap justify-between ml-3 mb-2">
          {requirements.map((req, index) => (
            <View key={index} className="flex-row items-center mb-2 w-[48%]">
              {req.regex.test(newPassword) ? (
                <View className="w-4 h-4 rounded-full mr-2 bg-green-500 items-center justify-center">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              ) : (
                <View className="w-4 h-4 rounded-full mr-2 border border-gray-300" />
              )}
              <Text className={`text-sm ${req.regex.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                {req.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>New password have to be different from the password you used before.</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="New password"
            placeholderTextColor="#888"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity onPress={togglePasswordVisible} style={styles.icon}>
            <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="white"/>
         </TouchableOpacity>
        </View>
        {passwordError && <Text className="text-red-500 mt-1 w-4/5">{passwordError}</Text>}
        <PasswordRequirements newPassword={newPassword} />
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
            <Icon name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={20} color="white" />
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
          <Text style={styles.resetButtonText}>Reset password</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6600',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
  },
  input: {
    flex: 1,
    padding: 15,
    color: '#FFFFFF',
  },
  icon: {
    padding: 10,
    margin: 15,
   
    width: 40,
  },
  resetButton: {
    backgroundColor: '#FF6600',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    top: 100,
    width: 350,
    alignSelf: 'center'
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 10,
  },
});

export default ResetPassword;
