import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
};

const EMOJIS = ['❤️', '👍', '😂', '😍', '😮', '😢'];

export const ReactionPickerModal = ({ visible, onClose, onSelect }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>React</Text>
          <View style={styles.emojisRow}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={styles.emojiButton}
                onPress={() => {
                  onSelect(e);
                  onClose();
                }}
              >
                <Text style={styles.emoji}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    minWidth: 260,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emojisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  emojiButton: {
    padding: 8,
    flex: 1,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  closeButton: {
    marginTop: 12,
  },
  closeText: {
    color: '#0A84FF',
    fontWeight: '600',
  },
});
