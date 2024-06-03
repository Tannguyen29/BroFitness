import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { Avatar } from "@rneui/themed";
import { Notification, Calendar } from "iconsax-react-native";
import { auth } from "../../config/FirebaseConfig";

const MainPage = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName || 'User');
      } else {
        setUserName('User');
      }
    });

    return unsubscribe;
  }, []);

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
              <Text style={[styles.aText, { fontSize: 22 , fontWeight:600 }]}>{userName}</Text>
            </View>
          </View>
          <View style={styles.iconContainer}>
            <Notification size="32" color="white" />
            <Calendar size="32" color="white" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#242526",
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    backgroundColor: "#242526",
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
  aText: {
    color: "white",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 80,
  },
});

export default MainPage;
