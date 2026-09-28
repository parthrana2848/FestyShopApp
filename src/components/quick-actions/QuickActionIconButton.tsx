import React, { memo } from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import type { ReactNode } from 'react';

type Props = {
  onPress: () => void;
  icon?: ReactNode;
  size?: number;
  accessibilityLabel?: string;
  testID?: string;
};

function QuickActionIconButton({ onPress, icon, size = 40, accessibilityLabel, testID }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={styles.iconWrapper}>{icon ? icon : <Text style={styles.fallback}>•</Text>}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    fontSize: 18,
    color: '#111',
  },
});

export default memo(QuickActionIconButton);
