import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FONT_PRESETS } from '../../constants/fontPresets';

interface FontPresetSelectorProps {
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
}

export const FontPresetSelector: React.FC<FontPresetSelectorProps> = ({
  activePresetId,
  onSelectPreset,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {FONT_PRESETS.map((preset) => {
          const isActive = preset.id === activePresetId;
          return (
            <TouchableOpacity
              key={preset.id}
              style={[styles.presetButton, isActive && styles.activeButton]}
              onPress={() => onSelectPreset(preset.id)}
            >
              <Text style={[styles.presetText, isActive && styles.activeText]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activeButton: {
    backgroundColor: 'white',
  },
  presetText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeText: {
    color: 'black',
  },
});
