import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { CameraScreen } from '../../screens/CameraScreen';
import { CollageEditorScreen } from '../../screens/CollageEditorScreen';
import { EditStoryScreen } from '../../screens/EditStoryScreen';
import { StoryListScreen } from '../../screens/StoryListScreen';
import { StoryStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<StoryStackParamList>();

export const StoryStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="StoryList" component={StoryListScreen} options={{ title: 'Stories', headerShown: false }} />
    <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Camera', headerShown: false }} />
    <Stack.Screen name="EditStory" component={EditStoryScreen} options={{ title: 'Edit Story', headerShown: false }} />
    <Stack.Screen name="CollageEditor" component={CollageEditorScreen} options={{ title: 'Collage Editor', headerShown: false }} />
  </Stack.Navigator>
);
