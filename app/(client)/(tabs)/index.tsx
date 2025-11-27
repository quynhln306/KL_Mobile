/**
 * Client Home Tab
 * Trang chủ với featured tours và categories
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { homeService } from '@/services';
import { TourCard, CategoryCard } from '@/components/client';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { Tour, Category } from '@/types';
import { useAuth } from '@/contexts';

export default function ClientHomeScreen() {
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const result = await homeService.getHomeData();

      if (result.success && result.data) {
        setFeaturedTours(result.data.featuredTours || []);
        
        // Filter out parent categories by exact name match
        const allCategories = result.data.categories || [];
        const filteredCategories = allCategories.filter((cat) => {
          const name = cat.name || '';
          // Exclude exact matches only
          return name !== 'Tour Trong Nước' && name !== 'Tour Nước Ngoài';
        });
        
        setCategories(filteredCategories);
      }
    } catch (error: any) {
      console.error('Error loading home data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleTourPress = (tour: Tour) => {
    router.push(`/(client)/tour/${tour.id}` as any);
  };

  const handleCategoryPress = (category: Category) => {
    // Navigate to Tours tab with category filter
    router.push({
      pathname: '/(client)/(tabs)/tours',
      params: { category: category.slug },
    } as any);
  };

  const handleViewAllTours = () => {
    router.push('/(client)/(tabs)/tours' as any);
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
        </View>
        {categories.length > 0 ? (
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                onPress={() => handleCategoryPress(item)}
              />
            )}
            contentContainerStyle={styles.categoriesList}
          />
        ) : (
          <EmptyState
            title="Chưa có danh mục"
            message="Danh mục sẽ được cập nhật sớm"
            icon="📂"
          />
        )}
      </View>

      {/* Featured Tours */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tours nổi bật</Text>
          <Text style={styles.viewAll} onPress={handleViewAllTours}>
            Xem tất cả
          </Text>
        </View>

        {featuredTours.length > 0 ? (
          <View style={styles.toursList}>
            {featuredTours.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                onPress={() => handleTourPress(tour)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="Chưa có tour nổi bật"
            message="Các tour sẽ được cập nhật sớm"
            icon="🎫"
            actionLabel="Xem tất cả tours"
            onAction={handleViewAllTours}
          />
        )}
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
    paddingTop: 12,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  viewAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  toursList: {
    paddingHorizontal: 20,
  },
});
