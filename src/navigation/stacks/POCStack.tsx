import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import BottomSheetUXScreen from '../../screens/BottomSheetUXScreen';
import DribbbleFabScreen from '../../screens/DribbbleFabScreen';
import { POCStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<POCStackParamList>();

export const POCStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FabPreview" component={DribbbleFabScreen} options={{ title: 'FAB Preview' }} />
    <Stack.Screen name="BottomSheetUXScreen" component={BottomSheetUXScreen} options={{ title: 'Bottom Sheet UX Demo' }} />
  </Stack.Navigator>
);
