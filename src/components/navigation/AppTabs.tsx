import React, { createRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AnimatedBottomTabBar, { BottomTabRef } from './BottomTabs';
import HomeScreen from '../../screens/HomeScreen';
import ProductListScreen from '../../screens/ProductListScreen';
import { View, Text } from 'react-native';


export const bottomTabRef =
  createRef<BottomTabRef>();

const Tab = createBottomTabNavigator();

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12, marginTop: 6 },
        tabBarIconStyle: { marginBottom: 2 },
        tabBarItemStyle: { paddingVertical: 8 },
      }}
      tabBar={(props) => (
        <AnimatedBottomTabBar
          ref={bottomTabRef}
          {...props}
        />
      )}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={() => {
          return <View />;
        }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🛍️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppTabs;