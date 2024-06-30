import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clearUserInfo } from '../../config/api'; // Đảm bảo đường dẫn này chính xác

const Profile = () => {
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      await clearUserInfo(); // Xóa thông tin người dùng từ AsyncStorage
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }], // Đảm bảo 'SignIn' là tên chính xác của màn hình đăng nhập
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      {/* Thêm các thông tin profile khác ở đây */}

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e', // Phù hợp với theme tối của ứng dụng
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: '#FD6300', // Màu cam như trong SignIn
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