import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApiService } from '../services/chatApi.service';
import { Conversation, GetConversationsParams } from '../types/chat.types';

export const CONVERSATIONS_QUERY_KEY = ['conversations'];

export function useConversations(params?: GetConversationsParams) {
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: [...CONVERSATIONS_QUERY_KEY, params?.page || 1, params?.limit || 20],
    queryFn: () => chatApiService.getConversations(params),
  });

  const createConversationMutation = useMutation({
    mutationFn: (participantId: string) =>
      chatApiService.createConversation({ participantId }),
    onSuccess: (_newConversation: Conversation) => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });

  return {
    conversations: conversationsQuery.data?.conversations || [],
    pagination: {
      total: conversationsQuery.data?.total,
      page: conversationsQuery.data?.page,
      limit: conversationsQuery.data?.limit,
      totalPages: conversationsQuery.data?.totalPages,
    },
    isLoading: conversationsQuery.isLoading,
    isRefetching: conversationsQuery.isRefetching,
    isError: conversationsQuery.isError,
    error: conversationsQuery.error,
    refetch: conversationsQuery.refetch,
    createConversation: createConversationMutation.mutateAsync,
    isCreating: createConversationMutation.isPending,
  };
}
