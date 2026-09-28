/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { QueryClientProvider } from '@tanstack/react-query';
import React, { useCallback, useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/store';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import queryClient from './src/queryClient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OneSignal, LogLevel } from 'react-native-onesignal';
import { setupOneSignalVideoCallHandlers } from './src/services/oneSignal.service';


function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const clickListener = useCallback((event: any) => {
    console.log('OneSignal: notification clicked:', event);
    // your deps may vary
  }, []);

  useEffect(() => {
    // Enable verbose logging for debugging (remove in production)
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    // Replace with your OneSignal App ID from Dashboard > Settings > Keys & IDs
    OneSignal.initialize('bb934d0f-93c4-439b-878c-77c22d101654');

    // Prompt for push permission on first launch.
    // In production, consider using an in-app message instead for better opt-in rates.
    OneSignal.Notifications.requestPermission(false);

    // Define listeners once so the same reference is used to add and remove them.
    const clickListener = (event: any) => {
      console.log('OneSignal: notification clicked:', event);
    };

    // In v5, foreground notifications display automatically.
    // Call event.preventDefault() to suppress, then
    // event.getNotification().display() to show after async work.
    const foregroundListener = (event: any) => {
      console.log('OneSignal: foreground will display:', event);
    };

    OneSignal.Notifications.addEventListener('click', clickListener);
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', foregroundListener);

    // Setup video call notification handlers
    setupOneSignalVideoCallHandlers();

    // Clean up listeners when the component unmounts to prevent memory leaks.
    // The same listener reference passed to addEventListener must be passed here.
    return () => {
      OneSignal.Notifications.removeEventListener('click', clickListener);
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay', foregroundListener);
    };
  }, []);

  useEffect(() => {
    OneSignal.Notifications.addEventListener('click', clickListener);
    return () => {
      OneSignal.Notifications.removeEventListener('click', clickListener);
    };
  }, [clickListener]);

  return (
    <ReduxProvider store={store}>
    <QueryClientProvider client={queryClient}>
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AuthProvider>
        <CartProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppNavigator />
          </GestureHandlerRootView>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
    </QueryClientProvider>
    </ReduxProvider>
  );
}

export default App;
