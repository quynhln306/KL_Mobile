/**
 * Edit Profile Screen
 * Chỉnh sửa thông tin cá nhân
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
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts';
import { Button, Input } from '@/components/shared';
import { isValidPhone } from '@/utils/validation';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const [fullNameError, setFullNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;

    setFullNameError('');
    setPhoneError('');

    if (!fullName.trim()) {
      setFullNameError('Vui lòng nhập họ tên');
      isValid = false;
    } else if (fullName.trim().length < 3) {
      setFullNameError('Họ tên phải có ít nhất 3 ký tự');
      isValid = false;
    }

    if (phone.trim() && !isValidPhone(phone)) {
      setPhoneError('Số điện thoại không hợp lệ');
      isValid = false;
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });

      Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
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
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
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
          <Input
            label="Họ và tên"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              setFullNameError('');
            }}
            placeholder="Nhập họ và tên"
            error={fullNameError}
            autoCapitalize="words"
          />

          <Input
            label="Email"
            value={user?.email || ''}
            editable={false}
            placeholder="Email"
            style={styles.disabledInput}
          />

          <Input
            label="Số điện thoại"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setPhoneError('');
            }}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            error={phoneError}
          />

          <Text style={styles.note}>
            * Email không thể thay đổi
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title="Lưu thay đổi"
          onPress={handleSave}
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
  form: {
    gap: 4,
  },
  disabledInput: {
    backgroundColor: '#F2F2F7',
    color: '#8E8E93',
  },
  note: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    fontStyle: 'italic',
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
