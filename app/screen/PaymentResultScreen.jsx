import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/vi';
import { getUserInfo } from '../../config/api';

const PaymentResultScreen = ({ navigation }) => {
    const route = useRoute();
    const { status, message, orderInfo, userData } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [packageInfo, setPackageInfo] = useState(null);

    useEffect(() => {
        const fetchPaymentResult = async () => {
            if (status === 'success') {
                try {
                    const token = await AsyncStorage.getItem('userToken');
                    if (!token) throw new Error('No token found');

                    // Lấy thông tin user mới nhất
                    const response = await axios.get(
                        `${API_BASE_URL}/users/info`,
                        { headers: { 'x-auth-token': token } }
                    );
                    const userInfo = response.data;
                    console.log('Full user info response:', userInfo);
                    console.log('PT ID from userInfo:', userInfo.ptId);

                    if (userInfo.role === 'premium') {
                        // Kiểm tra và log ptId
                        console.log('PT ID from userInfo:', userInfo.ptId);
                        
                        // Lấy thông tin PT nếu có ptId
                        if (userInfo.ptId) {
                            try {
                                console.log('Attempting to fetch PT info for ID:', userInfo.ptId);
                                const ptResponse = await axios.get(
                                    `${API_BASE_URL}/users/${userInfo.ptId}`,
                                    { headers: { 'x-auth-token': token } }
                                );
                                console.log('PT Response:', ptResponse.data);
                                
                                setPackageInfo({
                                    duration: orderInfo.split('_')[0].match(/\d+/)[0],
                                    expireDate: userInfo.premiumExpireDate,
                                    daysRemaining: userInfo.daysRemaining,
                                    ptName: ptResponse.data.name,
                                    ptEmail: ptResponse.data.email
                                });
                            } catch (ptError) {
                                console.error('Error fetching PT info:', ptError);
                                setPackageInfo({
                                    duration: orderInfo.split('_')[0].match(/\d+/)[0],
                                    expireDate: userInfo.premiumExpireDate,
                                    daysRemaining: userInfo.daysRemaining,
                                    ptName: 'Không thể tải thông tin PT',
                                    ptEmail: 'Đang cập nhật'
                                });
                            }
                        } else {
                            setPackageInfo({
                                duration: orderInfo.split('_')[0].match(/\d+/)[0],
                                expireDate: userInfo.premiumExpireDate,
                                daysRemaining: userInfo.daysRemaining,
                                ptName: 'Chưa được phân công',
                                ptEmail: 'Đang cập nhật'
                            });
                        }
                    } else {
                        throw new Error('Không thể xác nhận trạng thái Premium');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    setError('Không thể cập nhật thông tin người dùng');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchPaymentResult();
    }, [status, orderInfo]);

    const renderSuccessContent = () => {
        if (!packageInfo) return null;

        const expireDate = moment(packageInfo.expireDate).locale('vi');
        
        return (
            <View style={styles.contentContainer}>
                <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
                <Text style={styles.successTitle}>Thanh toán thành công!</Text>
                
                {/* Thông tin gói Premium */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Thông tin gói Premium</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Thời hạn gói:</Text>
                        <Text style={styles.value}>{packageInfo.duration} tháng</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Ngày hết hạn:</Text>
                        <Text style={styles.value}>{expireDate.format('DD/MM/YYYY')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Số ngày còn lại:</Text>
                        <Text style={styles.value}>{packageInfo.daysRemaining} ngày</Text>
                    </View>
                </View>

                {/* Thông tin PT */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Thông tin PT của bạn</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Tên PT:</Text>
                        <Text style={styles.value}>{packageInfo.ptName}</Text>
                    </View>
                    {packageInfo.ptEmail !== 'Đang cập nhật' && (
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.value}>{packageInfo.ptEmail}</Text>
                        </View>
                    )}
                    {packageInfo.ptName === 'Chưa được phân công' && (
                        <Text style={styles.note}>
                            PT sẽ được phân công trong thời gian sớm nhất
                        </Text>
                    )}
                </View>

                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => navigation.navigate('BottomTabs')}
                >
                    <Text style={styles.buttonText}>Về trang chủ</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderErrorContent = () => (
        <View style={styles.contentContainer}>
            <MaterialIcons name="error" size={80} color="#f44336" />
            <Text style={styles.errorTitle}>Thanh toán thất bại</Text>
            <Text style={styles.errorMessage}>{error || message}</Text>
            <TouchableOpacity 
                style={[styles.button, styles.errorButton]}
                onPress={() => navigation.navigate('BottomTabs')}
            >
                <Text style={styles.buttonText}>Về trang chủ</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Đang xử lý thanh toán...</Text>
                </View>
            ) : (
                <>
                    {status === 'success' ? renderSuccessContent() : renderErrorContent()}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginVertical: 20,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f44336',
        marginVertical: 20,
    },
    errorMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    infoSection: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    label: {
        fontSize: 16,
        color: '#666',
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 20,
    },
    errorButton: {
        backgroundColor: '#f44336',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    note: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10
    }
});

export default PaymentResultScreen; 