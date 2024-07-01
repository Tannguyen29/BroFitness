import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { resetPassword } from '../../config/api';

const ResetPassword = ({ route, navigation }) => {
  const { email } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleResetPassword = async () => {
    try {
      await resetPassword(email, newPassword, confirmPassword);
      Alert.alert('Success', 'Password reset successfully. Please sign in again');
      navigation.navigate('SignIn');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View>
      <Text>Reset Password</Text>
      <TextInput
        placeholder="Enter new password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={true}
      />
      <TextInput
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />
      {error && <Text>{error}</Text>}
      <TouchableOpacity onPress={handleResetPassword}>
        <Text>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPassword;