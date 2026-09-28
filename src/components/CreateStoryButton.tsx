import React from 'react';
import { TouchableOpacity, StyleSheet, Image, View } from 'react-native';

interface CreateStoryButtonProps {
  avatarUri: string;
  onPress: () => void;
}

export const CreateStoryButton = ({ avatarUri, onPress }: CreateStoryButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
      </View>
      <View style={styles.addButton}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828681.png' }}
          style={styles.addIcon}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: '#fff',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0095f6',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    width: 12,
    height: 12,
    tintColor: 'white',
  },
});
