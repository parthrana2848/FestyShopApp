import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ProfileStackParamList } from '../../types/navigation';
import ProfileScreen from '../../screens/ProfileScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile', headerShown: true }} />
  </Stack.Navigator>
);
