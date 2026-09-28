import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'BottomSheetUXScreen'>;

// Action items for the bottom sheet
interface ActionItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

const actions: ActionItem[] = [
  {
    id: 'create-note',
    title: 'Create Note',
    icon: '📝',
    color: '#007AFF',
    backgroundColor: '#E8F4FD',
  },
  {
    id: 'upload-photo',
    title: 'Upload Photo',
    icon: '📷',
    color: '#34C759',
    backgroundColor: '#E8F5EA',
  },
  {
    id: 'scan-document',
    title: 'Scan Document',
    icon: '📄',
    color: '#FF9500',
    backgroundColor: '#FFF3E0',
  },
  {
    id: 'voice-memo',
    title: 'Voice Memo',
    icon: '🎙️',
    color: '#FF3B30',
    backgroundColor: '#FFEBEA',
  },
];

// Generate placeholder content for scrollable area
const generatePlaceholderContent = () => {
  const items = [];
  for (let i = 1; i <= 20; i++) {
    items.push({
      id: `item-${i}`,
      title: `Content Item ${i}`,
      description: `This is a placeholder description for item ${i}. It demonstrates scrollable content in the background.`,
    });
  }
  return items;
};

export const BottomSheetUXScreen: React.FC<Props> = ({ navigation }) => {
  // Bottom Sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points - approximately 35% of screen height
  const snapPoints = useMemo(() => [Math.round(SCREEN_HEIGHT * 0.35)], []);

  // Generate placeholder content
  const placeholderContent = useMemo(() => generatePlaceholderContent(), []);

  // Handle FAB press
  const handleFABPress = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  // Handle action selection
  const handleActionPress = useCallback((actionId: string, actionTitle: string) => {
    console.log(`Selected action: ${actionTitle} (${actionId})`);
    // Close the bottom sheet after action selection
    bottomSheetRef.current?.close();
  }, []);

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  // Render action item
  const renderActionItem = useCallback(({ item }: { item: ActionItem }) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.actionItem, { backgroundColor: item.backgroundColor }]}
      onPress={() => handleActionPress(item.id, item.title)}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIcon, { backgroundColor: item.color }]}>
        <Text style={styles.actionIconText}>{item.icon}</Text>
      </View>
      <Text style={[styles.actionTitle, { color: item.color }]}>{item.title}</Text>
    </TouchableOpacity>
  ), [handleActionPress]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea}>
        {/* Background Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.screenTitle}>Bottom Sheet UX Demo</Text>
          
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {placeholderContent.map((item) => (
              <View key={item.id} style={styles.contentItem}>
                <Text style={styles.contentTitle}>{item.title}</Text>
                <Text style={styles.contentDescription}>{item.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleFABPress}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1} // Start closed
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose={true}
          handleIndicatorStyle={styles.handleIndicator}
          backgroundStyle={styles.bottomSheetBackground}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Quick Actions</Text>
            
            <View style={styles.actionsGrid}>
              {actions.map((action) => renderActionItem({ item: action }))}
            </View>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for FAB
  },
  contentItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  handleIndicator: {
    backgroundColor: '#D1D1D6',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 24,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingBottom: 70,
  },
  actionItem: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BottomSheetUXScreen;