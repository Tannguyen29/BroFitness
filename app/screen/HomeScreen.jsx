import { ScrollView, Text, View, ImageBackground,Image, Button, Dimensions } from 'react-native';
import { StatusBar } from "expo-status-bar";
import logo from '../../assets/image/logo.png'
import gym from '../../assets/image/gym.jpg'
import CustomButton from '../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';

const HomeScreen  = () => {
    const navigation = useNavigation();
  return (
    <View className="bg-black flex-1">
      <ImageBackground source={gym} resizeMode="cover" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle="flex-grow">
          <View className="w-full justify-center items-center">
            <Image
              source={logo}
              className="w-[180px] h-[200px]"
              resizeMode="contain"
            />
          </View>
          <View className="w-full justify-center items-left pb-1 mt-72 ml-5">
            <Text className="text-white text-3xl font-bold">
              Welcome to <Text className="text-orange-500">Bro Fitness</Text>
            </Text>
            <Text className="text-white mt-3 mr-20">
              This app provides customized workouts, exercise tracking, and
              nutrition plans to build strength and boost overall fitness. Stay
              motivated as you sculpt your body and unleash your potential.
            </Text>
            <View className="flex flex-row gap-2">
              <CustomButton
                title="Sign In"
                handlePress={() => navigation.navigate("SignIn")}
                containerStyle="mt-10 w-48 bg-orange-500 mr-3 items-center justify-center"
              />
              <CustomButton
                title="Sign Up"
                handlePress={() => navigation.navigate("SignUp")}
                containerStyle="mt-10 w-48 border-2 border-white items-center justify-center"
              />
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
      <StatusBar
        backgroundColor="#161622"
        style="light"
        barStyle="light-content"
      />
    </View>
  );
}

export default HomeScreen 