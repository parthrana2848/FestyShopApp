// import React, { useMemo } from 'react';
// import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
// import { Section } from '../../types/section';
// import { getTitleStyle } from '../../utils/UIConfigs';
// import { SectionCard } from './SectionCard';

// interface HorizontalListSectionProps {
//   section: Section;
// }

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// export const HorizontalListSection: React.FC<HorizontalListSectionProps> = ({
//   section,
// }) => {
//   const { layoutConfig, items = [] } = section;

//   if (!items.length) return null;

//   // ✅ LayoutConfig with fallback
//   const visibleItems = layoutConfig?.visibleItems ?? 2.5;
//   const spacing = layoutConfig?.itemSpacing ?? 12;
//   const threshold = layoutConfig?.threshold ?? items.length;

//   // ✅ Apply threshold
//   const data = items.slice(0, threshold);

//   // ✅ Calculate dynamic item width
//   const itemWidth = useMemo(() => {
//     const horizontalPadding = 32; // 16 + 16
//     const totalSpacing = (visibleItems - 1) * spacing;

//     const availableWidth = SCREEN_WIDTH - horizontalPadding - totalSpacing;

//     return availableWidth / visibleItems;
//   }, [visibleItems, spacing]);

//   console.log(
//     `HorizontalList → items: ${data.length}, visibleItems: ${visibleItems}, spacing: ${spacing}`,
//   );

//   return (
//     <View style={styles.container}>
//       {section.title && (
//         <Text style={getTitleStyle(section.layoutConfig)}>{section.title}</Text>
//       )}

//       <FlatList
//         data={data}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item, index) => item._id || index.toString()}
//         contentContainerStyle={styles.listContent}
//         snapToInterval={itemWidth + spacing}
//         decelerationRate="fast"
//         renderItem={({ item }) => (
//           <View style={{ marginRight: spacing }}>
//             <SectionCard
//               item={item}
//               width={itemWidth}
//               height={itemWidth * 1.3} // maintain card ratio
//               borderRadius={8}
//             />
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginVertical: 16,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     marginBottom: 12,
//     paddingHorizontal: 16,
//   },
//   listContent: {
//     paddingHorizontal: 16,
//   },
// });

import React from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';

import { Section } from '../../types/section';
import { getTitleStyle } from '../../utils/UIConfigs';
import { SectionCard } from './SectionCard';

interface HorizontalListSectionProps {
  section: Section;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const calculateItemWidth = (
  visibleItems: number,
  spacing: number,
): number => {
  const horizontalPadding = 32; // 16 + 16
  const totalSpacing = (visibleItems - 1) * spacing;

  const availableWidth =
    SCREEN_WIDTH - horizontalPadding - totalSpacing;

  return availableWidth / visibleItems;
};

export function HorizontalListSection({
  section,
}: HorizontalListSectionProps) {
  const { layoutConfig, items = [] } = section;

  // Early return
  if (!items.length) {
    return null;
  }

  /**
   * Layout configuration with fallback values
   */
  const visibleItems = layoutConfig?.visibleItems ?? 2.5;
  const spacing = layoutConfig?.itemSpacing ?? 12;
  const threshold = layoutConfig?.threshold ?? items.length;

  /**
   * Apply threshold limit
   */
  const data = items.slice(0, threshold);

  /**
   * Dynamic item width calculation
   */
  const itemWidth = calculateItemWidth(
    visibleItems,
    spacing,
  );

  const renderItem = ({
    item,
  }: {
    item: (typeof data)[0];
  }) => {
    return (
      <View style={[styles.itemContainer, { marginRight: spacing }]}>
        <SectionCard
          item={item}
          width={itemWidth}
          height={itemWidth * 1.3}
          borderRadius={8}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {section.title ? (
        <Text style={getTitleStyle(layoutConfig)}>
          {section.title}
        </Text>
      ) : null}

      <FlatList
        horizontal
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item._id || index.toString()
        }
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={itemWidth + spacing}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  itemContainer: {
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 16,
  },
});