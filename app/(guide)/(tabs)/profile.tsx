/**
 * Guide Profile Screen
 * Tài khoản hướng dẫn viên
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts';

const GUIDE_COLORS = {
  primary: '#10B981',
  background: '#F3F4F6',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
};

export default function GuideProfile() {
  const { user, logout, sessionExpiresAt } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={GUIDE_COLORS.primary} />
      
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.guideBadge}>
              <Text style={styles.guideBadgeText}>HDV</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.fullName || 'Hướng dẫn viên'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="person" label="Họ tên" value={user?.fullName || 'N/A'} />
            <InfoRow icon="mail" label="Email" value={user?.email || 'N/A'} />
            <InfoRow icon="call" label="Điện thoại" value={user?.phone || 'Chưa cập nhật'} />
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.noteText}>
            Để chỉnh sửa thông tin hoặc đổi mật khẩu, vui lòng liên hệ quản trị viên.
          </Text>
        </View>

        {/* Session Info */}
        <View style={styles.sessionInfo}>
          <Ionicons name="time-outline" size={16} color={GUIDE_COLORS.textSecondary} />
          <Text style={styles.sessionText}>
            Phiên đăng nhập hết hạn: {formatDate(sessionExpiresAt)}
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={GUIDE_COLORS.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={20} color={GUIDE_COLORS.primary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GUIDE_COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: GUIDE_COLORS.background,
  },
  header: {
    backgroundColor: GUIDE_COLORS.primary,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  guideBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  guideBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1F2937',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  infoSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GUIDE_COLORS.textPrimary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: GUIDE_COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: GUIDE_COLORS.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: GUIDE_COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: GUIDE_COLORS.textPrimary,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 20,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sessionText: {
    fontSize: 13,
    color: GUIDE_COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GUIDE_COLORS.card,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: GUIDE_COLORS.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: GUIDE_COLORS.textSecondary,
    marginTop: 20,
    marginBottom: 40,
  },
});
