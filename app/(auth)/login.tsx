/**
 * Login Screen
 * Đăng nhập cho cả user và admin
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
import { isValidEmail } from '@/utils/validation';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validate email
    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Email không hợp lệ');
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await login(email.trim(), password);

      // Navigate based on role
      // Note: Admin tabs chưa tạo, tạm thời admin cũng vào client
      router.replace('/(client)/(tabs)' as any);
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Đăng nhập thất bại',
        error.message || 'Email hoặc mật khẩu không chính xác'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/(auth)/register' as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Đăng nhập</Text>
            <Text style={styles.subtitle}>
              Chào mừng bạn quay trở lại!
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Nhập email của bạn"
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
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              error={passwordError}
              secureTextEntry
            />

            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
            />
          </View>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={handleRegister} disabled={loading}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
  loginButton: {
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
  registerLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  testInfo: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  testInfoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  testInfoText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
});
