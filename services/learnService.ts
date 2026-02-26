import { mockModules } from '@/mocks/learn';
import { LearnModule } from '@/types';

export const learnService = {
  getModules: (): LearnModule[] => {
    return mockModules;
  },

  getModuleById: (id: string): LearnModule | undefined => {
    return mockModules.find(m => m.id === id);
  },
};
