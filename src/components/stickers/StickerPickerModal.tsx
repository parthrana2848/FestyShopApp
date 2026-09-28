import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';
import { STICKERS, StickerAsset } from '../../constants/stickers';
import { StickerGrid } from './StickerGrid';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StickerPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: StickerAsset) => void;
}

/**
 * StickerPickerModal is a sliding bottom-sheet/modal dialog that houses
 * our virtualized list of sticker assets. Designed to match Instagram's styling
 * using modern dark themes, blur backing, and elegant safe-area padding.
 */
export const StickerPickerModal: React.FC<StickerPickerModalProps> = React.memo(({
  visible,
  onClose,
  onSelectSticker,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheetContainer} pointerEvents="auto">
          <SafeAreaView edges={['bottom']} style={styles.safeContainer}>
            <View style={styles.dragIndicator} />
            <View style={styles.header}>
              <Text style={styles.title}>Add Sticker</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gridContainer}>
              <StickerGrid
                stickers={STICKERS}
                onSelectSticker={onSelectSticker}
              />
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

StickerPickerModal.displayName = 'StickerPickerModal';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  safeContainer: {
    flex: 1,
  },
  dragIndicator: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#EBEBF5',
    fontSize: 12,
    fontWeight: '600',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
