import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

import { CameraScreen } from '../screens/CameraScreen';
import CartScreen from '../screens/CartScreen';
import CategoryListScreen from '../screens/CategoryListScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import { EditStoryScreen } from '../screens/EditStoryScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import OnlineUsersScreen from '../screens/OnlineUsersScreen';
import CreateNoteScreen from '../screens/CreateNoteScreen';
import CreateExpenseScreen from '../screens/CreateExpenseScreen';
import CreateLeadScreen from '../screens/CreateLeadScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import LoginScreen from '../screens/LoginScreen';
// import BiometricAuthScreen from '../screens/BiometricAuthScreen';
import OrderListScreen from '../screens/OrderListScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import ProductListScreen from '../screens/ProductListScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import { StoryListScreen } from '../screens/StoryListScreen';
import { RootStackParamList } from '../types/navigation';
import { CollageEditorScreen } from '../screens/CollageEditorScreen';
import BottomSheetUXScreen from '../screens/BottomSheetUXScreen';
import DribbbleFabScreen from '../screens/DribbbleFabScreen';
import AnimatedBottomTabBar from '../components/navigation/BottomTabs';
import AppTabs from '../components/navigation/AppTabs';
import VoiceCallPage from '../components/VideoCall/CallPage';
import { ZegoCallInvitationDialog, ZegoUIKitPrebuiltCallInCallScreen, ZegoUIKitPrebuiltCallWaitingScreen } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { CallingScreen } from '../components/VideoCall/CallingScreen';
import { IncomingCallScreen } from '../modules/video-call/screens/IncomingCallScreen';
import { OutgoingCallScreen } from '../modules/video-call/screens/OutgoingCallScreen';
import { VideoCallScreen } from '../modules/video-call/screens/VideoCallScreen';
import ZegoVideoCallScreen from '../screens/ZegoVideoCallScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isAuthenticated, initializing, currentUserQuery } = useAuth();

  if (initializing || currentUserQuery.isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <ZegoCallInvitationDialog />
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="StoryList" component={StoryListScreen} options={{ title: 'Stories', headerShown: false }} />
            <Stack.Screen name="ZegoVideoCall" component={ZegoVideoCallScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OnlineUsers" component={OnlineUsersScreen} options={{ title: 'Online Users', headerShown: true }} />
            <Stack.Screen
              options={{ headerShown: false }}
              // DO NOT change the name 
              name="ZegoUIKitPrebuiltCallWaitingScreen"
              component={ZegoUIKitPrebuiltCallWaitingScreen}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              // DO NOT change the name
              name="ZegoUIKitPrebuiltCallInCallScreen"
              component={ZegoUIKitPrebuiltCallInCallScreen}
            />
            <Stack.Screen name="CallingScreen" component={CallingScreen} options={{ title: 'Video Call' }} />
            <Stack.Screen name="VoiceCall" component={VoiceCallPage} options={{ title: 'Video Call' }} />
            <Stack.Screen name="FabPreview" component={DribbbleFabScreen} options={{ title: 'FAB Preview' }} />
            <Stack.Screen name="CreateNoteScreen" component={CreateNoteScreen} options={{ title: 'Create Note' }} />
            <Stack.Screen name="CreateExpenseScreen" component={CreateExpenseScreen} options={{ title: 'Create Expense' }} />
            <Stack.Screen name="CreateLeadScreen" component={CreateLeadScreen} options={{ title: 'Create Lead' }} />
            <Stack.Screen name="CreateTaskScreen" component={CreateTaskScreen} options={{ title: 'Create Task' }} />
            <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products' }} />
            <Stack.Screen name="CategoryList" component={CategoryListScreen} options={{ title: 'Categories' }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Shopping Cart' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
            <Stack.Screen name="OrderList" component={OrderListScreen} options={{ title: 'My Orders' }} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ title: 'Order Placed', headerLeft: () => null }} />
            <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Camera', headerShown: false }} />
            <Stack.Screen name="EditStory" component={EditStoryScreen} options={{ title: 'Edit Story', headerShown: false }} />
            <Stack.Screen name="CollageEditor" component={CollageEditorScreen} options={{ title: 'Collage Editor', headerShown: false }} />
            <Stack.Screen name="BottomSheetUXScreen" component={BottomSheetUXScreen} options={{ title: 'Bottom Sheet UX Demo' }} />
            <Stack.Screen name="IncomingCall" component={IncomingCallScreen} options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="OutgoingCall" component={OutgoingCallScreen} options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ headerShown: false, animation: 'fade' }} />
          </>
        ) : (
          <>
            {/* <Stack.Screen name="BiometricAuth" component={BiometricAuthScreen} options={{ title: 'Welcome', headerShown: false }} /> */}
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In', headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
