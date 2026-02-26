import { mockPosts } from '@/mocks/social';
import { SocialPost } from '@/types';

export const socialService = {
  getPosts: (): SocialPost[] => {
    return mockPosts;
  },

  getPostsByTag: (tag: string): SocialPost[] => {
    return mockPosts.filter(p => p.tags.includes(tag));
  },

  getPostsByUser: (userId: string): SocialPost[] => {
    return mockPosts.filter(p => p.userId === userId);
  },
};
