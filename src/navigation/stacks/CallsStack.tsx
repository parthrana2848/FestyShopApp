import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import VoiceCallPage from '../../components/VideoCall/CallPage';
import { CallingScreen } from '../../components/VideoCall/CallingScreen';
import { IncomingCallScreen } from '../../modules/video-call/screens/IncomingCallScreen';
import { OutgoingCallScreen } from '../../modules/video-call/screens/OutgoingCallScreen';
import { VideoCallScreen } from '../../modules/video-call/screens/VideoCallScreen';
import ZegoVideoCallScreen from '../../screens/ZegoVideoCallScreen';
import { CallsStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<CallsStackParamList>();

export const CallsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ZegoVideoCall" component={ZegoVideoCallScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CallingScreen" component={CallingScreen} options={{ title: 'Video Call' }} />
    <Stack.Screen name="VoiceCall" component={VoiceCallPage} options={{ title: 'Video Call' }} />
    <Stack.Screen name="IncomingCall" component={IncomingCallScreen} options={{ headerShown: false, animation: 'fade' }} />
    <Stack.Screen name="OutgoingCall" component={OutgoingCallScreen} options={{ headerShown: false, animation: 'fade' }} />
    <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ headerShown: false, animation: 'fade' }} />
  </Stack.Navigator>
);
