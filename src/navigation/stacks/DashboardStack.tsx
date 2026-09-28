import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../../screens/HomeScreen';
import { DashboardStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);
