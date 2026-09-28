import React, { memo } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import type { QuickActionMenuItemProps } from './quickActions.types';
import createStyles from './quickActions.styles';

function QuickActionMenuItem({ action, onPress, index }: QuickActionMenuItemProps) {
  const styles = createStyles();

  return (
    <Animated.View style={styles.menuItemWrapper}>
      <TouchableOpacity
        style={styles.menuItemButton}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={action.accessibleLabel ?? action.label}
        accessibilityHint={`Quick action: ${action.label}`}
        testID={action.testID ?? `quick-action-${action.id}`}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {action.icon}
          <Text style={styles.menuItemLabel}>{action.label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default memo(QuickActionMenuItem);
