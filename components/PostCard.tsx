import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Heart, Bookmark, ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import GlassCard from './GlassCard';
import { SocialPost } from '@/types';

interface PostCardProps {
  post: SocialPost;
}

function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const colors = useColors();
  const styles = createStyles(colors);
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(post.bookmarked);

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  }, [liked]);

  const handleBookmark = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBookmarked(prev => !prev);
  }, []);

  const handleProfilePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/user/${post.userId}`);
  }, [router, post.userId]);

  const renderContent = (text: string) => {
    const parts = text.split(/(#\w+|@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) return <Text key={i} style={styles.hashtag}>{part}</Text>;
      if (part.startsWith('@')) return <Text key={i} style={styles.mention}>{part}</Text>;
      return <Text key={i}>{part}</Text>;
    });
  };

  return (
    <GlassCard style={styles.card}>
      <Pressable style={styles.header} onPress={handleProfilePress}>
        <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.userName}>{post.username}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
      </Pressable>

      <Text style={styles.content}>{renderContent(post.content)}</Text>

      {post.attachedListing && (
        <Pressable style={styles.listingCard} onPress={() => router.push(`/user/${post.userId}`)}>
          <Image source={{ uri: post.attachedListing.image }} style={styles.listingImage} />
          <View style={styles.listingContent}>
            <View style={[styles.listingCategoryBadge, { backgroundColor: post.attachedListing.category === 'cause' ? colors.accent + '18' : colors.primary + '18' }]}>
              <Text style={[styles.listingCategoryText, { color: post.attachedListing.category === 'cause' ? colors.accent : colors.primary }]}>
                {post.attachedListing.category}
              </Text>
            </View>
            <Text style={styles.listingTitle}>{post.attachedListing.title}</Text>
            <Text style={styles.listingDesc} numberOfLines={2}>{post.attachedListing.description}</Text>
            {post.attachedListing.fundingGoal && (
              <View style={styles.listingProgress}>
                <View style={styles.listingProgressBg}>
                  <View style={[styles.listingProgressFill, { width: `${((post.attachedListing.fundingRaised ?? 0) / post.attachedListing.fundingGoal) * 100}%` }]} />
                </View>
                <Text style={styles.listingFunding}>
                  ${((post.attachedListing.fundingRaised ?? 0) / 1000).toFixed(0)}k / ${(post.attachedListing.fundingGoal / 1000).toFixed(0)}k
                </Text>
              </View>
            )}
            {post.attachedListing.price && (
              <Text style={styles.listingPrice}>From ${post.attachedListing.price}</Text>
            )}
          </View>
          <ExternalLink size={14} color={colors.mediumGray} style={styles.listingLink} />
        </Pressable>
      )}

      <View style={styles.actions}>
        <Pressable onPress={handleLike} style={styles.actionBtn} hitSlop={8}>
          <Heart size={18} color={liked ? colors.primary : colors.mediumGray} fill={liked ? colors.primary : 'none'} />
          <Text style={[styles.actionText, liked && { color: colors.primary }]}>{likeCount}</Text>
        </Pressable>
        <Pressable onPress={handleBookmark} style={styles.actionBtn} hitSlop={8}>
          <Bookmark size={18} color={bookmarked ? colors.accent : colors.mediumGray} fill={bookmarked ? colors.accent : 'none'} />
          <Text style={[styles.actionText, bookmarked && { color: colors.accent }]}>{post.bookmarks}</Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}

export default React.memo(PostCard);

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  headerText: { marginLeft: 10 },
  userName: { fontSize: 15, fontWeight: '600' as const, color: colors.black },
  timestamp: { fontSize: 12, color: colors.mediumGray, marginTop: 1 },
  content: { fontSize: 14, color: colors.darkGray, lineHeight: 21, marginBottom: 10 },
  hashtag: { color: colors.accent, fontWeight: '600' as const },
  mention: { color: colors.primary, fontWeight: '600' as const },
  listingCard: { flexDirection: 'row', backgroundColor: colors.extraLightGray, borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  listingImage: { width: 80, height: 90 },
  listingContent: { flex: 1, padding: 10, justifyContent: 'center' },
  listingCategoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 3 },
  listingCategoryText: { fontSize: 10, fontWeight: '600' as const, textTransform: 'capitalize' as const },
  listingTitle: { fontSize: 13, fontWeight: '600' as const, color: colors.black, marginBottom: 2 },
  listingDesc: { fontSize: 11, color: colors.mediumGray, lineHeight: 15 },
  listingProgress: { marginTop: 5 },
  listingProgressBg: { height: 3, backgroundColor: colors.lightGray, borderRadius: 2, overflow: 'hidden' },
  listingProgressFill: { height: 3, backgroundColor: colors.accent, borderRadius: 2 },
  listingFunding: { fontSize: 10, color: colors.mediumGray, marginTop: 2 },
  listingPrice: { fontSize: 12, fontWeight: '600' as const, color: colors.accent, marginTop: 4 },
  listingLink: { alignSelf: 'center', marginRight: 10 },
  actions: { flexDirection: 'row', gap: 20, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.lightGray },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  actionText: { fontSize: 13, color: colors.mediumGray, fontWeight: '500' as const },
});
