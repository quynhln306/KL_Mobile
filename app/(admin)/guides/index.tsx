/**
 * Admin Guides List Screen
 * Danh sách hướng dẫn viên
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Text,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  SearchBar,
  EmptyState,
  StatusBadge,
  ADMIN_COLORS,
  ADMIN_SPACING,
  ADMIN_RADIUS,
  ADMIN_SHADOWS,
} from '@/components/admin';
import { adminService } from '@/services/admin.service';
import { Guide } from '@/types';

export default function GuidesListScreen() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchGuides = async () => {
    try {
      const params: any = { limit: 50 };
      if (search) params.search = search;

      const response = await adminService.getGuides(params);
      if (response.success && response.data) {
        setGuides(response.data.guides || []);
      }
    } catch (error) {
      // Silent fail - guides won't be loaded
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGuides();
  }, [search]);

  const handleSearch = () => {
    setLoading(true);
    fetchGuides();
  };

  const renderGuideItem = ({ item }: { item: Guide }) => (
    <TouchableOpacity
      style={styles.guideCard}
      onPress={() => router.push(`/(admin)/guide/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/60' }}
        style={styles.avatar}
      />
      <View style={styles.guideInfo}>
        <View style={styles.guideHeader}>
          <Text style={styles.guideName}>{item.name}</Text>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.status === 'active' ? ADMIN_COLORS.success : ADMIN_COLORS.textTertiary },
            ]}
          />
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="call-outline" size={14} color={ADMIN_COLORS.textSecondary} />
          <Text style={styles.metaText}>{item.phone || 'Chưa có SĐT'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="mail-outline" size={14} color={ADMIN_COLORS.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.email || 'Chưa có email'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={ADMIN_COLORS.textTertiary} />
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
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
        <Text style={styles.headerTitle}>Hướng dẫn viên</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.container}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm HDV..."
          onSubmit={handleSearch}
        />
        <FlatList
          data={guides}
          renderItem={renderGuideItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={ADMIN_COLORS.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="Không có HDV nào"
              subtitle="Chưa có hướng dẫn viên nào phù hợp"
            />
          }
        />
      </View>
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: ADMIN_SPACING.lg,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.md,
    marginBottom: ADMIN_SPACING.md,
    ...ADMIN_SHADOWS.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ADMIN_COLORS.border,
  },
  guideInfo: {
    flex: 1,
    marginLeft: ADMIN_SPACING.md,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ADMIN_SPACING.xs,
  },
  guideName: {
    fontSize: 16,
    fontWeight: '600',
    color: ADMIN_COLORS.textPrimary,
    marginRight: ADMIN_SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ADMIN_SPACING.xs,
    marginTop: 2,
  },
  metaText: {
    fontSize: 13,
    color: ADMIN_COLORS.textSecondary,
    flex: 1,
  },
});
