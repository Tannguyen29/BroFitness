import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import AppNavigation from './app/src/AppNavigation';
import CustomSplashScreen from './app/screen/CustomSplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfo } from './config/api'; 

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        const { token, personalInfoCompleted } = await getUserInfo();
        if (token) {
          if (personalInfoCompleted) {
            setInitialRoute('BottomTabs');
          } else {
            setInitialRoute('PersonalInformationSetup');
          }
        } else {
          const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
          setInitialRoute(onboardingCompleted === 'true' ? 'SignIn' : 'OnboardScreen');
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        setInitialRoute('OnboardScreen');
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      }
    };
  
    initialize();
  }, []);

  if (isLoading || !fontsLoaded) {
    return <CustomSplashScreen />;
  }

  return (
    <View style={styles.container}>
      <AppNavigation initialRoute={initialRoute} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});