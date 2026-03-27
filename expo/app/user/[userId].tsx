import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Shield, Clock, Star, ChevronRight, ExternalLink, Store, MessageSquare, CircleDot, DollarSign, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import DeployDetailModal from '@/components/DeployDetailModal';
import { userService } from '@/services/userService';
import { socialService } from '@/services/socialService';
import { circlesService } from '@/services/circlesService';
import { StorefrontListing, SocialPost, Circle, OpportunityCard } from '@/types';

type ProfileTab = 'storefront' | 'posts' | 'circles';

export default function UserProfileScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const user = useMemo(() => userService.getUserById(userId ?? ''), [userId]);
  const userPosts = useMemo(() => socialService.getPostsByUser(userId ?? ''), [userId]);
  const userCircles = useMemo(() => {
    const allCircles = circlesService.getCircles();
    return allCircles.filter(c => c.members.some(m => m.id === userId));
  }, [userId]);

  const availableTabs = useMemo((): ProfileTab[] => {
    if (user?.isBusinessOwner) {
      return ['storefront', 'posts', 'circles'];
    }
    return ['posts', 'circles'];
  }, [user]);

  const [activeTab, setActiveTab] = useState<ProfileTab>(availableTabs[0]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityCard | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  const listingToOpportunity = (listing: StorefrontListing): OpportunityCard => ({
    id: listing.id,
    title: listing.title,
    description: listing.description,
    category: listing.category === 'cause' ? 'cause' : 'business',
    listingType: listing.listingType,
    price: listing.price,
    fundingGoal: listing.fundingGoal,
    fundingRaised: listing.fundingRaised,
    image: listing.image,
    tags: listing.tags,
    ownerId: userId ?? '',
    ownerUsername: user.username,
    ownerAvatar: user.avatar,
    supportCount: listing.supportCount,
    contactEnabled: true,
    duration: listing.duration,
    availableSlots: listing.availableSlots,
    variants: listing.variants,
    inventory: listing.inventory,
    deliveryInfo: listing.deliveryInfo,
  });

  const handleSupport = (listing: StorefrontListing) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const opportunity = listingToOpportunity(listing);
    setSelectedOpportunity(opportunity);
    setShowDetailModal(true);
  };

  const renderStorefrontItem = useCallback((listing: StorefrontListing) => (
    <Pressable key={listing.id} onPress={() => handleSupport(listing)} style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}>
      <GlassCard style={styles.listingCard}>
        <Image source={{ uri: listing.image }} style={styles.listingImage} />
        <View style={styles.listingBody}>
          <View style={[styles.categoryBadge, { backgroundColor: listing.category === 'cause' ? colors.accent + '15' : listing.category === 'service' ? colors.primary + '15' : colors.warning + '15' }]}>
            <Text style={[styles.categoryText, { color: listing.category === 'cause' ? colors.accent : listing.category === 'service' ? colors.primary : colors.warning }]}>
              {listing.category}
            </Text>
          </View>
          <Text style={styles.listingTitle}>{listing.title}</Text>
          <Text style={styles.listingDesc} numberOfLines={2}>{listing.description}</Text>

          {listing.price && (
            <View style={styles.priceRow}>
              <DollarSign size={14} color={colors.accent} />
              <Text style={styles.priceText}>From ${listing.price}</Text>
            </View>
          )}

          {listing.fundingGoal && (
            <View style={styles.fundingSection}>
              <View style={styles.fundingBar}>
                <View style={[styles.fundingFill, { width: `${((listing.fundingRaised ?? 0) / listing.fundingGoal) * 100}%` }]} />
              </View>
              <Text style={styles.fundingText}>
                ${((listing.fundingRaised ?? 0) / 1000).toFixed(0)}k / ${(listing.fundingGoal / 1000).toFixed(0)}k raised
              </Text>
            </View>
          )}

          <View style={styles.listingFooter}>
            <View style={styles.supportCount}>
              <Heart size={12} color={colors.mediumGray} />
              <Text style={styles.supportText}>{listing.supportCount} supporters</Text>
            </View>
            <View style={styles.listingTags}>
              {listing.tags.slice(0, 2).map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  ), []);

  const renderPost = useCallback((post: SocialPost) => {
    const renderContent = (text: string) => {
      const parts = text.split(/(#\w+|@\w+)/g);
      return parts.map((part, i) => {
        if (part.startsWith('#')) return <Text key={i} style={styles.hashtag}>{part}</Text>;
        if (part.startsWith('@')) return <Text key={i} style={styles.mention}>{part}</Text>;
        return <Text key={i}>{part}</Text>;
      });
    };

    return (
      <GlassCard key={post.id} style={styles.postCard}>
        <Text style={styles.postContent}>{renderContent(post.content)}</Text>
        <View style={styles.postMeta}>
          <Text style={styles.postTime}>{post.timestamp}</Text>
          <View style={styles.postStats}>
            <Heart size={13} color={colors.mediumGray} />
            <Text style={styles.postStatText}>{post.likes}</Text>
          </View>
        </View>
      </GlassCard>
    );
  }, []);

  const renderCircle = useCallback((circle: Circle) => (
    <Pressable key={circle.id} onPress={() => router.push(`/(circles)/${circle.id}`)}>
      <GlassCard style={styles.circleRow}>
        <Text style={styles.circleEmoji}>{circle.avatar}</Text>
        <View style={styles.circleInfo}>
          <Text style={styles.circleName}>{circle.name}</Text>
          <Text style={styles.circleDetail}>${circle.contribution}/month · {circle.status}</Text>
        </View>
        <ChevronRight size={16} color={colors.mediumGray} />
      </GlassCard>
    </Pressable>
  ), [router]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: user.username }} />

      <View style={styles.profileHeader}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.bio}>{user.bio}</Text>

        <View style={styles.reputationRow}>
          <View style={styles.repItem}>
            <Shield size={14} color={colors.accent} />
            <Text style={styles.repLabel}>{user.completedCycles} cycles</Text>
          </View>
          <View style={styles.repItem}>
            <Clock size={14} color={user.onTimeRate >= 0.95 ? colors.statusOpen : colors.warning} />
            <Text style={styles.repLabel}>{Math.round(user.onTimeRate * 100)}% on-time</Text>
          </View>
          <View style={styles.repItem}>
            <Star size={14} color={colors.mediumGray} />
            <Text style={styles.repLabel}>{user.accountAge}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.circlesCount}</Text>
            <Text style={styles.statLabel}>Circles</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>${user.totalSaved.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.joinedDate}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        {availableTabs.map(tab => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            {tab === 'storefront' && <Store size={16} color={activeTab === tab ? colors.black : colors.mediumGray} />}
            {tab === 'posts' && <MessageSquare size={16} color={activeTab === tab ? colors.black : colors.mediumGray} />}
            {tab === 'circles' && <CircleDot size={16} color={activeTab === tab ? colors.black : colors.mediumGray} />}
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'storefront' && user.isBusinessOwner && (
          <>
            {user.storefrontListings.length > 0 ? (
              user.storefrontListings.map(renderStorefrontItem)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No listings yet</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'posts' && (
          <>
            {userPosts.length > 0 ? (
              userPosts.map(renderPost)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No posts yet</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'circles' && (
          <>
            {userCircles.length > 0 ? (
              userCircles.map(renderCircle)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Not in any circles</Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={{ height: 40 }} />

      <DeployDetailModal
        opportunity={selectedOpportunity}
        visible={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedOpportunity(null);
        }}
        onNavigateToUser={(navUserId) => {
          setShowDetailModal(false);
          setSelectedOpportunity(null);
          if (navUserId !== userId) {
            router.push(`/user/${navUserId}`);
          }
        }}
      />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    color: colors.mediumGray,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.accent,
  },
  username: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.black,
    marginTop: 10,
  },
  bio: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  reputationRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.extraLightGray,
    borderRadius: 12,
  },
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  repLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.black,
  },
  statLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.lightGray,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: colors.extraLightGray,
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.mediumGray,
  },
  tabTextActive: {
    color: colors.black,
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  listingCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: 140,
  },
  listingBody: {
    padding: 14,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  listingTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 4,
  },
  listingDesc: {
    fontSize: 13,
    color: colors.mediumGray,
    lineHeight: 19,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.accent,
  },
  fundingSection: {
    marginBottom: 8,
  },
  fundingBar: {
    height: 5,
    backgroundColor: colors.extraLightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fundingFill: {
    height: 5,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  fundingText: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 4,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supportCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  supportText: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  listingTags: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    backgroundColor: colors.extraLightGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  postCard: {
    marginBottom: 10,
  },
  postContent: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 21,
    marginBottom: 8,
  },
  hashtag: {
    color: colors.accent,
    fontWeight: '600' as const,
  },
  mention: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lightGray,
    paddingTop: 6,
  },
  postTime: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  circleRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleEmoji: {
    fontSize: 24,
  },
  circleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  circleName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.black,
  },
  circleDetail: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: colors.mediumGray,
  },
});
