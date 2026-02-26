import { mockOpportunities } from '@/mocks/opportunities';
import { OpportunityCard } from '@/types';

export const listingsService = {
  getOpportunities: (): OpportunityCard[] => {
    return mockOpportunities;
  },

  getByCategory: (category: 'business' | 'cause' | 'external'): OpportunityCard[] => {
    return mockOpportunities.filter(o => o.category === category);
  },

  getById: (id: string): OpportunityCard | undefined => {
    return mockOpportunities.find(o => o.id === id);
  },

  getByOwner: (ownerId: string): OpportunityCard[] => {
    return mockOpportunities.filter(o => o.ownerId === ownerId);
  },
};
