import React from 'react';
import { Stack } from 'expo-router';
import { useColors } from '@/constants/colors';

export default function ProfileLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.black,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="wallet" options={{ title: 'Wallet' }} />
    </Stack>
  );
}
