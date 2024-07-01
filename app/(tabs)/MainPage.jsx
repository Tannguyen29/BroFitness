import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView, StyleSheet, FlatList, TouchableOpacity, Dimensions, ImageBackground, Image } from "react-native";
import { Avatar } from "@rneui/themed";
import { Notification } from "iconsax-react-native";
import { auth } from "../../config/FirebaseConfig";
import AIW from "../../assets/image/slide4.jpg"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowUpRightFromSquare, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { getUserInfo } from '../../config/api'

const { width: screenWidth } = Dimensions.get('window');
const itemWidth = screenWidth * 0.95;
const itemHeight = 250; 

const MainPage = () => {
  const [userName, setUserName] = useState('');
  const [weekDays, setWeekDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(new Date().getDate());

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
    updateWeekDays();
    const timer = setInterval(() => {
      updateWeekDays();
      setCurrentDay(new Date().getDate());
    }, 24 * 60 * 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const plans = [
    {
      id: '1',
      title: 'SIX PACK CHALLENGE',
      subtitle: '30 Days Plan • 3 Plans',
      description: 'Killer challenge for six pack building! Get rock-hard abs and rip it into a six pack by igniting every corner of your core.',
      image: require('../../assets/image/slide1.jpg'),
      isPro: true,
      accentColor: '#e17046',
    },
    {
      id: '2',
      title: 'LOSE WEIGHT FOR WOMEN',
      subtitle: '45 Days Plan • 4 Plans',
      description: 'Tailored weight loss program for women. Burn fat, boost metabolism, and sculpt your body with effective workouts and nutrition guidance.',
      image: require('../../assets/image/slide2.jpg'),
      isPro: false,
      accentColor: '#4287f5',
    },
    {
      id: '3',
      title: 'UPPER BODY BLAST',
      subtitle: '21 Days Plan • 3 Plans',
      description: 'Strengthen and tone your upper body with this intensive program. Build lean muscle in your arms, chest, back, and shoulders.',
      image: require('../../assets/image/slide3.jpg'),
      isPro: true,
      accentColor: '#42f5a1',
    },
    {
      id: '4',
      title: 'LOWER BODY SHAPER',
      subtitle: '28 Days Plan • 3 Plans',
      description: 'Focus on your legs, glutes, and core with this targeted lower body program. Sculpt and strengthen from the waist down.',
      image: require('../../assets/image/slide4.jpg'),
      isPro: false,
      accentColor: '#f542a1',
    },
  ];

  const renderPlanItem = ({ item }) => (
    <View style={styles.planItemContainer}>
      <ImageBackground source={item.image} style={styles.planBackground} imageStyle={styles.planBackgroundImage}>
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
            <Text style={[styles.startButtonText, { color: item.accentColor }]}>START</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );

  const updateWeekDays = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekDays = [];
    const dayOfWeek = today.getDay();
  
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOfWeek + i + (dayOfWeek === 0 ? -6 : 1));
      weekDays.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        date: date.getDate(),
      });
    }
  
    setWeekDays(weekDays);
  };
  

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
        <View style={styles.weekContainer}>
          {weekDays.map((item, index) => (
            <View key={index} style={styles.dayBox}>
              <Text style={styles.dayText}>{item.day}</Text>
              <Text
                style={[
                  styles.dateText,
                  item.date === currentDay ? styles.currentDateText : null,
                ]}
              >
                {item.date}
              </Text>
            </View>
          ))}
        </View>
        <View>
          <View style={styles.todayText}>
            <Text style={styles.AIWorkout}>Today Activity</Text>
          </View>
        </View>
        <View style={styles.myPlanContainer}>
          <Text style={styles.AIWorkout}>My Plan</Text>
          <FlatList
            data={plans}
            renderItem={renderPlanItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToAlignment="center"
            decelerationRate="fast"
          />
          <TouchableOpacity style={styles.Explore}>
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              style={styles.ExploreIcon}
            />
            <Text style={styles.ExploreText}>Explore All Plans</Text>
          </TouchableOpacity>
        </View>
        <View>
          <View>
            <Text style={styles.AIWorkout}>AI Workout</Text>
          </View>
          <View>
            <ImageBackground
              source={AIW}
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
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 5,
  },
  dayBox: {
    width: 40,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    color: 'white',
    fontSize: 16,
  },
  currentDateText: {
    color: '#e17046',
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
  Explore:{
    backgroundColor: 'black',
    borderRadius: 15,
    padding: 18,
    marginTop: 15,
    marginBottom: 10
  },
  ExploreText:{
    fontSize: 13,
    fontWeight: '500',
    color: "#f0784b",
    textAlign: "center",
  },
  ExploreIcon: {
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
