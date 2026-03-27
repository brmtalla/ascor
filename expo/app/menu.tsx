import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Settings, Shield, FileText, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';

const MENU_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings, action: 'Settings' },
  { id: 'privacy', label: 'Privacy Policy', icon: Shield, action: 'Privacy Policy' },
  { id: 'terms', label: 'Terms of Service', icon: FileText, action: 'Terms of Service' },
  { id: 'support', label: 'Support', icon: HelpCircle, action: 'Support' },
];

export default function MenuScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const router = useRouter();

  const handlePress = (id: string, label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (id === 'settings') {
      router.back();
      setTimeout(() => router.push('/settings'), 300);
      return;
    }
    Alert.alert(label, `${label} page coming soon.`);
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Menu', presentation: 'modal' }} />

      <View style={styles.header}>
        <Text style={styles.appName}>Ascor</Text>
        <Text style={styles.appTagline}>Capital Coordination Platform</Text>
      </View>

      <View style={styles.menuList}>
        {MENU_ITEMS.map(item => {
          const IconComp = item.icon;
          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.extraLightGray }]}
              onPress={() => handlePress(item.id, item.action)}
            >
              <IconComp size={20} color={colors.darkGray} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={16} color={colors.mediumGray} />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}
        onPress={handleLogout}
      >
        <LogOut size={18} color={colors.primary} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>

      <Text style={styles.version}>Ascor v1.0.0 (MVP)</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.black,
    letterSpacing: -1,
  },
  appTagline: {
    fontSize: 13,
    color: colors.mediumGray,
    marginTop: 4,
  },
  menuList: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.darkGray,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 20,
  },
});
