import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorefrontListing } from '@/types';
import { mockUser } from '@/mocks/user';

const BUSINESS_MODE_KEY = 'ascor_business_mode';
const SHOP_ITEMS_KEY = 'ascor_shop_items';

let cachedBusinessMode: boolean | null = null;
let cachedShopItems: StorefrontListing[] | null = null;

export const shopService = {
    getBusinessMode: async (): Promise<boolean> => {
        if (cachedBusinessMode !== null) return cachedBusinessMode;
        try {
            const value = await AsyncStorage.getItem(BUSINESS_MODE_KEY);
            cachedBusinessMode = value === 'true';
            return cachedBusinessMode;
        } catch {
            return mockUser.isBusinessOwner;
        }
    },

    setBusinessMode: async (enabled: boolean): Promise<void> => {
        cachedBusinessMode = enabled;
        await AsyncStorage.setItem(BUSINESS_MODE_KEY, String(enabled));
    },

    getShopItems: async (): Promise<StorefrontListing[]> => {
        if (cachedShopItems !== null) return cachedShopItems;
        try {
            const value = await AsyncStorage.getItem(SHOP_ITEMS_KEY);
            if (value) {
                cachedShopItems = JSON.parse(value);
                return cachedShopItems!;
            }
        } catch { }
        cachedShopItems = [...mockUser.storefrontListings];
        return cachedShopItems;
    },

    addShopItem: async (item: StorefrontListing): Promise<void> => {
        const items = await shopService.getShopItems();
        items.push(item);
        cachedShopItems = items;
        await AsyncStorage.setItem(SHOP_ITEMS_KEY, JSON.stringify(items));
    },

    updateShopItem: async (itemId: string, updates: Partial<StorefrontListing>): Promise<void> => {
        const items = await shopService.getShopItems();
        const index = items.findIndex(i => i.id === itemId);
        if (index >= 0) {
            items[index] = { ...items[index], ...updates };
            cachedShopItems = items;
            await AsyncStorage.setItem(SHOP_ITEMS_KEY, JSON.stringify(items));
        }
    },

    deleteShopItem: async (itemId: string): Promise<void> => {
        const items = await shopService.getShopItems();
        cachedShopItems = items.filter(i => i.id !== itemId);
        await AsyncStorage.setItem(SHOP_ITEMS_KEY, JSON.stringify(cachedShopItems));
    },

    generateId: (): string => {
        return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
};
