import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import OnlineUsersScreen from '../screens/OnlineUsersScreen';
import { MainTabNavigator } from './tabs/MainTabNavigator';
import { EcommerceStack } from './stacks/EcommerceStack';
import { StoryStack } from './stacks/StoryStack';
import { ProductivityStack } from './stacks/ProductivityStack';
import { CommunicationStack } from './stacks/CommunicationStack';
import { CallsStack } from './stacks/CallsStack';
import { POCStack } from './stacks/POCStack';
import { MainStackParamList } from '../types/navigation';
import { QuickActionsFAB } from '../components/quick-actions';
import { defaultQuickActions } from '../config/quick-actions/quickActions.config';
import { useQuickActionsNavigation } from './helpers/quickActionsNavigation.helper';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator = () => {
  const { resolveAndNavigate } = useQuickActionsNavigation();

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {/* Main Tab Navigator */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />

        {/* Secondary Flows Stack Navigators mapped for compatibility */}
        <Stack.Screen name="Commerce" component={EcommerceStack} options={{ headerShown: false }} />
        <Stack.Screen name="Stories" component={StoryStack} options={{ headerShown: false }} />
        <Stack.Screen name="Productivity" component={ProductivityStack} options={{ headerShown: false }} />
        <Stack.Screen name="Communication" component={CommunicationStack} options={{ headerShown: false }} />
        <Stack.Screen name="Calls" component={CallsStack} options={{ headerShown: false }} />
        <Stack.Screen name="POCs" component={POCStack} options={{ headerShown: false }} />
        <Stack.Screen name="OnlineUsers" component={OnlineUsersScreen} options={{ title: 'Online Users' }} />
      </Stack.Navigator>

      {/* Global Quick Actions FAB */}
      {/* <QuickActionsFAB
        actions={defaultQuickActions}
        onActionSelected={resolveAndNavigate}
      /> */}
    </View>
  );
};