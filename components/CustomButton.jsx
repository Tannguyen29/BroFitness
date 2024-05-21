import { TouchableOpacity, Text } from 'react-native';
import React from 'react';

const CustomButton = ({ title, handlePress,containerStyle, textStyles, isLoading }) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`rounded-full px-6 py-3 ${containerStyle} ${
        isLoading ? 'opacity-50' : ''
      }`}
    >
      <Text className={`text-white text-lg font-bold ${textStyles}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;