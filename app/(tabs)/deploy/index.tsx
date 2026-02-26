import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ShoppingCart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import OpportunityCardView from '@/components/OpportunityCardView';
import DeployDetailModal from '@/components/DeployDetailModal';
import { listingsService } from '@/services/listingsService';
import { OpportunityCard } from '@/types';
import { useCart } from '@/contexts/CartContext';

type FilterType = 'all' | 'business' | 'cause' | 'external';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'business', label: 'Business' },
  { key: 'cause', label: 'Causes' },
  { key: 'external', label: 'External' },
];

export default function DeployScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityCard | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const opportunities = listingsService.getOpportunities();
  const { totalItems } = useCart();

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return opportunities;
    return opportunities.filter(o => o.category === activeFilter);
  }, [activeFilter, opportunities]);

  const stats = useMemo(() => {
    const businesses = opportunities.filter(o => o.category === 'business').length;
    const causes = opportunities.filter(o => o.category === 'cause').length;
    const external = opportunities.filter(o => o.category === 'external').length;
    const totalRaised = opportunities
      .filter(o => o.category === 'cause')
      .reduce((sum, o) => sum + (o.fundingRaised ?? 0), 0);
    return { businesses, causes, external, totalRaised };
  }, [opportunities]);

  const handleFilterPress = useCallback((key: FilterType) => {
    Haptics.selectionAsync();
    setActiveFilter(key);
  }, []);

  const handleOpportunityPress = useCallback((opp: OpportunityCard) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOpportunity(opp);
    setModalVisible(true);
  }, []);

  const handleNavigateToUser = useCallback((userId: string) => {
    router.push(`/user/${userId}`);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: OpportunityCard }) => (
    <OpportunityCardView opportunity={item} onPress={() => handleOpportunityPress(item)} />
  ), [handleOpportunityPress]);

  const renderHeader = useCallback(() => (
    <View style={styles.headerSection}>
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.businesses}</Text>
            <Text style={styles.statLabel}>Businesses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.causes}</Text>
            <Text style={styles.statLabel}>Causes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              ${(stats.totalRaised / 1000).toFixed(1)}k
            </Text>
            <Text style={styles.statLabel}>Raised</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.external}</Text>
            <Text style={styles.statLabel}>External</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterBar}>
        {FILTERS.map(f => (
          <Pressable
            key={f.key}
            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
            onPress={() => handleFilterPress(f.key)}
          >
            <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  ), [stats, activeFilter, handleFilterPress]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: 'Deploy',
        headerRight: () => (
          <Pressable
            style={styles.cartHeaderBtn}
            onPress={() => router.push('/deploy/cart')}
            hitSlop={8}
          >
            <View style={styles.cartIconCircle}>
              <ShoppingCart size={18} color={colors.black} />
            </View>
            {totalItems > 0 && (
              <View style={styles.cartHeaderBadge}>
                <Text style={styles.cartHeaderBadgeText}>{totalItems}</Text>
              </View>
            )}
          </Pressable>
        ),
      }} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No opportunities found</Text>
          </View>
        }
      />

      <DeployDetailModal
        opportunity={selectedOpportunity}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onNavigateToUser={handleNavigateToUser}
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
    paddingBottom: 4,
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.black,
  },
  statLabel: {
    fontSize: 11,
    color: colors.mediumGray,
    marginTop: 2,
    fontWeight: '500' as const,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.lightGray,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
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
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.mediumGray,
  },
  filterTextActive: {
    color: colors.white,
  },
  list: {
    paddingBottom: 20,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.mediumGray,
  },
  cartHeaderBtn: {
    position: 'relative' as const,
  },
  cartIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cartHeaderBadge: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartHeaderBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: colors.white,
  },
});
