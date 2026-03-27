import { mockCircles } from '@/mocks/circles';
import { Circle } from '@/types';

export const circlesService = {
  getCircles: (): Circle[] => {
    return mockCircles;
  },

  getCircleById: (id: string): Circle | undefined => {
    return mockCircles.find(c => c.id === id);
  },

  getMyCircles: (): Circle[] => {
    return mockCircles.filter(c => c.status === 'active' || c.status === 'voting');
  },

  getRecruitingCircles: (): Circle[] => {
    return mockCircles.filter(c => c.status === 'recruiting');
  },

  getActiveCount: (): number => {
    return mockCircles.filter(c => c.status === 'active').length;
  },

  getCompletedCount: (): number => {
    return mockCircles.filter(c => c.status === 'completed' || c.status === 'voting').length;
  },

  searchCircles: (query: string): Circle[] => {
    const lower = query.toLowerCase();
    return mockCircles.filter(c =>
      c.name.toLowerCase().includes(lower) ||
      c.description.toLowerCase().includes(lower)
    );
  },

  requestToJoinCircle: (circleId: string, payload: { monthlyIncome: number; message: string }) => {
    const circle = mockCircles.find(c => c.id === circleId);
    if (!circle) throw new Error('Circle not found');

    // Simulate current user data for the request
    const newRequest = {
      id: `req_${Date.now()}`,
      userId: 'currentUser123',
      username: 'Alex Miller',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      completedCycles: 4,
      onTimeRate: 1.0,
      accountAge: '2 yrs',
      status: 'pending' as const,
      monthlyIncome: payload.monthlyIncome,
      message: payload.message,
    };

    // In a real app, this would be an API call. 
    // Here we mutate the mock data array slightly for UI testing purposes.
    circle.pendingRequests.push(newRequest);

    return true;
  },
};
