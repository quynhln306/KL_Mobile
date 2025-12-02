/**
 * Change Password Screen
 * Đổi mật khẩu đơn giản - chỉ cần 6 ký tự
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts';
import { Button, Input } from '@/components/shared';
import { isValidPassword } from '@/utils/validation';

export default function ChangePasswordScreen() {
  const { changePassword, sessionExpiresAt } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;

    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    // Validate current password
    if (!currentPassword.trim()) {
      setCurrentPasswordError('Vui lòng nhập mật khẩu hiện tại');
      isValid = false;
    }

    // Validate new password - chỉ cần 6 ký tự
    if (!newPassword.trim()) {
      setNewPasswordError('Vui lòng nhập mật khẩu mới');
      isValid = false;
    } else if (!isValidPassword(newPassword)) {
      setNewPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    } else if (currentPassword === newPassword) {
      setNewPasswordError('Mật khẩu mới phải khác mật khẩu hiện tại');
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Vui lòng xác nhận mật khẩu mới');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp');
      isValid = false;
    }

    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await changePassword(currentPassword, newPassword);

      Alert.alert(
        'Thành công',
        'Mật khẩu đã được thay đổi.\nPhiên đăng nhập đã được gia hạn thêm 7 ngày.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error changing password:', error);

      if (
        error.message?.toLowerCase().includes('incorrect') ||
        error.message?.toLowerCase().includes('sai') ||
        error.message?.toLowerCase().includes('wrong')
      ) {
        setCurrentPasswordError('Mật khẩu hiện tại không chính xác');
      } else {
        Alert.alert('Lỗi', error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.form}>
          {/* Current Password */}
          <View style={styles.inputWrapper}>
            <Input
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                setCurrentPasswordError('');
              }}
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry={!showCurrentPassword}
              error={currentPasswordError}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Ionicons name={showCurrentPassword ? 'eye-off' : 'eye'} size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <View style={styles.inputWrapper}>
            <Input
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setNewPasswordError('');
              }}
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              secureTextEntry={!showNewPassword}
              error={newPasswordError}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            <Input
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError('');
              }}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={!showConfirmPassword}
              error={confirmPasswordError}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Match Indicator */}
          {confirmPassword.length > 0 && (
            <View style={styles.matchIndicator}>
              <Ionicons
                name={newPassword === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={newPassword === confirmPassword ? '#34C759' : '#FF3B30'}
              />
              <Text
                style={[
                  styles.matchText,
                  { color: newPassword === confirmPassword ? '#34C759' : '#FF3B30' },
                ]}
              >
                {newPassword === confirmPassword ? 'Mật khẩu khớp' : 'Mật khẩu không khớp'}
              </Text>
            </View>
          )}

          {/* Tips */}
          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>Lưu ý:</Text>
            <Text style={styles.tipText}>• Mật khẩu phải có ít nhất 6 ký tự</Text>
            <Text style={styles.tipText}>• Không chia sẻ mật khẩu với người khác</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title="Đổi mật khẩu"
          onPress={handleChangePassword}
          loading={loading}
          disabled={loading}
        />
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  sessionText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#007AFF',
  },
  form: {
    gap: 4,
  },
  inputWrapper: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 38,
    padding: 4,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 12,
  },
  matchText: {
    marginLeft: 6,
    fontSize: 13,
  },
  tips: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
});
