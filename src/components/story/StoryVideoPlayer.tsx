import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { MediaToolkit } from 'react-native-media-toolkit';
import type { UserStory } from '../../types/story';

interface StoryVideoPlayerProps {
  story: UserStory;
  style?: object;
}

const isVideoUri = (uri: string) => /\.(mp4|mov|m4v|webm|avi|mpeg)$/i.test(uri);

export const StoryVideoPlayer: React.FC<StoryVideoPlayerProps> = React.memo(
  ({ story, style }) => {
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      let mounted = true;

      const buildPreview = async () => {
        if (!isVideoUri(story.uri)) {
          setPreviewUri(story.uri);
          return;
        }

        setLoading(true);
        try {
          const preview = await MediaToolkit.generateVideoPreview(story.uri, {
            durationMs: 3000,
            fps: 8,
            maxWidth: 720,
          });
          if (mounted && preview?.uri) {
            setPreviewUri(preview.uri);
          }
        } catch (error) {
          if (mounted) {
            setPreviewUri(story.uri);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      buildPreview();

      return () => {
        mounted = false;
      };
    }, [story.uri]);

    return (
      <View style={[styles.container, style]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Preparing video preview</Text>
          </View>
        ) : (
          <Image
            source={{ uri: previewUri || story.uri }}
            style={[styles.preview, style]}
            resizeMode="cover"
          />
        )}
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.label}>Video Story</Text>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    color: 'white',
  },
  overlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  label: {
    color: 'white',
    fontWeight: '700',
  },
});
