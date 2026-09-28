import apiClient from '../../../api/axios';
import {
  Conversation,
  CreateConversationPayload,
  GetConversationsParams,
  GetMessagesParams,
  Message,
} from '../types/chat.types';

export const chatApiService = {
  /**
   * Fetch user conversations list
   */
  async getConversations(params?: GetConversationsParams): Promise<{
    conversations: Conversation[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  }> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    const response = await apiClient.get('/api/chat/conversations', {
      params: { page, limit },
    });

    const body = response.data;
    const conversations = Array.isArray(body?.data) ? body.data : [];
    const pagination = body?.pagination || body?.meta;

    return {
      conversations,
      total: pagination?.total,
      page: pagination?.page || page,
      limit: pagination?.limit || limit,
      totalPages: pagination?.totalPages,
    };
  },

  /**
   * Create or retrieve existing 1-to-1 conversation
   */
  async createConversation(payload: CreateConversationPayload): Promise<Conversation> {
    const response = await apiClient.post('/api/chat/conversations', payload);
    const body = response.data;
    return body?.data || body;
  },

  /**
   * Get single conversation details by ID
   */
  async getConversationById(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get(`/api/chat/conversations/${conversationId}`);
    const body = response.data;
    return body?.data || body;
  },

  /**
   * Fetch message history for a conversation
   */
  async getMessages(
    conversationId: string,
    params?: GetMessagesParams,
  ): Promise<{
    messages: Message[];
    cursor?: string;
    limit?: number;
  }> {
    const limit = params?.limit || 30;
    const cursor = params?.cursor;
    const after = params?.after;

    const response = await apiClient.get(
      `/api/chat/conversations/${conversationId}/messages`,
      {
        params: { limit, cursor, after },
      },
    );

    const body = response.data;
    const messages = Array.isArray(body?.data) ? body.data : [];
    const meta = body?.meta;

    return {
      messages,
      cursor: meta?.cursor,
      limit: meta?.limit || limit,
    };
  },

  /**
   * Get a presigned URL for uploading voice messages to S3
   */
  async getPresignedUrl(payload: {
    conversationId: string;
    mimeType: string;
    size: number;
  }): Promise<{
    uploadUrl: string;
    key: string;
    mediaUrl: string;
  }> {
    const response = await apiClient.post('/api/chat/media/presigned-url', payload);
    const body = response.data;
    return body?.data || body;
  },

  async getPlaybackUrl(payload: { key: string }): Promise<string> {
    const response = await apiClient.post(`/api/chat/media/playback-url`, payload);
    const body = response.data;
    return body?.data?.playbackUrl || '';
  }
};
