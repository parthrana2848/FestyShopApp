import React, { memo } from 'react';
import { Animated, TouchableOpacity, Text, View } from 'react-native';
import type { QuickActionsFABProps } from './quickActions.types';
import createStyles from './quickActions.styles';
import QuickActionBackdrop from './QuickActionBackdrop';
import QuickActionMenu from './QuickActionMenu';
import useQuickActions from '../../hooks/quick-actions/useQuickActions';
import { FAB_SIZE } from '../../constants/quick-actions/quickActions.constants';

const AnimatedView = Animated.View;

function QuickActionsFAB({ actions, color, onActionSelected, disabled }: QuickActionsFABProps) {
  // Use the orchestrating hook to manage state and animations
  const { isOpen, toggleMenu, closeMenu, handleActionPress, rotation, backdropOpacity, scale, translateY } =
    useQuickActions(actions, onActionSelected);

  const styles = createStyles(color);

  const rotate = rotation.value.interpolate ? rotation.value.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) : '0deg';

  const fabTransformStyle = { transform: [{ rotate }, { scale: scale.value }] } as any;

  return (
    <View style={styles.fabContainer} pointerEvents="box-none">
      <QuickActionBackdrop visible={isOpen} onRequestClose={closeMenu} backdropAnim={backdropOpacity.value} />

      <AnimatedView style={[styles.menuContainer, { transform: [{ translateY: translateY.value }], opacity: backdropOpacity.value }]}>
        <QuickActionMenu actions={actions} isOpen={isOpen} onRequestClose={closeMenu} onActionPress={handleActionPress} />
      </AnimatedView>

      <AnimatedView style={[styles.fab, fabTransformStyle]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={toggleMenu}
          accessibilityRole="button"
          accessibilityLabel={isOpen ? 'Close quick actions' : 'Open quick actions'}
          accessibilityHint="Opens a menu of quick actions"
          disabled={disabled}
          testID="quick-actions-fab">
          <Text style={{ color: '#fff', fontSize: 28, lineHeight: FAB_SIZE }}>{isOpen ? '×' : '+'}</Text>
        </TouchableOpacity>
      </AnimatedView>
    </View>
  );
}

export default memo(QuickActionsFAB);
