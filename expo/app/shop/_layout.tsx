import React from 'react';
import { Stack } from 'expo-router';
import { useColors } from '@/constants/colors';

export default function ShopLayout() {
    const colors = useColors();

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: colors.white },
                headerTintColor: colors.black,
                headerShadowVisible: false,
                headerBackTitle: 'Back',
            }}
        />
    );
}
