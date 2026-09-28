import React, { useEffect, useRef } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { Section } from '../../types/section';
import { getTitleStyle } from '../../utils/UIConfigs';
import { SectionCard } from './SectionCard';

interface BannerSectionProps {
  section: Section;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const BannerSection: React.FC<BannerSectionProps> = ({ section }) => {
  const { layoutConfig, items = [] } = section;

  if (!items.length) return null;

  // ✅ Layout Config with fallback
  const height = layoutConfig?.height ?? 160;
  const aspectRatio = layoutConfig?.aspectRatio ?? 16 / 9; // width:height = 2:1
  const spacing = layoutConfig?.itemSpacing ?? 20;
  const autoScroll = layoutConfig?.autoScroll ?? false;

  const isSingle = items.length === 1;
  // width based on aspect ratio
  const bannerWidth = isSingle
    ? SCREEN_WIDTH - 36 // match container padding
    : Math.min(SCREEN_WIDTH - 32, height * aspectRatio);

  const flatListRef = useRef<FlatList>(null);
  const currentIndex = useRef(0);

  // ✅ Auto Scroll (basic implementation)
  useEffect(() => {
    if (!autoScroll) return;

    const interval = setInterval(() => {
      if (!flatListRef.current) return;

      currentIndex.current = (currentIndex.current + 1) % items.length;

      flatListRef.current.scrollToIndex({
        index: currentIndex.current,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [autoScroll, items.length]);

  return (
    <View style={styles.container}>
      {section.title && (
        <Text style={getTitleStyle(section.layoutConfig)}>{section.title}</Text>
      )}

      <FlatList
        ref={flatListRef}
        style={{ paddingLeft: 16 }}
        data={items}
        keyExtractor={(item, index) => item._id || index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={bannerWidth + spacing}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <View style={{ marginRight: spacing }}>
            <SectionCard
              item={item}
              width={bannerWidth}
              height={height}
              borderRadius={16}
              showTitle={false}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  listContent: {
    // paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#121212',
    marginBottom: 16,
  },
});
