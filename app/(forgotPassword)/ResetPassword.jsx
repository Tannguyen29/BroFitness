import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { resetPassword } from '../../config/api';

const ResetPassword = ({ route, navigation }) => {
  const { email } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleResetPassword = async () => {
    try {
      await resetPassword(email, newPassword, confirmPassword);
      navigation.navigate('SignIn');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
   <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>New password have to be different from the password you used before.</Text>
      <TextInput
        style={styles.input}
        placeholder="New password"
        placeholderTextColor="#888"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={true}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        placeholderTextColor="#888"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />
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
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    padding: 15,
    color: '#FFFFFF',
    marginBottom: 15,
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