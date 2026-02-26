import { mockUser, mockUsers, mockVaults, mockVaultFamilies, mockNotifications } from '@/mocks/user';
import { User, Vault, VaultFamily, Notification } from '@/types';

export const userService = {
  getUser: (): User => {
    return mockUser;
  },

  getUserById: (id: string): User | undefined => {
    return mockUsers.find(u => u.id === id);
  },

  getUserByUsername: (username: string): User | undefined => {
    return mockUsers.find(u => u.username === username);
  },

  getAllUsers: (): User[] => {
    return mockUsers;
  },

  getVaults: (): Vault[] => {
    return mockVaults;
  },

  getVaultById: (id: string): Vault | undefined => {
    return mockVaults.find(v => v.id === id);
  },

  getVaultFamilies: (): VaultFamily[] => {
    return mockVaultFamilies;
  },

  getNotifications: (): Notification[] => {
    return mockNotifications;
  },

  getUnreadCount: (): number => {
    return mockNotifications.filter(n => !n.read).length;
  },
};
