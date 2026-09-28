import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StoryTextItem } from '../../types/story';

interface TextToolbarProps {
  textItem: StoryTextItem | null;
  onUpdate: (updates: Partial<StoryTextItem>) => void;
}

const COLORS = ['#FFFFFF', '#000000', '#FF3B30', '#34C759', '#007AFF', '#FF9500', '#AF52DE'];

export const TextToolbar: React.FC<TextToolbarProps> = ({ textItem, onUpdate }) => {
  if (!textItem) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={[styles.toolBtn, textItem.textAlign === 'left' && styles.activeToolBtn]}
          onPress={() => onUpdate({ textAlign: 'left' })}
        >
          <Text style={styles.toolText}>L</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolBtn, textItem.textAlign === 'center' && styles.activeToolBtn]}
          onPress={() => onUpdate({ textAlign: 'center' })}
        >
          <Text style={styles.toolText}>C</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolBtn, textItem.textAlign === 'right' && styles.activeToolBtn]}
          onPress={() => onUpdate({ textAlign: 'right' })}
        >
          <Text style={styles.toolText}>R</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={[styles.toolBtn, textItem.backgroundEnabled && styles.activeToolBtn]}
          onPress={() => onUpdate({ backgroundEnabled: !textItem.backgroundEnabled })}
        >
          <Text style={styles.toolText}>A</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorScroll}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorBubble, { backgroundColor: color }, textItem.color === color && styles.activeColor]}
            onPress={() => onUpdate({ color, backgroundColor: color === '#FFFFFF' ? '#000000' : '#FFFFFF' })}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 15,
  },
  toolBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeToolBtn: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  toolText: {
    color: 'white',
    fontWeight: 'bold',
  },
  separator: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginHorizontal: 5,
  },
  colorScroll: {
    paddingHorizontal: 15,
    gap: 10,
  },
  colorBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeColor: {
    borderColor: 'white',
  },
});
