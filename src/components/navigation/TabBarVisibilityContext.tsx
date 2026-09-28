import React, { createContext, useContext, useRef } from 'react';
import { Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_HEIGHT = 90;

const TabBarContext = createContext<any>(null);

export const TabBarProvider = ({ children }: any) => {
  const insets = useSafeAreaInsets();
  const EXTRA = 20;
  const containerHeight = TAB_BAR_HEIGHT + (insets.bottom || 0) + EXTRA;

  const translateY = useRef(new Animated.Value(0)).current;

  const hideTabBar = () => {
    Animated.timing(translateY, {
      toValue: containerHeight,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const showTabBar = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TabBarContext.Provider
      value={{
        translateY,
        hideTabBar,
        showTabBar,
      }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBarAnimation = () => useContext(TabBarContext);