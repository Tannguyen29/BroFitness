import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator, Linking, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const WebViewScreen = ({ route, navigation }) => {
  const { url } = route.params;
  const [isLoading, setIsLoading] = useState(true);

  const handleShouldStartLoadWithRequest = (request) => {
    console.log('Handling URL:', request.url); // Debug log

    // Xử lý đặc biệt cho NCB intent URL
    if (request.url.includes('Intent;scheme=NCB')) {
      try {
        if (Platform.OS === 'android') {
          // Thử mở app NCB trước
          Linking.canOpenURL('ncb://').then(supported => {
            if (supported) {
              // Nếu app đã cài đặt, mở app
              return Linking.openURL('ncb://');
            } else {
              // Nếu app chưa cài đặt, mở Play Store
              return Linking.openURL('market://details?id=com.ncb.bank');
            }
          }).catch(() => {
            // Fallback to Play Store web URL
            Linking.openURL('https://play.google.com/store/apps/details?id=com.ncb.bank');
          });
        } else {
          // iOS: Thử mở app trước, nếu không được thì mở App Store
          Linking.canOpenURL('ncb://').then(supported => {
            if (supported) {
              return Linking.openURL('ncb://');
            } else {
              return Linking.openURL('https://apps.apple.com/vn/app/ncb-smart/id1464917646');
            }
          }).catch(err => {
            console.error('Error opening NCB app:', err);
            Linking.openURL('https://apps.apple.com/vn/app/ncb-smart/id1464917646');
          });
        }
        return false;
      } catch (error) {
        console.error('Error handling NCB intent:', error);
        Alert.alert(
          'Không thể mở ứng dụng NCB',
          'Vui lòng cài đặt ứng dụng NCB Smart để tiếp tục.',
          [
            { 
              text: 'Cài đặt', 
              onPress: () => {
                if (Platform.OS === 'android') {
                  Linking.openURL('https://play.google.com/store/apps/details?id=com.ncb.bank');
                } else {
                  Linking.openURL('https://apps.apple.com/vn/app/ncb-smart/id1464917646');
                }
              }
            },
            { text: 'Hủy', style: 'cancel' }
          ]
        );
        return false;
      }
    }

    // Xử lý các URL scheme ngân hàng thông thường
    const bankSchemes = [
      'vnpayqr://', 'vcb://', 'vietcombank://', 'acb://', 'vietinbank://',
      'techcombank://', 'bidv://', 'agribank://', 'tpbank://', 'mbbank://',
      'ncb://', 'ocb://', 'vpbank://', 'hdbank://', 'scb://'
    ];

    if (bankSchemes.some(scheme => request.url.startsWith(scheme))) {
      console.log('Opening bank URL:', request.url); // Debug log
      Linking.openURL(request.url).catch(err => {
        console.error('Error opening bank app:', err);
        Alert.alert(
          'Không thể mở ứng dụng',
          'Vui lòng cài đặt ứng dụng ngân hàng để tiếp tục.',
          [
            {
              text: 'OK',
              onPress: () => console.log('Alert closed')
            }
          ]
        );
      });
      return false;
    }

    // Cho phép tải các URL khác
    return true;
  };
  const handleNavigationStateChange = async (navState) => {
    console.log('Current URL:', navState.url);

    if (navState.url.includes('/vnpay-return')) {
      try {
        const urlObj = new URL(navState.url);
        const vnp_ResponseCode = urlObj.searchParams.get('vnp_ResponseCode');
        const vnp_OrderInfo = urlObj.searchParams.get('vnp_OrderInfo');
        const isSuccess = vnp_ResponseCode === '00';
        
        console.log('Payment response:', {
          responseCode: vnp_ResponseCode,
          orderInfo: vnp_OrderInfo
        });

        if (isSuccess) {
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
            try {
              // Gửi request để cập nhật role với orderInfo
              await axios.post(`${API_BASE_URL}/update-user-role`, {
                orderInfo: vnp_OrderInfo
              }, {
                headers: {
                  'x-auth-token': token
                }
              });

              // Tăng thời gian chờ
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              const userResponse = await axios.get(`${API_BASE_URL}/user-info`, {
                headers: {
                  'x-auth-token': token
                }
              });
              
              await AsyncStorage.setItem('userInfo', JSON.stringify(userResponse.data));
            } catch (error) {
              console.error('Error updating user info:', error);
            }
          }

          navigation.replace('PaymentResult', {
            status: 'success',
            message: 'Thanh toán thành công! Bạn đã được nâng cấp lên tài khoản Premium.'
          });
        } else {
          navigation.replace('PaymentResult', {
            status: 'failed',
            message: 'Thanh toán không thành công. Vui lòng thử lại.'
          });
        }
      } catch (error) {
        console.error('Error handling payment result:', error);
        navigation.replace('PaymentResult', {
          status: 'failed',
          message: 'Đã xảy ra lỗi khi xử lý thanh toán.'
        });
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <WebView
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
      {isLoading && (
        <View style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.8)'
        }}>
          <ActivityIndicator size="large" color="#FD6300" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default WebViewScreen;