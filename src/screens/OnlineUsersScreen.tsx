import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { MainStackParamList } from '../types/navigation';
import { usePresence } from '../modules/video-call/hooks/usePresence';
import { useAuth } from '../context/AuthContext';
import { useVideoCall } from '../modules/video-call/hooks/useVideoCall';
import { fetchUserById } from '../api/auth';
import { setUserName } from '../modules/video-call/store/presenceSlice';
import type { AppDispatch } from '../store';
import { chatApiService } from '../features/chat/services/chatApi.service';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;


/**
 * Screen showing all currently online users
 * Allows viewing user profiles and initiating video calls
 */
export default function OnlineUsersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUserQuery } = useAuth();
  const { onlineUserIds, onlineCount, isConnected, error, getOnlineUsers, userNames } =
    usePresence();
  const { initiateCall } = useVideoCall();

  const currentUser = currentUserQuery.data;
  const isLoading = currentUserQuery.isLoading;

  // Filter out current user from online list
  const filteredOnlineUsers = useMemo(() => {
    return onlineUserIds.filter((userId) => userId !== currentUser?.id);
  }, [onlineUserIds, currentUser?.id]);

  // Fetch names for users in initial snapshot that don't have stored names
  useEffect(() => {
    
    const idsWithoutNames = filteredOnlineUsers.filter((id) => !userNames[id]);
    
    idsWithoutNames.forEach(async (userId) => {
      
      const user = await fetchUserById(userId);
      
      if (user?.name) {
        dispatch(setUserName({ userId, userName: user.name }));
      }
    });
  }, [filteredOnlineUsers, userNames, dispatch]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    getOnlineUsers();
  }, [getOnlineUsers]);

  // Handle user press - navigate to profile
  const handleUserPress = useCallback(
    (userId: string) => {
      // TODO: Navigate to user profile screen
      // This can be updated once user profile screen exists
      console.log('[OnlineUsersScreen] Navigate to user profile:', userId);
    },
    [],
  );

  // Handle call button press
  const handleCallPress = useCallback(
    (userId: string, isOnline: boolean) => {
      if (!currentUser?.id) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Verify user is still online before initiating call
      if (!isOnline) {
        Alert.alert(
          'User Offline',
          'This user has gone offline. Please select another user to call.',
        );
        return;
      }

      initiateCall(userId, userNames[userId]);
    },
    [currentUser?.id, initiateCall, userNames],
  );

  // Handle chat button press
  const handleChatPress = useCallback(
    async (userId: string) => {
      if (!currentUser?.id) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      try {
        const conversation = await chatApiService.createConversation({ participantId: userId });
        navigation.navigate('Communication', {
          screen: 'ChatScreen',
          params: {
          conversationId: conversation._id,
          participantName: userNames[userId] || `User ${userId.substring(0, 6)}`,
          participantId: userId,
          },
        });
      } catch (err: any) {
        console.error('[OnlineUsersScreen] Failed to start conversation:', err);
        Alert.alert('Error', err?.response?.data?.message || err?.message || 'Could not start chat');
      }
    },
    [currentUser?.id, navigation, userNames],
  );

  useEffect(() => {
    // Fetch online users on mount
    getOnlineUsers();
  }, []);

  // Render user list item
  const renderUserItem = useCallback(
    ({ item: userId }: { item: string }) => (
      <UserListItem
        userId={userId}
        userName={userNames[userId]}
        isOnline={true}
        onPress={() => handleUserPress(userId)}
        onCallPress={() => handleCallPress(userId, true)}
        onChatPress={() => handleChatPress(userId)}
      />
    ),
    [handleUserPress, handleCallPress, handleChatPress, userNames],
  );

  // Render empty state
  const renderEmptyComponent = useCallback(() => {
    if (isLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {!isConnected
            ? '📡 Waiting for connection...'
            : filteredOnlineUsers.length === 0
              ? '🙈 No users online right now'
              : 'Loading...'}
        </Text>
      </View>
    );
  }, [isLoading, isConnected, filteredOnlineUsers.length]);

  // Render header with count
  const renderHeader = useCallback(() => {
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Online Users</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }, [onlineCount, error]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <FlatList
        data={filteredOnlineUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#0a84ff']}
          />
        }
        contentContainerStyle={styles.listContent}
        scrollIndicatorInsets={{ right: 1 }}
      />
      {isLoading && filteredOnlineUsers.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0a84ff" />
        </View>
      )}
    </SafeAreaView>
  );
}

/**
 * Individual user list item component
 */
interface UserListItemProps {
  userId: string;
  userName?: string;
  isOnline: boolean;
  onPress: () => void;
  onCallPress: () => void;
  onChatPress: () => void;
}

function UserListItem({ userId, userName, isOnline, onPress, onCallPress, onChatPress }: UserListItemProps) {
  const displayName = userName ?? `User ${userId.substring(0, 8)}`;
  const userAvatar = `https://i.pravatar.cc/150?img=${userId.length % 100}`;

  return (
    <TouchableOpacity style={styles.userItem} onPress={onPress}>
      <View style={styles.userContent}>
        <Image source={{ uri: userAvatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{displayName}</Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
          <Text style={styles.userSubtitle}>Available for chat & call</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: '#34c759' }]}
          onPress={onChatPress}
          activeOpacity={0.7}
        >
          <Text style={styles.callButtonText}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.callButton, !isOnline && styles.callButtonDisabled]}
          onPress={onCallPress}
          disabled={!isOnline}
          activeOpacity={isOnline ? 0.7 : 0.5}
        >
          <Text style={styles.callButtonText}>{isOnline ? '📞' : '📵'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#ff3b30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  userContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#e5e5ea',
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34c759',
  },
  onlineText: {
    fontSize: 12,
    color: '#34c759',
    fontWeight: '500',
  },
  userSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0a84ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  callButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  callButtonText: {
    fontSize: 20,
  },
});
