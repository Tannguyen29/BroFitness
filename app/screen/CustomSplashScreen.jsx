import React from 'react';
import { View, ActivityIndicator, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const CustomSplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/splash.png')} 
      style={{width: width * 1, 
      height: "100%",
      resizeMode: 'contain',}} />
      <ActivityIndicator size={30} color="#FD6300" style={{bottom:200}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});

export default CustomSplashScreen;
