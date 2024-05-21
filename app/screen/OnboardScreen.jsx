import React from 'react';
import { View, StyleSheet, Dimensions, Text, ImageBackground, Image } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from "expo-status-bar";
import Logo from "../../assets/image/logo4.png"

const { width } = Dimensions.get('window');

const OnboardScreen = () => {
  const navigation = useNavigation();

  const handleDone = () => {
    navigation.replace('SignUp');
  };

  const slides = [
    {
      key: '1',
      title: 'Welcome',
      text: 'Welcome to BroFitness - a smart personal gym application.',
      imageBackground: require('../../assets/image/slide5.jpg'),
    },
    {
      key: '2',
      title: 'AI Assistant',
      text: "Meet your new fitness buddy: our AI assistant! Ready to guide you through workouts, track your progress, and keep you motivated. Let's crush those goals together!",
      imageBackground: require('../../assets/image/slide4.jpg'),
    },
    {
      key: '3',
      title: 'BMI Counting',
      text: "BMI counting feature: your tool for tracking body mass index effortlessly. Let's keep an eye on your progress together as you work towards your fitness goals!",
      imageBackground: require('../../assets/image/slide1.jpg'),
    },
    {
      key: '4',
      title: 'Calories Tracking',
      text: "This is your key to understanding and managing your nutrition. Let's track your intake together, making informed choices for a healthier lifestyle!",
      imageBackground: require('../../assets/image/slide3.jpg'),
    },
  ];

  return (
    <View style={styles.container}>
      <AppIntroSlider
        renderItem={({ item }) => (
          <>
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
            <ImageBackground
              source={item.imageBackground}
              style={[styles.slide, { width: width }]}
            >
              <View style={styles.overlay}>
                <Text style={styles.title}>
                  {item.title.split(" ").map((word, index) => {
                    const isHighlightedWord =
                      word === "Welcome" ||
                      word === "AI" ||
                      word === "BMI" ||
                      word === "Calories";
                    return (
                      <Text
                        key={index}
                        style={
                          isHighlightedWord ? styles.highlightedWord : null
                        }
                      >
                        {word}{" "}
                      </Text>
                    );
                  })}
                </Text>
                <Text style={styles.text}>{item.text}</Text>
              </View>
            </ImageBackground>
          </>
        )}
        data={slides}
        onDone={handleDone}
        renderNextButton={() => (
          <View style={styles.nextBtnContainer}>
            <Text style={styles.nextBtnText}>Next</Text>
          </View>
        )}
        renderDoneButton={() => (
          <>
          <View style={styles.doneBtnContainer}>
            <Text style={styles.nextBtnText}>Sign Up Now</Text>
          </View>
            <Text style={styles.alreadyHaveAccount}>
              Already have an account? <Text className="text-orange-500" onPress={() => navigation.replace("SignIn")}>Login</Text>
            </Text>
          </>
        )}
        dotStyle={{
          backgroundColor: "#fff",
          width: 8,
          height: 4,
          marginHorizontal: 3,
        }}
        activeDotStyle={{
          backgroundColor: "#FF5F2C",
          width: 8,
          height: 4,
          marginHorizontal: 3,
        }}
      />
      <StatusBar
        backgroundColor="#161622"
        style="light"
        barStyle="light-content"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 35,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 300,
  },
  highlightedWord: {
    color: '#FF5F2C',
  },
  text: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    padding: 5,
    paddingLeft: 50,
    paddingRight: 50
  },
  nextBtnContainer: {
    backgroundColor: '#FF5F2C',
    position: 'fixed',
    bottom: 20,
    width: 300,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    right: 35,
    bottom: 60,
    borderRadius: 20,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneBtnContainer:{
    backgroundColor: '#FF5F2C',
    position: 'fixed',
    bottom: 40,
    width: 300,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    right: 35,
    bottom: 100,
    borderRadius: 25,
  },
  alreadyHaveAccount: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    right: 35,
    bottom: 80,
  },
  logo: {
    width: 100,
    height: 65,
    position: 'absolute',
    zIndex: 1,
    top: 70,
    left: 165,
  },
});

export default OnboardScreen;