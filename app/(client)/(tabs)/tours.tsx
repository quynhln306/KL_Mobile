/**
 * Client Tours Tab
 * Danh sách tất cả tours với search và filter
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { tourService } from '@/services';
import { TourCard } from '@/components/client';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { Tour } from '@/types';

export default function ClientToursScreen() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const params = useLocalSearchParams();
  const categoryFilter = params.category as string;

  useEffect(() => {
    loadTours(true);
  }, [categoryFilter]);

  const loadTours = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;

      if (reset) {
        setLoading(true);
        setTours([]);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      let newTours: Tour[] = [];

      // Always use general tours endpoint with pagination
      const params: any = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
      };

      if (categoryFilter) {
        params.category = categoryFilter;
      }

      const result = await tourService.getTours(params);
      newTours = result.items || [];

      if (reset) {
        setTours(newTours);
      } else {
        setTours((prev) => [...prev, ...newTours]);
      }

      // Check if there are more items to load
      setHasMore(newTours.length === 10);
      
      if (!reset) {
        setPage((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error('Error loading tours:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách tours. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTours(true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadTours(false);
    }
  };

  const handleSearch = () => {
    loadTours(true);
  };

  const handleClearFilter = () => {
    // Clear category filter by navigating without params
    router.setParams({ category: undefined } as any);
    setSearchQuery('');
  };

  const handleTourPress = (tour: Tour) => {
    router.push(`/(client)/tour/${tour.id}` as any);
  };

  const renderTour = ({ item }: { item: Tour }) => (
    <TourCard tour={item} onPress={() => handleTourPress(item)} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải tours..." />;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        {categoryFilter && (
          <View style={styles.filterInfo}>
            <Text style={styles.filterText}>Lọc theo danh mục</Text>
            <TouchableOpacity onPress={handleClearFilter} style={styles.clearFilterButton}>
              <Ionicons name="close-circle" size={20} color="#007AFF" />
              <Text style={styles.clearFilterText}>Xóa lọc</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#8E8E93"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tours..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Ionicons
              name="close-circle"
              size={20}
              color="#8E8E93"
              style={styles.clearIcon}
              onPress={() => {
                setSearchQuery('');
                loadTours(true);
              }}
            />
          )}
        </View>
      </View>

      {/* Tours List */}
      {tours.length > 0 ? (
        <FlatList
          data={tours}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTour}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <EmptyState
          title="Không tìm thấy tours"
          message={
            searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có tours nào'
          }
          icon="🔍"
          actionLabel={searchQuery ? 'Xóa tìm kiếm' : undefined}
          onAction={
            searchQuery
              ? () => {
                  setSearchQuery('');
                  loadTours(true);
                }
              : undefined
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  clearIcon: {
    marginLeft: 8,
  },
  listContent: {
    padding: 20,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
