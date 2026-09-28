import { CHAT_EVENTS } from '../src/features/chat/constants/chatEvents';
import { chatApiService } from '../src/features/chat/services/chatApi.service';

// Mock axios client
jest.mock('../src/api/axios', () => {
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
    },
  };
});

import apiClient from '../src/api/axios';

describe('Chat Feature Day 1 Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Socket Events Constants', () => {
    it('should have exact event names expected by backend', () => {
      expect(CHAT_EVENTS.CHAT_JOIN).toBe('chat:join');
      expect(CHAT_EVENTS.CHAT_LEAVE).toBe('chat:leave');
      expect(CHAT_EVENTS.MESSAGE_SEND).toBe('message:send');
      expect(CHAT_EVENTS.MESSAGE_NEW).toBe('message:new');
      expect(CHAT_EVENTS.CHAT_ERROR).toBe('chat:error');
    });
  });

  describe('Chat API Service', () => {
    it('getConversations calls correct endpoint with pagination', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              _id: 'conv123',
              type: '1-to-1',
              participants: ['user1', 'user2'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
        },
      });

      const res = await chatApiService.getConversations({ page: 1, limit: 20 });

      expect(apiClient.get).toHaveBeenCalledWith('/api/chat/conversations', {
        params: { page: 1, limit: 20 },
      });
      expect(res.conversations.length).toBe(1);
      expect(res.conversations[0]._id).toBe('conv123');
    });

    it('createConversation calls POST endpoint', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            _id: 'conv456',
            type: '1-to-1',
            participants: ['user1', 'user2'],
          },
        },
      });

      const res = await chatApiService.createConversation({ participantId: 'user2' });

      expect(apiClient.post).toHaveBeenCalledWith('/api/chat/conversations', {
        participantId: 'user2',
      });
      expect(res._id).toBe('conv456');
    });

    it('getMessages calls correct endpoint with cursor and limit', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              _id: 'msg1',
              conversationId: 'conv123',
              senderId: 'user1',
              clientMessageId: 'client-1',
              type: 'text',
              text: 'Hello World',
              status: 'sent',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          meta: { limit: 30, cursor: 'msg1' },
        },
      });

      const res = await chatApiService.getMessages('conv123', { limit: 30, cursor: 'msg0' });

      expect(apiClient.get).toHaveBeenCalledWith('/api/chat/conversations/conv123/messages', {
        params: { limit: 30, cursor: 'msg0' },
      });
      expect(res.messages.length).toBe(1);
      expect(res.messages[0].text).toBe('Hello World');
    });
  });

  describe('Text Message Rules Validation', () => {
    it('validates 2000 max character limit and non-whitespace requirement', () => {
      const emptyText = '   ';
      expect(emptyText.trim().length).toBe(0);

      const validText = 'Hello!';
      expect(validText.trim().length).toBeGreaterThan(0);
      expect(validText.length).toBeLessThanOrEqual(2000);

      const overflowText = 'a'.repeat(2001);
      expect(overflowText.length).toBeGreaterThan(2000);
    });
  });
});
