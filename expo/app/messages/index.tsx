import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Search, Circle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import { messageService } from '@/services/messageService';
import { Conversation } from '@/types';

export default function MessagesScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const router = useRouter();
  const conversations = messageService.getConversations();
  const totalUnread = messageService.getTotalUnread();

  const handleConversation = useCallback((conv: Conversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/messages/${conv.id}`);
  }, [router]);

  const renderConversation = useCallback(({ item }: { item: Conversation }) => (
    <Pressable
      onPress={() => handleConversation(item)}
      style={({ pressed }) => [styles.convRow, pressed && { backgroundColor: colors.extraLightGray }]}
      testID={`conversation-${item.id}`}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.participantAvatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.convContent}>
        <View style={styles.convTop}>
          <Text style={[styles.convName, item.unreadCount > 0 && styles.convNameUnread]} numberOfLines={1}>
            {item.participantUsername}
          </Text>
          <Text style={[styles.convTime, item.unreadCount > 0 && styles.convTimeUnread]}>
            {item.lastMessageTime}
          </Text>
        </View>
        <View style={styles.convBottom}>
          <Text
            style={[styles.convMessage, item.unreadCount > 0 && styles.convMessageUnread]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  ), [handleConversation]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Messages',
        }}
      />

      {totalUnread > 0 && (
        <View style={styles.unreadBanner}>
          <Circle size={8} color={colors.primary} fill={colors.primary} />
          <Text style={styles.unreadBannerText}>{totalUnread} unread message{totalUnread > 1 ? 's' : ''}</Text>
        </View>
      )}

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Search size={40} color={colors.lightGray} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation with someone from your circles</Text>
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
    paddingBottom: 20,
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primary + '08',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.primary + '20',
  },
  unreadBannerText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.statusOpen,
    borderWidth: 2.5,
    borderColor: colors.background,
  },
  convContent: {
    flex: 1,
    marginLeft: 14,
  },
  convTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  convName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.darkGray,
    flex: 1,
    marginRight: 8,
  },
  convNameUnread: {
    fontWeight: '700' as const,
    color: colors.black,
  },
  convTime: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  convTimeUnread: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  convBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  convMessage: {
    fontSize: 14,
    color: colors.mediumGray,
    flex: 1,
    marginRight: 8,
  },
  convMessageUnread: {
    color: colors.darkGray,
    fontWeight: '500' as const,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.white,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.lightGray,
    marginLeft: 82,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.black,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.mediumGray,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});
