import React, { useCallback, useEffect, useState } from 'react';
import { LegendList } from '@legendapp/list';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import SectionRenderer from '../components/home/SectionRenderer';
import { useSectionsQuery } from '../hooks/useSections';
import { Section } from '../types/section';
import { useHideTabBarOnScroll } from '../hooks/useHideTabBarOnScroll';
import { useLogout } from '../hooks/authHooks';
import { useVideoCall } from '../modules/video-call/hooks/useVideoCall';

/**
 * Filter and sort sections
 */
const filterAndSortSections = (sections: Section[] = []): Section[] => {
  return sections
    .filter(section => section.isActive && section.status === 'published')
    .sort((a, b) => {
      /**
       * Sort by displayOrder ASC
       */
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }

      /**
       * Higher priority first
       */
      return b.priority - a.priority;
    });
};

/**
 * Empty state component
 */
const renderEmptyComponent = () => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No content available right now.</Text>
    </View>
  );
};

export default function HomeScreen() {
  const onScroll = useHideTabBarOnScroll();
  const { initiateCall } = useVideoCall();

  // =====================================================
  // ✅ Pagination States
  // =====================================================
  const PAGE_LIMIT = 10;
  const [page, setPage] = useState(1);
  const [sections, setSections] = useState<Section[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /**
   * Prevent duplicate pagination calls
   */
  const [
    onEndReachedCalledDuringMomentum,
    setOnEndReachedCalledDuringMomentum,
  ] = useState(false);

  // =====================================================
  // ✅ Fetch Sections
  // =====================================================
  const {
    data,
    isLoading: sectionsLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useSectionsQuery({
    page,
    limit: PAGE_LIMIT,
  });

  // =====================================================
  // ✅ Update Local Sections
  // =====================================================
  useEffect(() => {
    if (!data?.data) {
      return;
    }

    /**
     * Process incoming sections
     */
    const processedSections = filterAndSortSections(data.data);

    /**
     * Replace first page
     */
    if (page === 1) {
      setSections(processedSections);
    } else {
      /**
       * Append paginated data
       */
      setSections(prev => {
        const combined = [...prev, ...processedSections];

        /**
         * Remove duplicates
         */
        return combined.filter(
          (item, index, self) =>
            index === self.findIndex(t => t._id === item._id),
        );
      });
    }

    /**
     * Check if more data exists
     */
    setHasMore(processedSections.length >= PAGE_LIMIT);

    /**
     * Stop loader
     */
    setLoadingMore(false);
  }, [data, page]);

  // =====================================================
  // ✅ Infinite Scroll Handler
  // =====================================================
  const handleLoadMore = useCallback(() => {
    /**
     * Prevent duplicate calls
     */
    if (
      loadingMore ||
      sectionsLoading ||
      !hasMore ||
      onEndReachedCalledDuringMomentum
    ) {
      return;
    }

    setOnEndReachedCalledDuringMomentum(true);
    setLoadingMore(true);
    setPage(prev => prev + 1);
  }, [hasMore, loadingMore, onEndReachedCalledDuringMomentum, sectionsLoading]);

  // =====================================================
  // ✅ Pull To Refresh
  // =====================================================
  const handleRefresh = async () => {
    try {
      setPage(1);
      setHasMore(true);
      await refetch();
    } catch (refreshError) {
      console.log('Refresh Error:', refreshError);
    }
  };

  // =====================================================
  // ✅ Render Section
  // =====================================================
  const renderSection = useCallback(({ item }: { item: Section }) => {
    return <SectionRenderer section={item} />;
  }, []);

  // =====================================================
  // ✅ Infinite Scroll Loader
  // =====================================================
  const renderListFooter = () => {
    return (
      <>
        {loadingMore ? (
          <View style={styles.footerLoaderContainer}>
            <ActivityIndicator size="small" color="#0a84ff" />
            <Text style={styles.loadingText}>Loading more content...</Text>
          </View>
        ) : null}

        {/* Spacer so last item can scroll into the area beneath the tab bar */}
        <View style={{ height: 120 }} />
      </>
    );
  };

  // =====================================================
  // ✅ Initial Loading
  // =====================================================
  if (sectionsLoading && page === 1 && !isRefetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a84ff" />
      </View>
    );
  }

  // =====================================================
  // ✅ Error State
  // =====================================================
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error?.message || 'Failed to load home screen content'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =====================================================
  // ✅ Main Screen
  // =====================================================
  return (
    <View style={styles.container}>
      <LegendList
        data={sections}
        onScroll={onScroll}
        renderItem={renderSection}
        keyExtractor={item => item._id}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#0a84ff"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        onMomentumScrollBegin={() => {
          setOnEndReachedCalledDuringMomentum(false);
        }}
        recycleItems
        estimatedItemSize={300}
        drawDistance={1000}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#d9534f',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0a84ff',
    borderRadius: 8,
    marginBottom: 32,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  footerLoaderContainer: {
    paddingVertical: 20,
    paddingBottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});
