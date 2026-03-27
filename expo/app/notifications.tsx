import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Bell, CircleDot, DollarSign, Users, Info, Vault, UserPlus } from 'lucide-react-native';
import { useColors, type ThemeColors } from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import { userService } from '@/services/userService';
import { Notification } from '@/types';

export default function NotificationsScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const notifications = userService.getNotifications();

  const iconMap: Record<string, React.ReactNode> = {
    circle: <CircleDot size={18} color={colors.accent} />,
    payout: <DollarSign size={18} color={colors.primary} />,
    social: <Users size={18} color={colors.accent} />,
    system: <Info size={18} color={colors.mediumGray} />,
    vault: <Vault size={18} color={colors.accent} />,
    request: <UserPlus size={18} color={colors.warning} />,
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <GlassCard style={[styles.notifCard, !item.read && styles.unread]}>
      <View style={styles.notifRow}>
        <View style={[styles.iconBg, !item.read && styles.iconBgUnread]}>
          {iconMap[item.type] ?? <Bell size={18} color={colors.mediumGray} />}
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>{item.title}</Text>
          <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notifTime}>{item.timestamp}</Text>
        </View>
        {!item.read && <View style={styles.dot} />}
      </View>
    </GlassCard>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Bell size={40} color={colors.lightGray} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 30,
  },
  notifCard: {
    marginBottom: 8,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.extraLightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBgUnread: {
    backgroundColor: colors.primary + '12',
  },
  notifContent: {
    flex: 1,
    marginLeft: 10,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.darkGray,
  },
  notifTitleUnread: {
    color: colors.black,
    fontWeight: '700' as const,
  },
  notifMessage: {
    fontSize: 13,
    color: colors.mediumGray,
    lineHeight: 18,
    marginTop: 2,
  },
  notifTime: {
    fontSize: 11,
    color: colors.mediumGray,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.mediumGray,
  },
});
