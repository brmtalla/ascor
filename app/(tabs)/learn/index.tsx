import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Clock, BookOpen, CheckCircle, Star, Users, TrendingUp, Filter, PlayCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import { learnService } from '@/services/learnService';
import { LearnModule, LearnCategory } from '@/types';

const CATEGORIES: { key: LearnCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '📚' },
  { key: 'circles', label: 'Circles', icon: '🔄' },
  { key: 'investing', label: 'Investing', icon: '📈' },
  { key: 'stocks', label: 'Stocks', icon: '💹' },
  { key: 'bonds', label: 'Bonds', icon: '🏛️' },
  { key: 'trading', label: 'Trading', icon: '⚡' },
  { key: 'savings', label: 'HYSAs', icon: '🏦' },
  { key: 'crypto', label: 'Crypto', icon: '₿' },
  { key: 'real-estate', label: 'Real Estate', icon: '🏠' },
  { key: 'budgeting', label: 'Budgeting', icon: '💰' },
];

export default function LearnScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const router = useRouter();
  const modules = learnService.getModules();
  const [activeCategory, setActiveCategory] = useState<LearnCategory>('all');

  const DIFFICULTY_COLORS = {
    beginner: colors.statusOpen,
    intermediate: colors.warning,
    advanced: colors.primary,
  } as const;

  const filteredModules = useMemo(() => {
    if (activeCategory === 'all') return modules;
    return modules.filter(m => m.category === activeCategory);
  }, [modules, activeCategory]);

  const completedCount = useMemo(() => modules.filter(m => m.completed).length, [modules]);

  // Find the next uncompleted module for the "Coming Up" card
  const nextModule = useMemo(() => modules.find(m => !m.completed), [modules]);

  const handleModulePress = useCallback((mod: LearnModule) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/learn/${mod.id}`);
  }, [router]);

  const handleCategoryPress = useCallback((cat: LearnCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(cat);
  }, []);

  const renderModule = useCallback(({ item }: { item: LearnModule }) => {
    const diffColor = DIFFICULTY_COLORS[item.difficulty];

    return (
      <Pressable
        onPress={() => handleModulePress(item)}
        style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        testID={`module-${item.id}`}
      >
        <GlassCard style={styles.moduleCard}>
          <Image source={{ uri: item.image }} style={styles.moduleImage} />
          <View style={styles.moduleOverlay}>
            <View style={[styles.diffBadge, { backgroundColor: diffColor + '20' }]}>
              <Text style={[styles.diffText, { color: diffColor }]}>{item.difficulty}</Text>
            </View>
            {item.completed && (
              <View style={styles.completedOverlay}>
                <CheckCircle size={16} color={colors.white} />
              </View>
            )}
          </View>
          <View style={styles.moduleContent}>
            <Text style={styles.moduleTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.moduleSummary} numberOfLines={2}>{item.summary}</Text>

            <View style={styles.authorRow}>
              <Image source={{ uri: item.authorAvatar }} style={styles.authorAvatar} />
              <Text style={styles.authorName}>{item.author}</Text>
            </View>

            <View style={styles.moduleMeta}>
              <View style={styles.metaItem}>
                <Clock size={12} color={colors.mediumGray} />
                <Text style={styles.metaText}>{item.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <BookOpen size={12} color={colors.mediumGray} />
                <Text style={styles.metaText}>{item.lessons} lessons</Text>
              </View>
              <View style={styles.metaItem}>
                <Star size={12} color={colors.warning} fill={colors.warning} />
                <Text style={styles.metaText}>{item.rating}</Text>
              </View>
              <View style={styles.metaItem}>
                <Users size={12} color={colors.mediumGray} />
                <Text style={styles.metaText}>{item.enrolledCount >= 1000 ? `${(item.enrolledCount / 1000).toFixed(1)}k` : item.enrolledCount}</Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </Pressable>
    );
  }, [handleModulePress]);

  const ListHeader = useMemo(() => (
    <>
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Financial Freedom</Text>
            <Text style={styles.headerSubtitle}>Master the strategies that build generational wealth</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressLeft}>
            <TrendingUp size={18} color={colors.accent} />
            <View>
              <Text style={styles.progressValue}>{completedCount}/{modules.length}</Text>
              <Text style={styles.progressLabel}>modules completed</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(completedCount / modules.length) * 100}%` }]} />
          </View>
        </View>
      </View>

      {/* Coming Up Card */}
      {nextModule && (
        <Pressable
          onPress={() => handleModulePress(nextModule)}
          style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        >
          <View style={styles.comingUpCard}>
            <View style={styles.comingUpBadge}>
              <Text style={styles.comingUpBadgeText}>COMING UP</Text>
            </View>
            <Text style={styles.comingUpTitle}>{nextModule.title}</Text>
            <Text style={styles.comingUpDesc}>{nextModule.summary}</Text>
            <View style={styles.comingUpBtn}>
              <PlayCircle size={18} color={colors.black} />
              <Text style={styles.comingUpBtnText}>Start Now</Text>
            </View>
          </View>
        </Pressable>
      )}

      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.key}
              style={[styles.filterChip, activeCategory === cat.key && styles.filterChipActive]}
              onPress={() => handleCategoryPress(cat.key)}
            >
              <Text style={styles.filterEmoji}>{cat.icon}</Text>
              <Text style={[styles.filterText, activeCategory === cat.key && styles.filterTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.sectionLabel}>Modules</Text>
    </>
  ), [activeCategory, completedCount, nextModule, colors, styles]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Learn' }} />

      <FlatList
        data={filteredModules}
        keyExtractor={(item) => item.id}
        renderItem={renderModule}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No modules in this category yet</Text>
            <Text style={styles.emptySubtext}>Check back soon — new content drops weekly!</Text>
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
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.black,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.mediumGray,
    lineHeight: 20,
  },
  comingUpCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.darkGray,
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  comingUpBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 14,
  },
  comingUpBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: colors.white,
    letterSpacing: 1.2,
  },
  comingUpTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.white,
    marginBottom: 8,
    lineHeight: 30,
  },
  comingUpDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 20,
  },
  comingUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  comingUpBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.black,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.black,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  progressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.black,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.extraLightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  filterChipActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.darkGray,
  },
  filterTextActive: {
    color: colors.white,
  },
  list: {
    paddingBottom: 20,
  },
  moduleCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  moduleImage: {
    width: '100%',
    height: 140,
  },
  moduleOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'capitalize' as const,
  },
  completedOverlay: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.statusOpen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleContent: {
    padding: 14,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 6,
  },
  moduleSummary: {
    fontSize: 13,
    color: colors.mediumGray,
    lineHeight: 19,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  authorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.darkGray,
  },
  moduleMeta: {
    flexDirection: 'row',
    gap: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lightGray,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.black,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.mediumGray,
    textAlign: 'center',
    marginTop: 4,
  },
});
