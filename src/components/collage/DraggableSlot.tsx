import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SlotPixelBounds } from '../../utils/collage.utils';

interface DraggableSlotProps {
  bounds: SlotPixelBounds;
  onPressPlaceholder?: () => void;
  isEmpty?: boolean;
}

export const DraggableSlot = React.memo(({
  bounds,
  onPressPlaceholder,
  isEmpty = false,
}: DraggableSlotProps) => {
  return (
    <View
      style={[
        styles.container,
        {
          left: bounds.x,
          top: bounds.y,
          width: bounds.width,
          height: bounds.height,
        },
      ]}
    >
      {isEmpty ? (
        <TouchableOpacity
          style={styles.placeholderButton}
          onPress={onPressPlaceholder}
          activeOpacity={0.7}
        >
          <View style={styles.dottedOutline}>
            <Text style={styles.plusText}>+</Text>
            <Text style={styles.addText}>Add Image</Text>
          </View>
        </TouchableOpacity>
      ) : (
        // Renders the background shadow / slot identifier
        <View style={styles.slotBackground} />
      )}
    </View>
  );
});

DraggableSlot.displayName = 'DraggableSlot';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    padding: 1, // Visual spacer between slots
  },
  slotBackground: {
    flex: 1,
    backgroundColor: '#121212', // Pure dark background for structural separation
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  placeholderButton: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    borderRadius: 4,
    padding: 6,
  },
  dottedOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    color: '#0095f6',
    fontSize: 28,
    fontWeight: '300',
    marginBottom: 4,
  },
  addText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '500',
  },
});
