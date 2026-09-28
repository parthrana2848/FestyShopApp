import React, { memo, useMemo } from 'react';
import { Animated, View } from 'react-native';
import type { QuickActionMenuProps } from './quickActions.types';
import createStyles from './quickActions.styles';
import QuickActionMenuItem from './QuickActionMenuItem';

// Menu is render-only; animations are controlled by the host hook. We accept
// that the host will animate the container via transform/opacity styles.
function QuickActionMenu({ actions, isOpen, onRequestClose, onActionPress }: QuickActionMenuProps) {
  const styles = useMemo(() => createStyles(), []);

  return (
    <View pointerEvents={isOpen ? 'auto' : 'none'} style={styles.menuContainer}>
      {actions.map((action, idx) => (
        <QuickActionMenuItem key={action.id} action={action} index={idx} onPress={() => onActionPress(action)} />
      ))}
    </View>
  );
}

export default memo(QuickActionMenu);
