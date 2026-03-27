import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, Bell, CircleDot, Trophy, Users } from 'lucide-react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import CircleCard from '@/components/CircleCard';
import { circlesService } from '@/services/circlesService';
import { userService } from '@/services/userService';
import { Circle } from '@/types';

export default function CirclesScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const circles = circlesService.getCircles();
  const unreadCount = userService.getUnreadCount();
  const myCirclesCount = circles.length;
  const activeCount = circlesService.getActiveCount();
  const completedCount = circlesService.getCompletedCount();

  const filteredCircles = useMemo(() => {
    if (!searchQuery.trim()) return circles;
    return circlesService.searchCircles(searchQuery);
  }, [searchQuery, circles]);

  const handleCirclePress = useCallback((circle: Circle) => {
    router.push(`/(circles)/${circle.id}`);
  }, [router]);

  const handleCreatePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(circles)/create');
  }, [router]);

  const handleNotificationPress = useCallback(() => {
    router.push('/notifications');
  }, [router]);

  const handleMenuPress = useCallback(() => {
    router.push('/menu');
  }, [router]);

  const renderCircle = useCallback(({ item, index }: { item: Circle; index: number }) => (
    <CircleCard circle={item} onPress={() => handleCirclePress(item)} index={index} />
  ), [handleCirclePress]);

  const ListHeader = useMemo(() => (
    <>
      <View style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.primary + '12' }]}>
              <Users size={18} color={colors.primary} />
            </View>
            <Text style={styles.statNumber}>{myCirclesCount}</Text>
            <Text style={styles.statLabel}>MY CIRCLES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.statusOpen + '12' }]}>
              <CircleDot size={18} color={colors.statusOpen} />
            </View>
            <Text style={styles.statNumber}>{activeCount}</Text>
            <Text style={styles.statLabel}>ACTIVE</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.warning + '12' }]}>
              <Trophy size={18} color={colors.warning} />
            </View>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>COMPLETED</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [styles.createButton, pressed && { opacity: 0.9 }]}
            onPress={handleCreatePress}
          >
            <Plus size={16} color={colors.white} strokeWidth={2.5} />
            <Text style={styles.createButtonText}>Create Circle</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.joinButton, pressed && { opacity: 0.9 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(circles)/browse');
            }}
          >
            <Users size={16} color={colors.primary} />
            <Text style={styles.joinButtonText}>Browse Circles</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.mediumGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search circles..."
            placeholderTextColor={colors.mediumGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>My Circles</Text>
    </>
  ), [searchQuery, myCirclesCount, activeCount, completedCount, handleCreatePress, colors, styles]);

  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (unreadCount > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, { toValue: 1.3, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(badgePulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [unreadCount]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={handleNotificationPress} hitSlop={8} style={styles.headerBtn}>
              <Bell size={22} color={colors.black} />
              {unreadCount > 0 && (
                <Animated.View style={[styles.badge, { transform: [{ scale: badgePulse }] }]}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </Animated.View>
              )}
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleMenuPress} hitSlop={8} style={styles.headerBtn}>
              <View style={styles.menuIcon}>
                <View style={styles.menuDot} />
                <View style={styles.menuDot} />
                <View style={styles.menuDot} />
              </View>
            </Pressable>
          ),
          headerTitle: () => (
            <Text style={styles.headerTitle}>Ascor</Text>
          ),
        }}
      />

      <FlatList
        data={filteredCircles}
        keyExtractor={(item) => item.id}
        renderItem={renderCircle}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No circles found</Text>
            <Text style={styles.emptySubtext}>Try a different search or create one!</Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.black,
    letterSpacing: -0.5,
  },
  headerBtn: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  menuIcon: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: 28,
    height: 28,
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.black,
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.black,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.mediumGray,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.lightGray,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.white,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.black,
    padding: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.black,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  list: {
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.darkGray,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 4,
  },
});
