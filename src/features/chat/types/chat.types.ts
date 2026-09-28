export type MessageType = 'text' | 'voice';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface VoiceMessageMedia {
  url: string;
  duration: number;
  mimeType: string;
  size: number;
}

export interface ChatUser {
  _id: string;
  id?: string;
  name: string;
  email?: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string | ChatUser;
  clientMessageId: string;
  type: MessageType;
  text: string;
  media?: VoiceMessageMedia;
  voice?: VoiceMessageMedia;
  status: MessageStatus;
  reactions?: {
    emoji: string;
    users: string[];
    _id?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  type: '1-to-1';
  participants: ChatUser[];
  lastMessage?: Message | string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetConversationsParams {
  page?: number;
  limit?: number;
}

export interface GetMessagesParams {
  limit?: number;
  cursor?: string;
  after?: string;
}

export interface CreateConversationPayload {
  participantId: string;
}

export type SendMessagePayload =
  | {
    conversationId: string;
    clientMessageId: string;
    type: 'text';
    text: string;
  }
  | {
    conversationId: string;
    clientMessageId: string;
    type: 'voice';
    voice: VoiceMessageMedia;
  };

export interface SocketAckResponse {
  success?: boolean;
  status?: string;
  error?: string;
  message?: string;
  [key: string]: any;
}
