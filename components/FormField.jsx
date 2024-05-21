import { View, Text, TextInput,TouchableOpacity } from 'react-native';
import React from 'react';

const FormField = ({ title, value, onChangeText, ...props }) => {
  return (
    <>
    <View className="space-y-2 w-5/6 ">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#ffffff"
        className="bg-neutral-700 text-white rounded-3xl px-4 py-3 mt-5"
        {...props}
      />
    </View>
    </>
  );
};

export default FormField;