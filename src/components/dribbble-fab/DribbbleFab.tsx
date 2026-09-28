import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

type Action = {
  id: string;
  label: string;
  emoji: string;
};

type Props = {
  onActionPress: (actionId: string) => void;
  actions?: Action[];
  size?: number;
  panelWidth?: number;
  style?: ViewStyle;
};

export const DribbbleFAB: React.FC<Props> = ({
  onActionPress,
  actions,
  size = 64,
  panelWidth,
  style,
}) => {
  const defaultActions: Action[] = useMemo(
    () => [
      {id: 'note', label: 'Note', emoji: '📝'},
      {id: 'expense', label: 'Expense', emoji: '💰'},
      {id: 'lead', label: 'Lead', emoji: '👤'},
      {id: 'task', label: 'Task', emoji: '✅'},
    ],
    [],
  );

  const items = actions && actions.length === 4 ? actions : defaultActions;

  const screen = Dimensions.get('window');
  // Make the panel expand to full width (with side margins) when opened.
  const horizontalMargin = 20 * 2; // left + right margins
  const computedPanelWidth = panelWidth ?? Math.max(320, screen.width - horizontalMargin);
  // panel open state (declare before any computed values that reference it)
  const [open, setOpen] = useState(false);

  // panelHeight is based on the width we will render; when open we use full screen width
  const panelHeight = (open ? screen.width : computedPanelWidth) * 0.5; // slightly wider layout for 2x2 grid
  // derived width used for transforms (must be numeric)
  const derivedPanelWidth = open ? screen.width : computedPanelWidth;

  const openAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const tileAnims = useRef(items.map(() => new Animated.Value(0))).current;

  const rotation = openAnim.interpolate({inputRange: [0, 1], outputRange: ['0deg', '45deg']});
  const panelScale = openAnim.interpolate({inputRange: [0, 1], outputRange: [0.0001, 1]});
  const panelTranslateY = openAnim.interpolate({inputRange: [0, 1], outputRange: [20, 0]});
  // FAB transforms: move the FAB up to the top edge of the opened panel and slightly scale down
  const fabTranslateY = openAnim.interpolate({
    inputRange: [0, 1],
    // pull the FAB up toward the top region of the opened panel but leave it slightly below the top edge
    outputRange: [0, -(panelHeight - size / 2 - 8) + 32],
  });
  const fabScale = openAnim.interpolate({inputRange: [0, 1], outputRange: [1, 0.88]});
  // small horizontal nudge so the circular FAB sits flush against the white panel edge
  const fabTranslateX = openAnim.interpolate({inputRange: [0, 1], outputRange: [0, 8]});

  const openSequence = useCallback(() => {
    Animated.parallel([
      Animated.timing(openAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.46,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      const tileAnimsSequence = items.map((_, i) =>
        Animated.timing(tileAnims[i], {
          toValue: 1,
          duration: 220,
          delay: i * 60,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      );
      Animated.stagger(60, tileAnimsSequence).start();
    });
  }, [backdropOpacity, openAnim, tileAnims, items]);

  // Close animation sequence. Accepts optional callback that's invoked after animations complete.
  const closeSequence = useCallback(
    (onComplete?: () => void) => {
      const tileReverse = items
        .map((_, i) =>
          Animated.timing(tileAnims[i], {
            toValue: 0,
            duration: 140,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        )
        .reverse();

      Animated.sequence([
        Animated.stagger(40, tileReverse),
        Animated.parallel([
          Animated.timing(openAnim, {
            toValue: 0,
            duration: 260,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 0,
            duration: 260,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (onComplete) onComplete();
      });
    },
    [items, openAnim, tileAnims, backdropOpacity],
  );

  const toggleOpen = useCallback(() => {
    if (open) {
      // run close animation first, then update state so layout (left/right) flips after animation
      closeSequence(() => setOpen(false));
    } else {
      setOpen(true);
      openSequence();
    }
  }, [open, closeSequence, openSequence]);

  const handleBackdropPress = useCallback(() => {
    if (open) toggleOpen();
  }, [open, toggleOpen]);

  useEffect(() => {
    return () => {
      openAnim.stopAnimation();
      tileAnims.forEach(t => t.stopAnimation());
      backdropOpacity.stopAnimation();
    };
  }, [openAnim, tileAnims, backdropOpacity]);

  const renderTile = (action: Action, index: number) => {
    const anim = tileAnims[index];
    const translateY = anim.interpolate({inputRange: [0, 1], outputRange: [8, 0]});
    const opacity = anim;

    return (
      <Animated.View key={action.id} style={[styles.tileWrapper, {transform: [{translateY}], opacity}]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            // Close with animation, then set state and finally call callback
            closeSequence(() => {
              setOpen(false);
              setTimeout(() => onActionPress(action.id), 80);
            });
          }}
          style={({pressed}) => [styles.tile, pressed && styles.tilePressed]}
        >
          <Text style={styles.tileEmoji}>{action.emoji}</Text>
          <Text style={styles.tileLabel}>{action.label}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const panelTransform = [
    // translate pivot to bottom-right of actual rendered width
    {translateX: derivedPanelWidth},
    {translateY: panelHeight},
    {scale: panelScale},
    {translateX: -derivedPanelWidth},
    {translateY: -panelHeight},
    {translateY: panelTranslateY},
  ];

  // compute container styles so when open the panel can be flush to screen edges
  const panelContainerDynamic = open
    ? {left: 0, right: 0, bottom: 0}
    : {left: 20, right: 20, bottom: 20 + size / 2 + 8};

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <Animated.View pointerEvents={open ? 'auto' : 'none'} style={[styles.backdrop, {opacity: backdropOpacity}]}> 
        {open && (
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
        )}
      </Animated.View>

      <View
        pointerEvents={open ? 'box-none' : 'none'}
        style={[styles.panelContainer, {height: panelHeight, ...panelContainerDynamic}]}> 
        <Animated.View
          style={[
            styles.panel,
            {
              width: open ? screen.width : computedPanelWidth,
              height: panelHeight,
              transform: panelTransform,
              // when open make bottom radius zero so white background fits screen bottom
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              borderBottomLeftRadius: open ? 0 : 14,
              borderBottomRightRadius: open ? 0 : 14,
            },
          ]}> 
          <View style={styles.grid}>
            <View style={styles.row}>
              {renderTile(items[0], 0)}
              {renderTile(items[1], 1)}
            </View>
            <View style={styles.row}>
              {renderTile(items[2], 2)}
              {renderTile(items[3], 3)}
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.fabContainer,
          {right: open ? 0 : 20, bottom: 20, transform: [{translateX: fabTranslateX}, {translateY: fabTranslateY}, {scale: fabScale}]},
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={toggleOpen}
          style={({pressed}) => [
            styles.fab,
            {width: size, height: size, borderRadius: size / 2},
            pressed && styles.fabPressed,
          ]}
        >
          <Animated.View style={{transform: [{rotate: rotation}]}}>
            <Text style={styles.plus}>+</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // ...StyleSheet.absoluteFill,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
  },
  panelContainer: {
    position: 'absolute',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  panel: {
    backgroundColor: 'skyblue',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 12,
  },
  grid: { flex: 1, justifyContent: 'space-between' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  tileWrapper: { flex: 1, margin: 6, flexBasis: 0 },
  tile: {
    backgroundColor: 'skyblue',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    flexShrink: 0,
  },
  tilePressed: { opacity: 0.85 },
  tileEmoji: { fontSize: 22 },
  tileLabel: { marginTop: 6, fontSize: 13, color: '#222' },
  fabContainer: { position: 'absolute' },
  fab: { backgroundColor: '#FF5A5F', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.12, shadowRadius: 18, elevation: 10 },
  fabPressed: { opacity: 0.9 },
  plus: { color: 'white', fontSize: 30, lineHeight: 30, fontWeight: '700' },
});

export default DribbbleFAB;
