import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { sendResetPasswordEmail } from '../../config/api';

const EmailInput = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

  const handleSendEmail = async () => {
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await sendResetPasswordEmail(email);
      navigation.navigate('OtpInput', { email });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View>
      <Text>Forgot Password</Text>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {error && <Text>{error}</Text>}
      <TouchableOpacity onPress={handleSendEmail}>
        <Text>Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmailInput;
