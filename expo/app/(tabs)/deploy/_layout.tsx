import React from 'react';
import { Stack } from 'expo-router';
import { useColors } from '@/constants/colors';

export default function DeployLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.black,
        headerTitleStyle: { fontSize: 19, fontWeight: '800' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Deploy' }} />
      <Stack.Screen name="cart" options={{ title: 'Cart' }} />
    </Stack>
  );
}
