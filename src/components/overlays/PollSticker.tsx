import React, { useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { PollSticker as PollStickerType } from '../../types/story';
import { PollOption } from '../stickers/PollOption';
import { calculatePollPercentages, hasUserVoted } from '../../utils/pollUtils';
import { usePollGestures } from '../../hooks/usePollGestures';

interface PollStickerProps {
  sticker: PollStickerType;
  editable?: boolean;
  isSelected?: boolean;
  onUpdate?: (updates: Partial<PollStickerType>) => void;
  onSelect?: () => void;
  onDelete?: () => void;
  onVote?: (optionId: string) => void;
}

/**
 * PollSticker is the modular overlay component for Instagram-style interactive polls.
 * Consumes Reanimated gestures for high-performance pan/pinch/rotate rendering.
 */
export const PollSticker: React.FC<PollStickerProps> = React.memo(({
  sticker,
  editable = true,
  isSelected = false,
  onUpdate,
  onSelect,
  onDelete,
  onVote,
}) => {
  // Use existing gestures hook
  const { translateX, translateY, scale, rotation, gesture } = usePollGestures({
    initialX: sticker.position.x,
    initialY: sticker.position.y,
    initialScale: sticker.scale,
    initialRotation: sticker.rotation,
    onSelect: onSelect || (() => {}),
    onUpdate: (updates) => {
      onUpdate?.({
        position: { x: updates.x, y: updates.y },
        scale: updates.scale,
        rotation: updates.rotation,
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  const percentages = useMemo(() =>
    calculatePollPercentages(sticker.options),
    [sticker.options]
  );

  const voted = hasUserVoted(sticker);

  const handleVote = useCallback((optionId: string) => {
    if (!voted && onVote) {
      onVote(optionId);
    }
  }, [voted, onVote]);

  const renderContent = () => (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        isSelected && styles.selectedBorder,
      ]}
    >
      <View style={styles.stickerCard}>
        <Text style={styles.questionText}>{sticker.question}</Text>
        <View style={styles.optionsContainer}>
          {sticker.options.map((option) => (
            <PollOption
              key={option.id}
              option={option}
              percentage={percentages[option.id]}
              selected={sticker.selectedOptionId === option.id}
              disabled={voted || editable}
              showResults={voted}
              onPress={() => handleVote(option.id)}
            />
          ))}
        </View>
      </View>

      {editable && isSelected && (
        <TouchableOpacity
          style={styles.deleteBadgeButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteBadgeText}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  if (editable) {
    return (
      <GestureDetector gesture={gesture}>
        {renderContent()}
      </GestureDetector>
    );
  }

  return renderContent();
});

PollSticker.displayName = 'PollSticker';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 99999,
    elevation: 99999,
    left: 0,
    top: 0,
    width: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  questionText: {
    color: 'black',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  optionsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderStyle: 'dashed',
    borderRadius: 18,
    padding: 2,
  },
  deleteBadgeButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  deleteBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
  },
});
