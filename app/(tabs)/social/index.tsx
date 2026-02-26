import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Modal, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { PenSquare, X, Send, MessageCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import PostCard from '@/components/PostCard';
import { socialService } from '@/services/socialService';
import { messageService } from '@/services/messageService';
import { SocialPost } from '@/types';

const INVESTMENT_KEYWORDS = ['invest', 'roi', 'returns', 'equity', 'shares', 'dividend', 'securities'];

export default function SocialScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const router = useRouter();
  const posts = socialService.getPosts();
  const totalUnread = messageService.getTotalUnread();
  const [showComposer, setShowComposer] = useState(false);
  const [newPostText, setNewPostText] = useState('');

  const handleNewPost = useCallback(() => {
    const lower = newPostText.toLowerCase();
    const hasSolicitation = INVESTMENT_KEYWORDS.some(kw => lower.includes(kw));
    if (hasSolicitation) {
      Alert.alert(
        'Post Not Allowed',
        'Posts soliciting investments are not permitted on Ascor. You can share business listings and causes through your profile storefront instead.'
      );
      return;
    }
    if (!newPostText.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Posted!', 'Your post has been shared with the community.');
    setNewPostText('');
    setShowComposer(false);
  }, [newPostText]);

  const handleMessages = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/messages');
  }, [router]);

  const renderPost = useCallback(({ item }: { item: SocialPost }) => (
    <PostCard post={item} />
  ), []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Social',
          headerRight: () => (
            <Pressable onPress={handleMessages} hitSlop={8} style={styles.headerBtn}>
              <MessageCircle size={22} color={colors.black} />
              {totalUnread > 0 && (
                <View style={styles.msgBadge}>
                  <Text style={styles.msgBadgeText}>{totalUnread}</Text>
                </View>
              )}
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Pressable
            style={styles.composerTrigger}
            onPress={() => setShowComposer(true)}
          >
            <View style={styles.composerPlaceholder}>
              <Text style={styles.composerPlaceholderText}>Share an update with your circles...</Text>
            </View>
          </Pressable>
        }
      />

      <Modal visible={showComposer} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowComposer(false)} hitSlop={8}>
              <X size={24} color={colors.black} />
            </Pressable>
            <Text style={styles.modalTitle}>New Post</Text>
            <Pressable
              onPress={handleNewPost}
              style={({ pressed }) => [styles.postBtn, !newPostText.trim() && styles.postBtnDisabled, pressed && { opacity: 0.85 }]}
              disabled={!newPostText.trim()}
            >
              <Send size={16} color={colors.white} />
              <Text style={styles.postBtnText}>Post</Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.composerInput}
            placeholder="What's on your mind? Use @mentions and #hashtags..."
            placeholderTextColor={colors.mediumGray}
            multiline
            autoFocus
            value={newPostText}
            onChangeText={setNewPostText}
            textAlignVertical="top"
          />

          <View style={styles.composerHint}>
            <Text style={styles.hintText}>Attach business or cause cards from your profile storefront. Investment solicitation is not allowed.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBtn: {
    padding: 4,
    position: 'relative',
  },
  msgBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  msgBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.white,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  composerTrigger: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  composerPlaceholder: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  composerPlaceholderText: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.black,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnDisabled: {
    opacity: 0.4,
  },
  postBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.white,
  },
  composerInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    color: colors.black,
    lineHeight: 24,
  },
  composerHint: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lightGray,
  },
  hintText: {
    fontSize: 13,
    color: colors.mediumGray,
  },
});
