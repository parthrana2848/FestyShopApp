import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TEXT_ANIMATIONS } from '../../constants/textAnimations';
import type { TextAnimationType } from '../../types/story.types';

interface AnimationSelectorProps {
  selectedAnimation: TextAnimationType;
  onSelect: (animation: TextAnimationType) => void;
}

export const AnimationSelector: React.FC<AnimationSelectorProps> = React.memo(
  ({ selectedAnimation, onSelect }) => {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Animation</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {TEXT_ANIMATIONS.map((animation) => (
            <TouchableOpacity
              key={animation.id}
              style={[
                styles.button,
                selectedAnimation === animation.id && styles.selectedButton,
              ]}
              onPress={() => onSelect(animation.id)}
            >
              <Text style={styles.icon}>{animation.icon}</Text>
              <Text
                style={[
                  styles.text,
                  selectedAnimation === animation.id && styles.selectedText,
                ]}
              >
                {animation.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: 8,
  },
  label: {
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
  },
  scroll: {
    gap: 10,
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 84,
  },
  selectedButton: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  icon: {
    color: 'white',
    fontSize: 18,
    marginBottom: 4,
  },
  text: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  selectedText: {
    color: 'white',
    fontWeight: '700',
  },
});
