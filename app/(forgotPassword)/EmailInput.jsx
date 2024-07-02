import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { sendResetPasswordEmail } from '../../config/api';

const EmailInput = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

  const handleSendEmail = async () => {
    if (!email) {
      setError('Please enter an email or phone number.');
      return;
    }

    try {
      await sendResetPasswordEmail(email);
      navigation.navigate('OtpForgotPassword', { email });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <Text style={styles.title}>Confirm your code</Text>
      <Text style={styles.subtitle}>Don't worry! Put in your information so we can send you a password reset.</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity style={styles.confirmButton} onPress={handleSendEmail}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.loginText}>Remember your password? <Text style={styles.loginLink}>Sign in</Text></Text>
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
    color: '#FFFFFF',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    padding: 15,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#FF6600',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    top: 200,
    width: 350,
    alignSelf: 'center'
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 10,
    top: 200
  },
  loginText: {
    color: '#FFFFFF',
    textAlign: 'center',
    top: 200
  },
  loginLink: {
    color: '#FF6600',
  },
});

export default EmailInput;