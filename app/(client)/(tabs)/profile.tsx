/**
 * Client Profile Tab
 * Thông tin cá nhân và settings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts';
import { Button } from '@/components/shared';

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, showChevron = true, danger = false }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
          <Ionicons
            name={icon as any}
            size={20}
            color={danger ? '#FF3B30' : '#007AFF'}
          />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={[styles.menuItemTitle, danger && styles.menuItemTitleDanger]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
      )}
    </TouchableOpacity>
  );
}

export default function ClientProfileScreen() {
  const { user, logout, sessionExpiresAt } = useAuth();

  // Tính số ngày còn lại của session
  const getSessionRemainingDays = () => {
    if (!sessionExpiresAt) return null;
    const now = new Date();
    const diffMs = sessionExpiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const remainingDays = getSessionRemainingDays();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login' as any);
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/(client)/profile/edit' as any);
  };

  const handleChangePassword = () => {
    router.push('/(client)/profile/change-password' as any);
  };

  const handleViewOrders = () => {
    router.push('/(client)/(tabs)/orders' as any);
  };

  const handleSupport = () => {
    Alert.alert('Hỗ trợ', 'Liên hệ: support@tourapp.com\nHotline: 1900-xxxx');
  };

  const handleAbout = () => {
    Alert.alert('Về ứng dụng', 'Tour App v1.0.0\nỨng dụng đặt tour du lịch');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#FFFFFF" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.phone && (
            <Text style={styles.userPhone}>{user.phone}</Text>
          )}
        </View>
        
        {/* Session Info */}
        {remainingDays !== null && (
          <View style={styles.sessionBadge}>
            <Ionicons 
              name="time-outline" 
              size={14} 
              color={remainingDays <= 1 ? '#FF3B30' : '#007AFF'} 
            />
            <Text style={[
              styles.sessionText,
              remainingDays <= 1 && styles.sessionTextWarning
            ]}>
              {remainingDays <= 0 
                ? 'Phiên sắp hết hạn' 
                : `Còn ${remainingDays} ngày`}
            </Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="person-outline"
            title="Chỉnh sửa thông tin"
            subtitle="Cập nhật thông tin cá nhân"
            onPress={handleEditProfile}
          />
          <MenuItem
            icon="lock-closed-outline"
            title="Đổi mật khẩu"
            subtitle="Thay đổi mật khẩu đăng nhập"
            onPress={handleChangePassword}
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Đơn hàng</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="receipt-outline"
            title="Đơn hàng của tôi"
            subtitle="Xem lịch sử đặt tour"
            onPress={handleViewOrders}
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Khác</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="help-circle-outline"
            title="Hỗ trợ"
            subtitle="Liên hệ với chúng tôi"
            onPress={handleSupport}
          />
          <MenuItem
            icon="information-circle-outline"
            title="Về ứng dụng"
            subtitle="Phiên bản và thông tin"
            onPress={handleAbout}
          />
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button
          title="Đăng xuất"
          onPress={handleLogout}
          variant="danger"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    paddingBottom: 40,
  },
  userSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  sessionText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  sessionTextWarning: {
    color: '#FF3B30',
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerDanger: {
    backgroundColor: '#FFEBEE',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  menuItemTitleDanger: {
    color: '#FF3B30',
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
});
