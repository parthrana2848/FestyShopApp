import React from 'react';
import {  StyleSheet, Text, View } from 'react-native';
import DribbbleFAB from '../components/dribbble-fab/DribbbleFab';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {};

const DribbbleFabScreen: React.FC<Props> = () => {
  const handleAction = (actionId: string) => {
    // Placeholder: in real use, navigate or open creation flows
    // Keep minimal for demo purposes
    // eslint-disable-next-line no-console
    console.log('FAB action pressed:', actionId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Dribbble FAB Preview</Text>
        <Text style={styles.sub}>Tap the FAB to open the Bento action panel.</Text>
      </View>

      <DribbbleFAB onActionPress={handleAction} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  sub: { color: '#666' },
});

export default DribbbleFabScreen;
