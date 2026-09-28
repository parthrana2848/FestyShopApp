import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { gifService } from '../../services/gif/gif.service';
import { NormalizedGif } from '../../types/gif.types';
import { GIF_CONSTANTS } from '../../constants/gif.constants';

const { width, height } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / GIF_CONSTANTS.GIF_GRID_COLUMNS;

/**
 * High-performance standalone TypeScript debounce function to avoid package typings issues.
 */
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: any = null;
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

interface GifPickerModalProps {
  /** Visibility state of the modal picker window. */
  visible: boolean;
  /** Callback triggered when the modal is requested to close. */
  onClose: () => void;
  /** Callback triggered when a sticker GIF is tapped. Returns normalized sticker URL model. */
  onSelectGif: (gif: NormalizedGif) => void;
}

// Recommended quick filter category pills
const CATEGORIES = ['🔥 Trending', '❤️ Love', '😂 Lol', '🎉 Party', '😢 Cry', '😲 Omg', '😡 Angry', '✨ Sparkles'];

/**
 * Optimized Grid Item Cell rendering single GIF thumbnail.
 * Fully memoized to avoid redundant renders as scroll offsets update.
 */
const GifGridItem = React.memo(({ item, onPress }: { item: NormalizedGif; onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={styles.gridItem}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <FastImage
        source={{
          uri: item.previewUrl,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
        style={styles.gifImage}
        resizeMode={FastImage.resizeMode.contain}
      />
    </TouchableOpacity>
  );
});

GifGridItem.displayName = 'GifGridItem';

/**
 * GifPickerModal allows the user to browse trending animated stickers,
 * search GIPHY using a debounced input, and filter by popular reactions.
 * Features optimized infinite-scroll pagination and lightweight virtualization.
 */
export const GifPickerModal: React.FC<GifPickerModalProps> = React.memo(({
  visible,
  onClose,
  onSelectGif,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('🔥 Trending');
  const [gifs, setGifs] = useState<NormalizedGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const searchInputRef = useRef<TextInput>(null);

  // Debounced search logic to prevent spamming API requests
  const performSearch = useCallback(
    debounce(async (searchQuery: string, currentCategory: string) => {
      setIsLoading(true);
      setOffset(0);
      setHasMore(true);

      const actualQuery = searchQuery || (currentCategory === '🔥 Trending' ? '' : currentCategory.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim());
      
      const results = await gifService.searchGifs(actualQuery, 0);
      setGifs(results);
      setOffset(results.length);
      if (results.length < GIF_CONSTANTS.GIF_PAGE_LIMIT) {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 450),
    []
  );

  // Re-run search whenever query or category pill updates
  useEffect(() => {
    if (visible) {
      performSearch(query, selectedCategory);
    }
  }, [query, selectedCategory, visible, performSearch]);

  const handleLoadMore = async () => {
    if (isMoreLoading || !hasMore || isLoading) return;
    setIsMoreLoading(true);

    const actualQuery = query || (selectedCategory === '🔥 Trending' ? '' : selectedCategory.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim());
    const nextResults = await gifService.searchGifs(actualQuery, offset);

    if (nextResults.length > 0) {
      setGifs(prev => [...prev, ...nextResults]);
      setOffset(prev => prev + nextResults.length);
    } else {
      setHasMore(false);
    }
    setIsMoreLoading(false);
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setQuery('');
    searchInputRef.current?.clear();
  };

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const renderFooter = () => {
    if (!isMoreLoading) return <View style={styles.footerSpacing} />;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.backdrop} pointerEvents="box-none">
        <View style={styles.modalContainer}>
          {/* Header handle for aesthetic drag closing feel */}
          <View style={styles.headerIndicator} />
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>GIF Stickers</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search box */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search GIFs..."
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>

          {/* Quick Reaction Pill categories */}
          <View style={styles.categoryContainer}>
            <FlatList
              data={CATEGORIES}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const isActive = item === selectedCategory && !query;
                return (
                  <TouchableOpacity
                    style={[styles.categoryPill, isActive && styles.activePill]}
                    onPress={() => handleSelectCategory(item)}
                  >
                    <Text style={[styles.categoryPillText, isActive && styles.activePillText]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.categoryList}
            />
          </View>

          {/* GIF Stickers Grid View */}
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          ) : (
            <FlatList
              data={gifs}
              numColumns={GIF_CONSTANTS.GIF_GRID_COLUMNS}
              keyExtractor={(item, index) => `${item.id}_${index}`}
              renderItem={({ item }) => (
                <GifGridItem
                  item={item}
                  onPress={() => onSelectGif(item)}
                />
              )}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.4}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={
                <View style={styles.centerContainer}>
                  <Text style={styles.emptyText}>No stickers found</Text>
                </View>
              }
              contentContainerStyle={styles.gridContainer}
              // Performance optimizations
              removeClippedSubviews={true}
              maxToRenderPerBatch={12}
              windowSize={5}
              initialNumToRender={12}
              getItemLayout={(_, index) => ({
                length: COLUMN_WIDTH,
                offset: COLUMN_WIDTH * Math.floor(index / GIF_CONSTANTS.GIF_GRID_COLUMNS),
                index,
              })}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
});

GifPickerModal.displayName = 'GifPickerModal';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: height * 0.75,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 20,
  },
  headerIndicator: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 46,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    padding: 0, // Reset default padding
  },
  categoryContainer: {
    marginBottom: 10,
  },
  categoryList: {
    paddingHorizontal: 15,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  activePill: {
    backgroundColor: '#FFFFFF',
  },
  categoryPillText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
    fontSize: 13,
  },
  activePillText: {
    color: '#000000',
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 15,
    fontWeight: '600',
  },
  gridContainer: {
    paddingHorizontal: 15,
    paddingBottom: 40,
  },
  gridItem: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gifImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  loaderContainer: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  footerSpacing: {
    height: 20,
  },
});
