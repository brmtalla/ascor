import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ArrowUpRight, TrendingUp, Heart, User, Calendar, Package } from 'lucide-react-native';
import { useColors, type ThemeColors } from '@/constants/colors';
import GlassCard from './GlassCard';
import { OpportunityCard } from '@/types';

interface OpportunityCardViewProps {
  opportunity: OpportunityCard;
  onPress: () => void;
}

export default function OpportunityCardView({ opportunity, onPress }: OpportunityCardViewProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  const categoryColors: Record<string, string> = {
    business: colors.primary,
    cause: colors.accent,
    external: colors.darkGray,
  };

  const categoryLabels: Record<string, string> = {
    business: 'Business',
    cause: 'Cause',
    external: 'External',
  };

  const progress = opportunity.fundingGoal
    ? Math.min((opportunity.fundingRaised ?? 0) / opportunity.fundingGoal, 1)
    : 0;

  const isCause = opportunity.category === 'cause';
  const isService = opportunity.category === 'business' && opportunity.listingType === 'service';
  const isProduct = opportunity.category === 'business' && opportunity.listingType === 'product';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
      <GlassCard style={styles.card}>
        <Image source={{ uri: opportunity.image }} style={styles.image} />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.badgesRow}>
              <View style={[styles.categoryBadge, { backgroundColor: (categoryColors[opportunity.category] ?? colors.darkGray) + '15' }]}>
                <Text style={[styles.categoryText, { color: categoryColors[opportunity.category] ?? colors.darkGray }]}>
                  {categoryLabels[opportunity.category] ?? opportunity.category}
                </Text>
              </View>
              {isService && (
                <View style={[styles.typeBadge, { backgroundColor: '#6366F1' + '12' }]}>
                  <Calendar size={9} color="#6366F1" />
                  <Text style={[styles.typeBadgeText, { color: '#6366F1' }]}>Bookable</Text>
                </View>
              )}
              {isProduct && (
                <View style={[styles.typeBadge, { backgroundColor: colors.warning + '12' }]}>
                  <Package size={9} color={colors.warning} />
                  <Text style={[styles.typeBadgeText, { color: colors.warning }]}>Product</Text>
                </View>
              )}
            </View>
            {opportunity.externalUrl && <ArrowUpRight size={16} color={colors.mediumGray} />}
          </View>
          <Text style={styles.title} numberOfLines={1}>{opportunity.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{opportunity.description}</Text>

          {opportunity.ownerUsername && (
            <Pressable style={styles.ownerRow}>
              {opportunity.ownerAvatar ? (
                <Image source={{ uri: opportunity.ownerAvatar }} style={styles.ownerAvatar} />
              ) : (
                <View style={styles.ownerAvatarFallback}><User size={12} color={colors.mediumGray} /></View>
              )}
              <Text style={styles.ownerName}>{opportunity.ownerUsername}</Text>
            </Pressable>
          )}

          {opportunity.price != null && !isCause && (
            <View style={styles.priceRow}>
              <TrendingUp size={14} color={colors.accent} />
              <Text style={styles.price}>
                {opportunity.price >= 1000
                  ? `${(opportunity.price / 1000).toFixed(opportunity.price % 1000 === 0 ? 0 : 1)}k`
                  : `${opportunity.price}`
                }
                {isService && opportunity.duration && (
                  <Text style={styles.priceUnit}> / {opportunity.duration}</Text>
                )}
                {isProduct && (
                  <Text style={styles.priceUnit}> each</Text>
                )}
                {!isService && !isProduct && opportunity.category === 'business' && opportunity.ownerId && (
                  <Text style={styles.priceUnit}> / session</Text>
                )}
              </Text>
            </View>
          )}

          {isCause && opportunity.fundingGoal != null && (
            <View style={styles.causeFunding}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
              </View>
              <View style={styles.causeFundingRow}>
                <Text style={styles.causeFundingAmount}>
                  ${((opportunity.fundingRaised ?? 0) / 1000).toFixed(1)}k raised
                </Text>
                <Text style={styles.causeFundingGoal}>
                  of ${(opportunity.fundingGoal / 1000).toFixed(0)}k goal
                </Text>
              </View>
              {opportunity.fundingContributors && opportunity.fundingContributors.length > 0 && (
                <View style={styles.contributorAvatarsRow}>
                  {opportunity.fundingContributors.slice(0, 5).map((c, i) => (
                    <Image key={c.id} source={{ uri: c.avatar }} style={[styles.miniAvatar, { marginLeft: i > 0 ? -6 : 0, borderColor: colors.white }]} />
                  ))}
                  <Text style={styles.contributorCount}>{opportunity.fundingContributors.length} contributors</Text>
                </View>
              )}
            </View>
          )}

          {!isCause && opportunity.fundingGoal != null && (
            <View style={styles.fundingSection}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <View style={styles.fundingRow}>
                <Text style={styles.fundingText}>${((opportunity.fundingRaised ?? 0) / 1000).toFixed(0)}k raised</Text>
                <Text style={styles.fundingGoal}>of ${(opportunity.fundingGoal / 1000).toFixed(0)}k goal</Text>
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <View style={styles.tags}>
              {opportunity.tags.slice(0, 3).map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            {opportunity.supportCount != null && opportunity.supportCount > 0 && (
              <View style={styles.supportRow}>
                <Heart size={11} color={colors.mediumGray} />
                <Text style={styles.supportText}>{opportunity.supportCount}</Text>
              </View>
            )}
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 12, padding: 0, overflow: 'hidden' },
  image: { width: '100%', height: 140 },
  content: { padding: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  badgesRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  typeBadgeText: { fontSize: 10, fontWeight: '600' as const },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  categoryText: { fontSize: 11, fontWeight: '600' as const },
  title: { fontSize: 16, fontWeight: '700' as const, color: colors.black, marginBottom: 4 },
  description: { fontSize: 13, color: colors.mediumGray, lineHeight: 18, marginBottom: 8 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  ownerAvatar: { width: 20, height: 20, borderRadius: 10 },
  ownerAvatarFallback: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.extraLightGray, alignItems: 'center', justifyContent: 'center' },
  ownerName: { fontSize: 12, fontWeight: '600' as const, color: colors.darkGray },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  price: { fontSize: 18, fontWeight: '700' as const, color: colors.accent },
  priceUnit: { fontSize: 13, fontWeight: '400' as const, color: colors.mediumGray },
  causeFunding: { marginBottom: 8 },
  progressBarBg: { height: 8, backgroundColor: colors.extraLightGray, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressBarFill: { height: 8, backgroundColor: colors.accent, borderRadius: 4 },
  causeFundingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  causeFundingAmount: { fontSize: 13, fontWeight: '700' as const, color: colors.accent },
  causeFundingGoal: { fontSize: 12, color: colors.mediumGray },
  contributorAvatarsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniAvatar: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5 },
  contributorCount: { fontSize: 11, color: colors.mediumGray, marginLeft: 2 },
  fundingSection: { marginBottom: 8 },
  progressBg: { height: 5, backgroundColor: colors.extraLightGray, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, backgroundColor: colors.accent, borderRadius: 3 },
  fundingRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  fundingText: { fontSize: 12, fontWeight: '600' as const, color: colors.accent },
  fundingGoal: { fontSize: 12, color: colors.mediumGray },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tags: { flexDirection: 'row', gap: 6, flex: 1 },
  tag: { backgroundColor: colors.extraLightGray, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, color: colors.mediumGray, fontWeight: '500' as const },
  supportRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  supportText: { fontSize: 11, color: colors.mediumGray },
});
