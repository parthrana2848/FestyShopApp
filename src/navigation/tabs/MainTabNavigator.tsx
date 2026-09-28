import React, { createRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AnimatedBottomTabBar, { BottomTabRef } from '../../components/navigation/BottomTabs';
import { DashboardStack } from '../stacks/DashboardStack';
import { EcommerceStack } from '../stacks/EcommerceStack';
import { StoryStack } from '../stacks/StoryStack';
import { ProfileStack } from '../stacks/ProfileStack';
import { MainTabParamList } from '../../types/navigation';

export const bottomTabRef = createRef<BottomTabRef>();

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12, marginTop: 6 },
        tabBarIconStyle: { marginBottom: 2 },
        tabBarItemStyle: { paddingVertical: 8 },
        headerShown: false,
      }}
      tabBar={(props) => (
        <AnimatedBottomTabBar
          ref={bottomTabRef}
          {...props}
        />
      )}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Ecommerce"
        component={EcommerceStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🛍️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Story"
        component={StoryStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📖</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
