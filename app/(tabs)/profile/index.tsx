import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Wallet, ChevronRight, Shield, Lock, Edit3, Settings, Clock, Star, Store, MessageSquare, CircleDot, DollarSign, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import { userService } from '@/services/userService';
import { circlesService } from '@/services/circlesService';
import { socialService } from '@/services/socialService';
import { Vault, StorefrontListing, SocialPost, Circle } from '@/types';

type ProfileTab = 'storefront' | 'posts' | 'circles';

export default function ProfileScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const router = useRouter();
  const user = userService.getUser();
  const vaults = userService.getVaults();
  const myCircles = circlesService.getCircles().slice(0, 3);
  const myPosts = socialService.getPostsByUser(user.id);

  const availableTabs: ProfileTab[] = user.isBusinessOwner
    ? ['storefront', 'posts', 'circles']
    : ['posts', 'circles'];

  const [activeTab, setActiveTab] = useState<ProfileTab>(availableTabs[0]);

  const handleWallet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/profile/wallet');
  }, [router]);

  const handleEdit = useCallback(() => {
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
  }, []);

  const handleVaultPress = useCallback((vault: Vault) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/vault/${vault.id}`);
  }, [router]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerRight: () => (
            <Pressable onPress={() => router.push('/settings')} hitSlop={8} style={styles.headerBtn}>
              <View style={styles.headerIconCircle}>
                <Settings size={18} color={colors.black} />
              </View>
            </Pressable>
          ),
        }}
      />

      <View style={styles.profileHeader}>
        <View style={styles.avatarSection}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Pressable style={styles.editBtn} onPress={handleEdit}>
            <Edit3 size={14} color={colors.white} />
          </Pressable>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.userBio}>{user.bio}</Text>

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
            <Text style={styles.statLabel}>Total Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.joinedDate}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.walletBtn, pressed && { opacity: 0.9 }]}
        onPress={handleWallet}
      >
        <View style={styles.walletLeft}>
          <View style={styles.walletIcon}>
            <Wallet size={20} color={colors.white} />
          </View>
          <View>
            <Text style={styles.walletTitle}>Wallet</Text>
            <Text style={styles.walletBalance}>$4,200.00 available</Text>
          </View>
        </View>
        <ChevronRight size={20} color={colors.mediumGray} />
      </Pressable>

      {user.isBusinessOwner && (
        <Pressable
          style={({ pressed }) => [styles.shopBtn, pressed && { opacity: 0.9 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/shop');
          }}
        >
          <View style={styles.shopLeft}>
            <View style={styles.shopIcon}>
              <Store size={20} color={colors.white} />
            </View>
            <View>
              <Text style={styles.shopTitle}>My Shop</Text>
              <Text style={styles.shopSubtitle}>{user.storefrontListings.length} active listings</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.mediumGray} />
        </Pressable>
      )}

      <View style={styles.tabBar}>
        {availableTabs.map(tab => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            {tab === 'storefront' && <Store size={15} color={activeTab === tab ? colors.black : colors.mediumGray} />}
            {tab === 'posts' && <MessageSquare size={15} color={activeTab === tab ? colors.black : colors.mediumGray} />}
            {tab === 'circles' && <CircleDot size={15} color={activeTab === tab ? colors.black : colors.mediumGray} />}
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
              user.storefrontListings.map(listing => (
                <GlassCard key={listing.id} style={styles.listingCard}>
                  <Image source={{ uri: listing.image }} style={styles.listingImage} />
                  <View style={styles.listingBody}>
                    <View style={[styles.categoryBadge, { backgroundColor: listing.category === 'cause' ? colors.accent + '15' : colors.primary + '15' }]}>
                      <Text style={[styles.categoryText, { color: listing.category === 'cause' ? colors.accent : colors.primary }]}>{listing.category}</Text>
                    </View>
                    <Text style={styles.listingTitle}>{listing.title}</Text>
                    <Text style={styles.listingDesc} numberOfLines={2}>{listing.description}</Text>
                    {listing.price && <Text style={styles.listingPrice}>From ${listing.price}</Text>}
                    {listing.fundingGoal && (
                      <View style={styles.fundingSection}>
                        <View style={styles.fundingBar}>
                          <View style={[styles.fundingFill, { width: `${((listing.fundingRaised ?? 0) / listing.fundingGoal) * 100}%` }]} />
                        </View>
                        <Text style={styles.fundingText}>${((listing.fundingRaised ?? 0) / 1000).toFixed(0)}k / ${(listing.fundingGoal / 1000).toFixed(0)}k</Text>
                      </View>
                    )}
                  </View>
                </GlassCard>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No listings yet</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'posts' && (
          <>
            {myPosts.length > 0 ? (
              myPosts.map(post => (
                <GlassCard key={post.id} style={styles.postCard}>
                  <Text style={styles.postContent}>{post.content}</Text>
                  <View style={styles.postMeta}>
                    <Text style={styles.postTime}>{post.timestamp}</Text>
                    <View style={styles.postStats}>
                      <Heart size={13} color={colors.mediumGray} />
                      <Text style={styles.postStatText}>{post.likes}</Text>
                    </View>
                  </View>
                </GlassCard>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No posts yet</Text>
                <Text style={styles.emptySubtext}>Share updates with your circles!</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'circles' && (
          <>
            {myCircles.map(circle => (
              <Pressable key={circle.id} onPress={() => router.push(`/(circles)/${circle.id}`)}>
                <GlassCard style={styles.circleRow}>
                  <View style={styles.circleEmoji}>
                    <Text style={styles.emojiText}>{circle.avatar}</Text>
                  </View>
                  <View style={styles.circleInfo}>
                    <Text style={styles.circleName}>{circle.name}</Text>
                    <Text style={styles.circleDetail}>${circle.contribution}/month · {circle.status}</Text>
                  </View>
                  <ChevronRight size={18} color={colors.mediumGray} />
                </GlassCard>
              </Pressable>
            ))}
          </>
        )}
      </View>

      <Text style={styles.sectionHeader}>Vaults</Text>
      {vaults.map((vault: Vault) => {
        const progress = vault.raised / vault.goal;
        return (
          <Pressable key={vault.id} onPress={() => handleVaultPress(vault)}>
            <GlassCard style={styles.vaultCard}>
              <View style={styles.vaultHeader}>
                <Text style={styles.vaultIcon}>{vault.icon}</Text>
                <View style={styles.vaultInfo}>
                  <Text style={styles.vaultName}>{vault.name}</Text>
                  <Text style={styles.vaultMembers}>{vault.contributors.length} contributors</Text>
                </View>
                <View style={styles.vaultAmount}>
                  <Text style={styles.vaultSaved}>${vault.raised.toLocaleString()}</Text>
                  <Text style={styles.vaultGoal}>of ${vault.goal.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.vaultProgressBg}>
                <View style={[styles.vaultProgressFill, { width: `${Math.min(progress, 1) * 100}%` }]} />
              </View>
              {vault.status === 'milestones_met' && (
                <View style={styles.vaultStatusBadge}>
                  <Text style={styles.vaultStatusText}>All Milestones Met — Ready to Release</Text>
                </View>
              )}
            </GlassCard>
          </Pressable>
        );
      })}

      <View style={styles.securitySection}>
        <Pressable style={styles.menuItem} onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon.')}>
          <Shield size={18} color={colors.mediumGray} />
          <Text style={styles.menuItemText}>Privacy & Security</Text>
          <ChevronRight size={16} color={colors.mediumGray} />
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => Alert.alert('Auth', 'Two-factor auth coming soon.')}>
          <Lock size={18} color={colors.mediumGray} />
          <Text style={styles.menuItemText}>Authentication</Text>
          <ChevronRight size={16} color={colors.mediumGray} />
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBtn: {
    padding: 2,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  avatarSection: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  username: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.black,
    marginTop: 12,
  },
  userBio: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
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
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 16,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.black,
  },
  walletBalance: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600' as const,
    marginTop: 1,
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
    gap: 5,
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
    marginBottom: 16,
  },
  listingCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: 120,
  },
  listingBody: {
    padding: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 3,
  },
  listingDesc: {
    fontSize: 12,
    color: colors.mediumGray,
    lineHeight: 17,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.accent,
    marginTop: 6,
  },
  fundingSection: {
    marginTop: 6,
  },
  fundingBar: {
    height: 4,
    backgroundColor: colors.extraLightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fundingFill: {
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  fundingText: {
    fontSize: 11,
    color: colors.mediumGray,
    marginTop: 3,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.extraLightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  circleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  circleName: {
    fontSize: 14,
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
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 15,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.mediumGray,
    marginTop: 3,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.black,
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
  },
  vaultCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  vaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  vaultIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  vaultInfo: {
    flex: 1,
  },
  vaultName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.black,
  },
  vaultMembers: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  vaultAmount: {
    alignItems: 'flex-end',
  },
  vaultSaved: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.accent,
  },
  vaultGoal: {
    fontSize: 11,
    color: colors.mediumGray,
  },
  vaultProgressBg: {
    height: 5,
    backgroundColor: colors.extraLightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  vaultProgressFill: {
    height: 5,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  vaultStatusBadge: {
    marginTop: 8,
    backgroundColor: colors.statusOpen + '12',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  vaultStatusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.statusOpen,
  },
  securitySection: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.darkGray,
  },
  shopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 16,
  },
  shopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shopIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.black,
  },
  shopSubtitle: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600' as const,
    marginTop: 1,
  },
});
