import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from "@rneui/themed";
import { clearUserInfo } from '../../config/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserInfo } from '../../config/api'
import Icon from 'react-native-vector-icons/FontAwesome';

const Profile = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

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
  const handleSignOut = async () => {
    try {
      await clearUserInfo();
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollcontainer}>
        <View style={styles.basicinfo}>
          <Avatar
            size={120}
            rounded
            source={{ uri: "https://randomuser.me/api/portraits/men/36.jpg" }}
            containerStyle={styles.avatarContainer}
          />
          <Text style={[styles.name, { fontSize: 28, fontWeight: "600" }]}>
            {isLoading ? "Loading..." : userName}
          </Text>
          
        </View>
        <View style={styles.infordiv}>
          <View style={styles.infoBar}>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>100 Kg</Text>
              <Text style={styles.infoLabel}>Weight</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>21</Text>
              <Text style={styles.infoLabel}>Years Old</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>1.55 Cm</Text>
              <Text style={styles.infoLabel}>Height</Text>
            </View>
          </View>
        </View>
        <View style={styles.profileoption}>
        <TouchableOpacity style={styles.optionItem}>
            <Icon name="user" size={24} color="#FD6300" style={styles.optionIcon} />
            <Text style={styles.optionText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Icon name="heart" size={24} color="#FD6300" style={styles.optionIcon} />
            <Text style={styles.optionText}>Favorite</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Icon name="lock" size={24} color="#FD6300" style={styles.optionIcon} />
            <Text style={styles.optionText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Icon name="cog" size={24} color="#FD6300" style={styles.optionIcon} />
            <Text style={styles.optionText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Icon name="question-circle" size={24} color="#FD6300" style={styles.optionIcon} />
            <Text style={styles.optionText}>Help</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={handleSignOut}>
            <Icon name="sign-out" size={24} color="#FD6300" style={styles.optionIcon} />
            <Text style={styles.optionText}>Logout</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  scrollcontainer: {
    flexGrow: 1,
    
    paddingBottom: 70,

  },
  basicinfo: {
    paddingTop: 50,
    alignItems: "center",

  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 50,
  },
  infordiv: {
    flex: 1,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    height: 70,
  },
  infoBar: {
    position: 'absolute',
    top: '50%',
    left: 30, 
    right: 30,
    transform: [{translateX: 0}, {translateY: -65}],
    flexDirection: 'row',
    backgroundColor: 'black',
    borderRadius: 5,
    overflow: 'hidden',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRightWidth:0,
    borderRightColor: '#ccc',
  },
  infoValue: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  infoLabel: {
    color: '#bbb',
    fontSize: 13,
  },


  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
    paddingHorizontal: 30,
    
  },
  optionIcon: {
    marginRight: 20,
  },
  optionText: {
    color: 'white',
    fontSize: 18,
  },
  signOutButton: {
    backgroundColor: '#FD6300',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    alignSelf: 'center',
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#FD6300',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;