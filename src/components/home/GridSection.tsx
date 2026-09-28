import React, { useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Section } from '../../types/section';
import { getTitleStyle } from '../../utils/UIConfigs';
import { SectionCard } from './SectionCard';

interface GridSectionProps {
  section: Section;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GridSection: React.FC<GridSectionProps> = ({ section }) => {
  const { layoutConfig, items = [] } = section;

  if (!items.length) return null;

  // ✅ Dynamic config
  const columns = layoutConfig?.columns ?? 2;
  const spacing = layoutConfig?.itemSpacing ?? 8;
  const threshold = layoutConfig?.threshold ?? items.length;

  // ✅ Apply threshold
  const visibleItems = items.slice(0, threshold);

  // ✅ Memoized width calculation
  const itemWidth = useMemo(() => {
    const totalSpacing = (columns - 1) * spacing;
    const horizontalPadding = 32; // 16 + 16
    const availableWidth = SCREEN_WIDTH - horizontalPadding - totalSpacing;
    return Math.floor(availableWidth / columns);
  }, [columns, spacing]);

  // ✅ Render Item
  const renderItem = ({ item, index }: any) => {
    const isLastInRow = (index + 1) % columns === 0;

    return (
      <View
        style={{
          width: itemWidth,
          marginRight: isLastInRow ? 0 : spacing,
          marginBottom: spacing,
        }}
      >
        <SectionCard
          item={item}
          width={itemWidth}
          height={itemWidth}
          borderRadius={itemWidth / 2}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {section.title && (
        <Text
          style={getTitleStyle(section.layoutConfig)}
        >
          {section.title}
        </Text>
      )}

      <FlatList
        data={visibleItems}
        style={{ paddingHorizontal: 16 }}
        key={columns} // ✅ important when columns change dynamically
        numColumns={columns}
        renderItem={renderItem}
        keyExtractor={(item, index) => item._id || index.toString()}
        scrollEnabled={false} // ✅ important if inside ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
});