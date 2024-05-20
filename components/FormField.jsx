import { View, Text, TextInput,TouchableOpacity } from 'react-native';
import React from 'react';

const FormField = ({ title, value, onChangeText, ...props }) => {
  return (
    <>
    <View className="space-y-2 w-4/5">
      <Text className="text-base text-white mt-4">{title}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="bg-neutral-700 text-white rounded-lg px-4 py-3"
        {...props}
      />
    </View>
    </>
  );
};

export default FormField;