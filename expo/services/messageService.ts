import { mockConversations, mockDirectMessages } from '@/mocks/messages';
import { Conversation, DirectMessage } from '@/types';

export const messageService = {
  getConversations: (): Conversation[] => {
    return mockConversations;
  },

  getMessages: (conversationId: string): DirectMessage[] => {
    return mockDirectMessages[conversationId] ?? [];
  },

  getTotalUnread: (): number => {
    return mockConversations.reduce((sum, c) => sum + c.unreadCount, 0);
  },
};
