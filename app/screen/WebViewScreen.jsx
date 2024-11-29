import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator, Linking, Platform, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { getUserInfo } from '../../config/api';

const WebViewScreen = ({ route, navigation }) => {
  const { url } = route.params;
  const [isLoading, setIsLoading] = useState(true);

  // Log URL thanh toán ban đầu
  useEffect(() => {
    console.log('\n=== PAYMENT URL ===');
    console.log('Payment URL from VNPAY:', url);
  }, [url]);

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
    const currentUrl = navState.url;
    
    // Log mỗi URL được load
    console.log('\n=== URL CHANGED ===');
    console.log('Current URL:', currentUrl);

    // Kiểm tra URL return
    if (currentUrl.includes('vnp_ResponseCode')) {
      console.log('\n=== RETURN URL ===');
      console.log('Return URL with payment result:', currentUrl);
      
      try {
        const decodedUrl = decodeURIComponent(currentUrl);
        const searchParams = new URLSearchParams(decodedUrl.split('?')[1]);
        
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
        
        console.log('Payment Response:', {
          responseCode: vnp_ResponseCode,
          orderInfo: vnp_OrderInfo
        });

        if (vnp_ResponseCode === '00') {
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
            try {
              console.log('Sending request with data:', { orderInfo: vnp_OrderInfo });
              const response = await axios.post(
                `${API_BASE_URL}/payment/update-user-role-and-pt`,
                { orderInfo: vnp_OrderInfo },
                { headers: { 'x-auth-token': token } }
              );
              console.log('Response from server:', response.data);

              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'PaymentResult',
                    params: {
                      status: 'success',
                      message: 'Thanh toán thành công!',
                      orderInfo: vnp_OrderInfo,
                      userData: response.data.user
                    }
                  }
                ]
              });
            } catch (error) {
              console.error('Full error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
              });
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'PaymentResult',
                    params: {
                      status: 'error',
                      message: 'Không thể cập nhật thông tin người dùng. Vui lòng liên hệ hỗ trợ.'
                    }
                  }
                ]
              });
            }
          }
        } else {
          // Xử lý lỗi và chuyển hướng
          let errorMessage = 'Thanh toán không thành công.';
          // Map mã lỗi từ VNPay
          switch(vnp_ResponseCode) {
            case '07':
              errorMessage = 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).';
              break;
            case '09':
              errorMessage = 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.';
              break;
            case '10':
              errorMessage = 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.';
              break;
            default:
              errorMessage = 'Thanh toán không thành công. Vui lòng thử lại.';
          }
          
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'PaymentResult',
                params: {
                  status: 'error',
                  message: errorMessage
                }
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error handling return URL:', error);
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'PaymentResult',
              params: {
                status: 'error',
                message: 'Đã xảy ra lỗi khi xử lý thanh toán.'
              }
            }
          ]
        });
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD6300" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  }
});

export default WebViewScreen;