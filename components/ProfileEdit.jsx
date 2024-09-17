import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getUserInfo, updateUserInfo, uploadAvatar } from '../config/api';
import { TextInput } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const ProfileEdit = () => {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    gender: '',
    weight: '',
    height: '',
    avatarUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userInfo = await getUserInfo();
      setUserData(userInfo);
    } catch (error) {
      console.error('Error loading user info:', error);
      Alert.alert('Error', 'Failed to load user information. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      await updateUserInfo(userData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating user info:', error);
      Alert.alert('Error', 'Failed to update user information. Please try again.');
    }
  };

  const handleCancel = () => {
    loadUserInfo();  
    setIsEditing(false);
  };

  const pickImage = async () => {
    if (!isEditing) {
      return; 
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadAvatarImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    if (!isEditing) {
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission required", "You need to allow camera access to take a photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadAvatarImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const uploadAvatarImage = async (uri) => {
    if (!uri) {
      console.error('No URI provided for avatar upload');
      Alert.alert('Error', 'No image selected. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      const avatarUrl = await uploadAvatar(uri);
      setUserData(prevData => ({ ...prevData, avatarUrl }));
      setIsLoading(false);
      Alert.alert('Success', 'Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to upload avatar. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#FD6300" />
      </TouchableOpacity>

      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={userData.avatarUrl ? { uri: userData.avatarUrl } : require('../assets/image/blankmale.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>
        {isEditing && (
          <TouchableOpacity onPress={takePhoto} style={styles.cameraButton}>
            <Icon name="camera" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../assets/animation/Loading.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      )}

      <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editIcon}>
        <Icon name="edit" size={24} color="#FD6300" />
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <InfoItem
          label="Full name"
          value={userData.name || ''} 
          isEditing={isEditing}
          onChangeText={(text) => setUserData({ ...userData, name: text })}
        />
        <InfoItem
          label="Email"
          value={userData.email || ''} 
          isEditing={isEditing}
          onChangeText={(text) => setUserData({ ...userData, email: text })}
          keyboardType="email-address"
        />
        <InfoItem
          label="Gender"
          value={userData.gender || ''}
          isEditing={isEditing}
          onChangeText={(text) => setUserData({ ...userData, gender: text })}
        />
        <InfoItem
          label="Weight"
          value={userData.weight?.toString() || ''}  
          isEditing={isEditing}
          onChangeText={(text) => setUserData({ ...userData, weight: text })}
          keyboardType="numeric"
        />
        <InfoItem
          label="Height"
          value={userData.height?.toString() || ''} 
          isEditing={isEditing}
          onChangeText={(text) => setUserData({ ...userData, height: text })}
          keyboardType="numeric"
        />
      </View>

      {isEditing && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const InfoItem = ({ label, value, isEditing, onChangeText, keyboardType }) => (
  <View style={styles.infoItem}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      mode="outlined"
      value={value}
      onChangeText={onChangeText}
      textColor='white'
      keyboardType={keyboardType || 'default'}
      editable={isEditing}  
      style={[styles.input, !isEditing && styles.disabledInput]}
      outlineStyle={{
       borderRadius: 20,
      }}
      outlineColor={isEditing ? "#FD6300" : "#555"}  
      theme={{
        colors: {
          text: 'white',  
          placeholder: '#888',  
        }
      }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1c1c1e',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 120,
    backgroundColor: '#FD6300',
    padding: 10,
    borderRadius: 20,
  },
  infoContainer: {
    width: '100%',
  },
  infoItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#FD6300',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#2c2c2e',  
    borderRadius: 15,
  },
  disabledInput: {
    backgroundColor: '#3a3a3c',  
  },
  editIcon: {
    position: 'absolute',
    top: 40,
    right: 20, 
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#FD6300',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#2c2c2e',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  lottie: {
    width: 200,
    height: 200,
  },
});

export default ProfileEdit;