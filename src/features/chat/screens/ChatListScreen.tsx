import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useConversations } from '../hooks/useConversations';
import { useAuth } from '../../../context/AuthContext';
import { Conversation } from '../types/chat.types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user: currentUser } = useAuth();
  const { conversations, isLoading, isRefetching, isError, error, refetch } =
    useConversations();

  const handleConversationPress = useCallback(
    (conversation: Conversation) => {
      const otherParticipant = conversation.participants?.find(
        (p) => (typeof p === 'object' ? p._id || p.id : p) !== currentUser?.id,
      );

      const participantName =
        typeof otherParticipant === 'object' ? otherParticipant?.name : 'Chat';
      const participantId =
        typeof otherParticipant === 'object'
          ? otherParticipant?._id || otherParticipant?.id
          : otherParticipant;

      navigation.navigate('ChatScreen', {
        conversationId: conversation._id,
        participantName,
        participantId,
      });
    },
    [currentUser?.id, navigation],
  );

  const renderItem = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants?.find(
      (p) => (typeof p === 'object' ? p._id || p.id : p) !== currentUser?.id,
    );

    const participantName =
      typeof otherParticipant === 'object'
        ? otherParticipant?.name || 'User'
        : 'User';

    const avatarUri = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      participantName,
    )}&background=0A84FF&color=fff`;

    const lastMsgObj = typeof item.lastMessage === 'object' ? item.lastMessage : null;
    const lastMsgText = lastMsgObj?.text || (typeof item.lastMessage === 'string' ? item.lastMessage : 'No messages yet');
    const timestamp = formatTime(item.lastMessageAt || item.updatedAt);

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
      >
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {participantName}
            </Text>
            {timestamp ? <Text style={styles.timeText}>{timestamp}</Text> : null}
          </View>
          <Text style={styles.lastMessageText} numberOfLines={1}>
            {lastMsgText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Conversations</Text>
        <Text style={styles.emptySubtext}>
          Start a new chat by selecting a user from Online Users.
        </Text>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => navigation.getParent()?.navigate('OnlineUsers')}
        >
          <Text style={styles.newChatButtonText}>Find Users</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={() => navigation.getParent()?.navigate('OnlineUsers')}
        >
          <Text style={styles.headerActionText}>+ New Chat</Text>
        </TouchableOpacity>
      </View>

      {isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            {(error as any)?.message || 'Failed to load conversations.'}
          </Text>
        </View>
      )}

      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#0A84FF"
          />
        }
        contentContainerStyle={styles.listContent}
      />

      {isLoading && conversations.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  headerActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E5F1FF',
  },
  headerActionText: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E5EA',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  lastMessageText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  newChatButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#0A84FF',
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  errorBanner: {
    backgroundColor: '#FF3B3015',
    padding: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});
