/**
 * Register Screen
 * Đăng ký tài khoản mới (chỉ cho user)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts';
import { Button, Input } from '@/components/shared';
import { isValidEmail, isValidPhone, isValidPassword } from '@/utils/validation';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setFullNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate full name
    if (!fullName.trim()) {
      setFullNameError('Vui lòng nhập họ tên');
      isValid = false;
    } else if (fullName.trim().length < 3) {
      setFullNameError('Họ tên phải có ít nhất 3 ký tự');
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Email không hợp lệ');
      isValid = false;
    }

    // Validate phone (optional but if provided must be valid)
    if (phone.trim() && !isValidPhone(phone)) {
      setPhoneError('Số điện thoại không hợp lệ');
      isValid = false;
    }

    // Validate password - chỉ cần 6 ký tự
    if (!password.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (!isValidPassword(password)) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Vui lòng xác nhận mật khẩu');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password,
        phone: phone.trim() || undefined,
      });

      // Sau khi register thành công, tự động login và navigate
      Alert.alert('Đăng ký thành công', 'Chào mừng bạn đến với ứng dụng!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(client)/(tabs)' as any),
        },
      ]);
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('Đăng ký thất bại', error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Đăng ký</Text>
            <Text style={styles.subtitle}>Tạo tài khoản mới để bắt đầu</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setFullNameError('');
              }}
              error={fullNameError}
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="Nhập email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Số điện thoại (không bắt buộc)"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setPhoneError('');
              }}
              error={phoneError}
              keyboardType="phone-pad"
            />

            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              error={passwordError}
              secureTextEntry
            />

            <Input
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError('');
              }}
              error={confirmPasswordError}
              secureTextEntry
            />

            <Button
              title="Đăng ký"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
            />
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={handleBackToLogin} disabled={loading}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  form: {
    marginBottom: 24,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  loginLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
