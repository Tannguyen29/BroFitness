import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { resetPassword } from '../../config/api';

const ResetPassword = ({ route, navigation }) => {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleResetPassword = async () => {
    try {
      await resetPassword(email, password);
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
        value={password}
        onChangeText={setPassword}
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
