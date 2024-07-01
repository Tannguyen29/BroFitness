import React, { useState, useRef, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { verifyOtp, resendOtp } from '../../config/api';

const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  return `${name.charAt(0)}${'*'.repeat(name.length - 2)}${name.charAt(name.length - 1)}@${domain}`;
};

const OtpForgotPassword = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp(email, otp.join(''));
      Alert.alert("Success", "OTP verified successfully! Please reset your password.");
      navigation.navigate("ResetPassword", { email });
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Error verifying OTP');
    }
  };

  const handleResendOtp = async () => {
    if (isResending || countdown > 0) return;
    setIsResending(true);
    setError(null);
    try {
      await resendOtp(email);
      Alert.alert("Success", "A new OTP has been sent to your email.");
      setOtp(['', '', '', '']);
      inputRefs.current[0].focus();
      setIsResending(false);
      setCountdown(60);
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Error resending OTP');
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Confirm your code</Text>
        <Text style={styles.subtitle}>
          Put in the OTP code we sent to your email for confirmation{" "}
          {maskEmail(email)}
        </Text>
        <View style={styles.otpContainer}>
          {[0, 1, 2, 3].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              maxLength={1}
              keyboardType="number-pad"
              onChangeText={(value) => handleOtpChange(value, index)}
              value={otp[index]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleVerifyOtp}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.resendButton,
            (isResending || countdown > 0) && styles.disabledButton,
          ]}
          onPress={handleResendOtp}
          disabled={isResending || countdown > 0}
        >
          <Text style={styles.resendButtonText}>
            {isResending
              ? "Sending..."
              : countdown > 0
              ? `Resend in ${formatTime(countdown)}`
              : "Haven't got the code? Resend"}
          </Text>
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#FD6300',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 25,
    textAlign: 'center',
    color: 'white',
    fontSize: 24,
  },
  confirmButton: {
    backgroundColor: '#FD6300',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    width: '80%',
    top: 100
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  resendButton: {
    marginTop: 20,
  },
  resendButtonText: {
    color: '#FD6300',
    top: 100
  },
  errorText: {
    color: 'red',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default OtpForgotPassword;
