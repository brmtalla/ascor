import React from 'react';
import { Stack } from 'expo-router';
import { useColors } from '@/constants/colors';

export default function CirclesLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.black,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Circles' }} />
      <Stack.Screen name="browse" options={{ title: 'Browse Circles' }} />
      <Stack.Screen name="join" options={{ title: 'Request to Join', presentation: 'modal' }} />
      <Stack.Screen name="[circleId]" options={{ title: '' }} />
      <Stack.Screen name="create" options={{ title: 'Create Circle', presentation: 'modal' }} />
    </Stack>
  );
}
