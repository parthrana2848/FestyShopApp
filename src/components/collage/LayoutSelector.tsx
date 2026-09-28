import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CollageLayout } from '../../types/collage.types';

interface LayoutSelectorProps {
  layouts: CollageLayout[];
  selectedLayoutId: string;
  onSelectLayout: (layout: CollageLayout) => void;
}

export const LayoutSelector = React.memo(({
  layouts,
  selectedLayoutId,
  onSelectLayout,
}: LayoutSelectorProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Layout</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {layouts.map((layout) => {
          const isSelected = layout.id === selectedLayoutId;

          return (
            <TouchableOpacity
              key={layout.id}
              style={[
                styles.layoutCard,
                isSelected && styles.selectedLayoutCard,
              ]}
              onPress={() => onSelectLayout(layout)}
              activeOpacity={0.8}
            >
              {/* Miniature visual rendering of the layout slots */}
              <View style={styles.miniCanvas}>
                {layout.slots.map((slot, index) => (
                  <View
                    key={`${layout.id}-slot-${index}`}
                    style={[
                      styles.miniSlot,
                      {
                        left: `${slot.x}%`,
                        top: `${slot.y}%`,
                        width: `${slot.width}%`,
                        height: `${slot.height}%`,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.layoutName, isSelected && styles.selectedLayoutName]}>
                {layout.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

LayoutSelector.displayName = 'LayoutSelector';

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    width: '100%',
  },
  title: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 16,
    opacity: 0.6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  layoutCard: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#1c1c1e',
    borderWidth: 1.5,
    borderColor: 'transparent',
    width: 72,
  },
  selectedLayoutCard: {
    borderColor: '#0095f6', // Premium instagram blue select color
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
  },
  miniCanvas: {
    width: 44,
    height: 44,
    backgroundColor: '#2c2c2e',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  miniSlot: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: '#1c1c1e',
    backgroundColor: '#48484a',
  },
  layoutName: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  selectedLayoutName: {
    color: '#0095f6',
    fontWeight: '700',
  },
});
