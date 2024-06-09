import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { verifyOtp } from '../../config/api';

const OtpInput = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp(email, otp);
      navigation.navigate('ResetPassword', { email });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View>
      <Text>Enter OTP</Text>
      <TextInput
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
      />
      {error && <Text>{error}</Text>}
      <TouchableOpacity onPress={handleVerifyOtp}>
        <Text>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OtpInput;
