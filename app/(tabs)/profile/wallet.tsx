import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import GlassCard from '@/components/GlassCard';

const TRANSACTIONS = [
  { id: 't1', type: 'contribution', description: 'Downtown Savers - Week 8', amount: -200, date: 'Feb 24, 2026' },
  { id: 't2', type: 'payout', description: 'Community Kitchen Payout', amount: 500, date: 'Feb 20, 2026' },
  { id: 't3', type: 'contribution', description: 'Startup Builders - Cycle 4', amount: -1000, date: 'Feb 17, 2026' },
  { id: 't4', type: 'contribution', description: 'Downtown Savers - Week 7', amount: -200, date: 'Feb 17, 2026' },
  { id: 't5', type: 'payout', description: 'Travel Squad Payout', amount: 3600, date: 'Feb 15, 2026' },
];

export default function WalletScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <GlassCard style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>$4,200.00</Text>
        <View style={styles.balanceActions}>
          <Pressable
            style={[styles.balanceBtn, styles.addBtn]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Add Funds', 'Fund transfer coming soon!'); }}
          >
            <ArrowDownLeft size={16} color={colors.white} />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
          <Pressable
            style={[styles.balanceBtn, styles.withdrawBtn]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Withdraw', 'Withdrawal coming soon!'); }}
          >
            <ArrowUpRight size={16} color={colors.primary} />
            <Text style={styles.withdrawBtnText}>Withdraw</Text>
          </Pressable>
        </View>
      </GlassCard>

      <View style={styles.upcomingSection}>
        <Text style={styles.sectionTitle}>Upcoming Payouts</Text>
        <GlassCard style={styles.upcomingCard}>
          <View style={styles.upcomingRow}>
            <View style={styles.upcomingIcon}>
              <Clock size={18} color={colors.primary} />
            </View>
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingName}>Downtown Savers</Text>
              <Text style={styles.upcomingDate}>Mar 5, 2026</Text>
            </View>
            <Text style={styles.upcomingAmount}>$1,600</Text>
          </View>
        </GlassCard>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {TRANSACTIONS.map(tx => (
        <GlassCard key={tx.id} style={styles.txCard}>
          <View style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: tx.amount > 0 ? colors.statusOpen + '18' : colors.extraLightGray }]}>
              {tx.amount > 0 ? (
                <ArrowDownLeft size={16} color={colors.statusOpen} />
              ) : (
                <ArrowUpRight size={16} color={colors.mediumGray} />
              )}
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txDesc}>{tx.description}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.amount > 0 ? colors.statusOpen : colors.darkGray }]}>
              {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toLocaleString()}
            </Text>
          </View>
        </GlassCard>
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  balanceCard: {
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 20,
    backgroundColor: colors.black,
    borderColor: colors.darkGray,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500' as const,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: colors.white,
    marginTop: 4,
    letterSpacing: -1,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  balanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addBtn: {
    backgroundColor: colors.accent,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.white,
  },
  withdrawBtn: {
    backgroundColor: colors.white,
  },
  withdrawBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  upcomingSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 10,
  },
  upcomingCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingInfo: {
    flex: 1,
    marginLeft: 10,
  },
  upcomingName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.black,
  },
  upcomingDate: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 1,
  },
  upcomingAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  txCard: {
    marginBottom: 8,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    marginLeft: 10,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.black,
  },
  txDate: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 1,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
