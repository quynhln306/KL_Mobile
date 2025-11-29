/**
 * Admin Profile Info Screen
 * Xem thông tin cá nhân admin (chỉ xem, không chỉnh sửa)
 */

import { View, Text, StyleSheet, ScrollView, Image, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts';
import { ADMIN_COLORS, ADMIN_SPACING, ADMIN_RADIUS } from '@/components/admin';

export default function AdminProfileInfo() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={ADMIN_COLORS.primary} />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={ADMIN_COLORS.textInverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color={ADMIN_COLORS.textSecondary} />
            </View>
          )}
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <InfoRow icon="person" label="Họ tên" value={user?.fullName || 'N/A'} />
          <InfoRow icon="mail" label="Email" value={user?.email || 'N/A'} />
          <InfoRow icon="call" label="Số điện thoại" value={user?.phone || 'Chưa cập nhật'} />
          <InfoRow icon="shield-checkmark" label="Vai trò" value="Quản trị viên" />
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Ionicons name="information-circle" size={20} color={ADMIN_COLORS.info} />
          <Text style={styles.noteText}>
            Để chỉnh sửa thông tin hoặc đổi mật khẩu, vui lòng truy cập trang web quản trị.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={20} color={ADMIN_COLORS.primary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ADMIN_COLORS.primary,
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
    color: ADMIN_COLORS.textInverse,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
  },
  container: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.background,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: ADMIN_COLORS.card,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ADMIN_COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: ADMIN_COLORS.border,
  },
  adminBadge: {
    position: 'absolute',
    bottom: 32,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  infoSection: {
    backgroundColor: ADMIN_COLORS.card,
    marginHorizontal: ADMIN_SPACING.lg,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.md,
    marginBottom: ADMIN_SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ADMIN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ADMIN_SPACING.sm,
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: ADMIN_COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: ADMIN_COLORS.textPrimary,
    textAlign: 'right',
    flex: 1,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: ADMIN_COLORS.infoLight,
    marginHorizontal: ADMIN_SPACING.lg,
    padding: ADMIN_SPACING.lg,
    borderRadius: ADMIN_RADIUS.md,
    gap: ADMIN_SPACING.sm,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: ADMIN_COLORS.info,
    lineHeight: 20,
  },
});
