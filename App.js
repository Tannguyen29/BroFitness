import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import AppNavigation from './app/src/AppNavigation';
import CustomSplashScreen from './app/screen/CustomSplashScreen';

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsSplashVisible(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  if (isSplashVisible) {
    return <CustomSplashScreen />;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
