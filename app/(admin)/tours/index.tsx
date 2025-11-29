/**
 * Admin Tours List Screen
 * Danh sách tours với search và filter
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
  FilterChips,
  EmptyState,
  StatusBadge,
  ADMIN_COLORS,
  ADMIN_SPACING,
  ADMIN_RADIUS,
  ADMIN_SHADOWS,
} from '@/components/admin';
import { adminService } from '@/services/admin.service';
import { Tour } from '@/types';

const FILTER_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang mở' },
  { key: 'deleted', label: 'Tạm dừng' },
];

export default function ToursListScreen() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchTours = async () => {
    try {
      const params: any = { limit: 50 };
      
      // Nếu filter là 'deleted', lấy tour đã xóa
      if (filter === 'deleted') {
        params.includeDeleted = true;
      } else if (filter !== 'all') {
        params.status = filter;
      }
      
      if (search) params.search = search;

      const response = await adminService.getTours(params);
      if (response.success && response.data) {
        setTours(response.data.tours || []);
      }
    } catch (error) {
      // Silent fail - tours won't be loaded
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTours();
  }, [filter, search]);

  const handleSearch = () => {
    setLoading(true);
    fetchTours();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const renderTourItem = ({ item }: { item: Tour }) => (
    <TouchableOpacity
      style={[styles.tourCard, filter === 'deleted' && styles.deletedCard]}
      onPress={() => router.push(`/(admin)/tour/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/120' }}
        style={[styles.tourImage, filter === 'deleted' && styles.deletedImage]}
      />
      <View style={styles.tourInfo}>
        <View style={styles.tourHeader}>
          <Text style={styles.tourName} numberOfLines={2}>
            {item.name}
          </Text>
          {filter === 'deleted' ? (
            <View style={styles.deletedBadge}>
              <Text style={styles.deletedBadgeText}>Tạm dừng</Text>
            </View>
          ) : (
            <StatusBadge
              status={item.status === 'active' ? 'active' : 'inactive'}
              size="sm"
              showIcon={false}
            />
          )}
        </View>
        <View style={styles.tourMeta}>
          <Ionicons name="calendar-outline" size={14} color={ADMIN_COLORS.textSecondary} />
          <Text style={styles.metaText}>{formatDate(item.departureDate)}</Text>
        </View>
        <Text style={styles.tourPrice}>
          {formatCurrency(item.priceNewAdult || item.priceAdult || 0)}
        </Text>
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
        <Text style={styles.headerTitle}>Tours</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.container}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm tour..."
          onSubmit={handleSearch}
        />
        <FilterChips
          options={FILTER_OPTIONS}
          selected={filter}
          onSelect={setFilter}
        />
        <FlatList
          data={tours}
          renderItem={renderTourItem}
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
              icon="map-outline"
              title="Không có tour nào"
              subtitle="Chưa có tour nào phù hợp với bộ lọc"
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
  tourCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.md,
    marginBottom: ADMIN_SPACING.md,
    ...ADMIN_SHADOWS.sm,
  },
  tourImage: {
    width: 80,
    height: 80,
    borderRadius: ADMIN_RADIUS.sm,
    backgroundColor: ADMIN_COLORS.border,
  },
  tourInfo: {
    flex: 1,
    marginLeft: ADMIN_SPACING.md,
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ADMIN_SPACING.xs,
  },
  tourName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: ADMIN_COLORS.textPrimary,
    marginRight: ADMIN_SPACING.sm,
  },
  tourMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ADMIN_SPACING.xs,
    marginBottom: ADMIN_SPACING.xs,
  },
  metaText: {
    fontSize: 13,
    color: ADMIN_COLORS.textSecondary,
  },
  tourPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: ADMIN_COLORS.primary,
  },
  deletedCard: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.error,
    borderStyle: 'dashed',
  },
  deletedImage: {
    opacity: 0.5,
  },
  deletedBadge: {
    backgroundColor: ADMIN_COLORS.errorLight,
    paddingHorizontal: ADMIN_SPACING.sm,
    paddingVertical: ADMIN_SPACING.xs,
    borderRadius: ADMIN_RADIUS.sm,
  },
  deletedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: ADMIN_COLORS.error,
  },
});
