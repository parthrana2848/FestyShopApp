import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ChatListScreen } from '../../features/chat/screens/ChatListScreen';
import { ChatScreen } from '../../features/chat/screens/ChatScreen';
import { CommunicationStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<CommunicationStackParamList>();

export const CommunicationStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);
