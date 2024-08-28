import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Image,
  StatusBar
} from "react-native";
import { Avatar } from "@rneui/themed";
import { Notification } from "iconsax-react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowUpRightFromSquare, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { getUserInfo } from '../../config/api';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');
const itemWidth = screenWidth * 0.95;
const itemHeight = 250;
const bannerHeight = 150;

const API_BASE_URL = "http://192.168.1.66:5000";

const MainPage = () => {
  const [userName, setUserName] = useState('');
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [plans, setPlans] = useState([]);
  const navigation = useNavigation();
  const handleExploreAllPlans = () => {
    navigation.navigate('AllPlans'); 
  };

  const fetchBanners = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/banners`);
      setBanners(response.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    const loadUserInfo = async () => {
      setIsLoading(true);
      const { name } = await getUserInfo();
      if (name) {
        setUserName(name);
      } else {
        setUserName('User');
      }
      setIsLoading(false);
    };

    loadUserInfo();
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/plans`);
      setPlans(response.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans])
  );

  useEffect(() => {
    const autoplay = setInterval(() => {
      if (currentIndex < banners.length - 1) {
        flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
      } else {
        flatListRef.current.scrollToIndex({ index: 0, animated: true });
      }
    }, 3000);

    return () => clearInterval(autoplay);
  }, [currentIndex]);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  };

  const renderBannerItem = ({ item }) => (
    <View style={styles.bannerItemContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} />
    </View>
  );

  const renderDotIndicator = () => {
    return (
      <View style={styles.dotContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? '#f0784b' : 'gray' }
            ]}
          />
        ))}
      </View>
    );
  };

  const renderPlanItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.planItemContainer}
      onPress={() => navigation.navigate('PlanOverview', { planId: item._id })}
    >
      <ImageBackground source={{ uri: item.backgroundImage }} style={styles.planBackground} imageStyle={styles.planBackgroundImage}>
        <View style={styles.planContent}>
          <Text style={styles.planSubtitle}>{item.subtitle}</Text>
          <View style={styles.titleContainer}>
            {item.title.split(' ').map((word, index) => (
              <Text key={index} style={styles.planTitle}>{word}</Text>
            ))}
          </View>
          {item.isPro && (
            <View style={styles.proBadge}>
              <Text style={[styles.proText, { color: item.accentColor }]}>PRO</Text>
            </View>
          )}
          <Text style={styles.planDescription} numberOfLines={3}>
            {item.description}
          </Text>
          <TouchableOpacity style={styles.startButton}>
            <Text style={[styles.startButtonText, { color: item.accentColor }]} onPress={() => navigation.navigate('PlanOverview', { planId: item._id })}>START</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.avatarText}>
            <Avatar
              size={42}
              rounded
              source={{ uri: "https://randomuser.me/api/portraits/men/36.jpg" }}
              containerStyle={styles.avatarContainer}
            />
            <View>
              <Text style={styles.aText}>Welcome back</Text>
              <Text style={[styles.aText, { fontSize: 22, fontWeight: "600" }]}>
                {isLoading ? "Loading..." : userName}
              </Text>
            </View>
          </View>
          <View style={styles.iconContainer}>
            <Notification size="32" color="white" />
          </View>
        </View>
        <View style={styles.bannerContainer}>
          <FlatList
            ref={flatListRef}
            data={banners}
            renderItem={renderBannerItem}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToAlignment="center"
            decelerationRate="fast"
            onScroll={handleScroll}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          />
          {renderDotIndicator()}
        </View>
        <View style={styles.myPlanContainer}>
          <Text style={styles.AIWorkout}>My Plan</Text>
          <FlatList
            data={plans}
            renderItem={renderPlanItem}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToAlignment="center"
            decelerationRate="fast"
          />
          <TouchableOpacity style={styles.exploreButton} onPress={handleExploreAllPlans}>
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              style={styles.exploreIcon}
            />
            <Text style={styles.exploreText}>Explore All Plans</Text>
          </TouchableOpacity>
        </View>
        <View>
          <View>
            <Text style={styles.AIWorkout}>AI Workout</Text>
          </View>
          <View>
            <ImageBackground
              source={require('../../assets/image/slide4.jpg')}
              style={{ height: 150 }}
              imageStyle={{ borderRadius: 20 }}
              resizeMode="cover"
            >
              <TouchableOpacity style={styles.AIButton}>
                <Text style={[styles.startButtonAI, { color: "blue" }]}>
                  START
                </Text>
              </TouchableOpacity>
            </ImageBackground>
          </View>
        </View>
        <View>
          <View>
            <Text style={styles.AIWorkout}>Classic Workout</Text>
          </View>
          <View style={styles.classicWorkoutContainer}>
            <Text style={styles.workoutCount}>5 Workouts</Text>
            <Text style={styles.workoutLevel}>Beginner</Text>
            {[
              {
                name: "Abs · Beginner",
                duration: "18 mins",
                image: require("../../assets/image/slide4.jpg"),
              },
              {
                name: "Chest · Beginner",
                duration: "7 mins",
                image: require("../../assets/image/slide3.jpg"),
              },
              {
                name: "Arm · Beginner",
                duration: "16 mins",
                image: require("../../assets/image/slide2.jpg"),
              },
              {
                name: "Leg · Beginner",
                duration: "22 mins",
                image: require("../../assets/image/slide1.jpg"),
              },
              {
                name: "Shoulder & Back · Beginner",
                duration: "15 mins",
                image: require("../../assets/image/slide4.jpg"),
              },
            ].map((workout, index) => (
              <TouchableOpacity key={index} style={styles.workoutItem}>
                <Image source={workout.image} style={styles.workoutImage} />
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDuration}>{workout.duration}</Text>
                </View>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  style={styles.workoutArrow}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <StatusBar barStyle="light-content" backgroundColor="#1c1c1e" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1e",
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 70,
    paddingTop: 10
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    backgroundColor: "#1c1c1e",
    borderRadius: 10,
  },
  avatarContainer: {
    marginLeft: 1,
  },
  avatarText: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  todayText: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  aText: {
    color: "white",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 80,
    left: 45
  },
  bannerContainer: {
    marginTop: 20,
  },
  bannerItemContainer: {
    width: itemWidth * 0.95,
    height: bannerHeight * 1.25,
    marginRight: 10,
    left: 5
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  planItemContainer: {
    width: itemWidth,
    height: itemHeight * 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  planBackground: {
    width: itemWidth * 0.95,
    height: '100%',
    justifyContent: 'flex-end',
    borderRadius: 20,
    overflow: 'hidden',
  },
  planBackgroundImage: {
    borderRadius: 20,
  },
  planContent: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: '100%',
    justifyContent: 'space-between',
  },
  planSubtitle: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  planTitle: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
    lineHeight: 27,
  },
  proBadge: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  proText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  planDescription: {
    color: 'white',
    fontSize: 15,
    marginTop: 10,
    lineHeight: 20,
    textAlign: 'justify',
  },
  startButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  AIWorkout:{
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    marginBottom:10,
  },
  startButtonAI:{
    fontSize: 12,
    fontWeight: 'bold',
  },
  AIButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    width: 80,
    top: 90,
    left: 30,
    height: 34
  },
  exploreButton:{
    backgroundColor: 'black',
    borderRadius: 15,
    padding: 18,
    marginTop: 15,
    marginBottom: 10
  },
  exploreText:{
    fontSize: 13,
    fontWeight: '500',
    color: "#f0784b",
    textAlign: "center",
  },
  exploreIcon: {
    color: '#f0784b', 
    marginRight: 10, 
    position: 'absolute',
    left: 115,
    top: 19
  },
  classicWorkoutContainer: {
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  workoutCount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  workoutLevel: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  workoutImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  workoutDuration: {
    color: 'gray',
    fontSize: 14,
  },
  workoutArrow: {
    color: 'gray',
  },
  });

  export default MainPage;
