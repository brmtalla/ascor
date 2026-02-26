import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useColors, type ThemeColors } from '@/constants/colors';

export default function NotFoundScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>The page you're looking for doesn't exist.</Text>
      <Pressable style={styles.btn} onPress={() => router.replace('/')}>
        <Text style={styles.btnText}>Go Home</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.mediumGray,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
