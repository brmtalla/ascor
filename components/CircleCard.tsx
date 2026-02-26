import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Users, DollarSign } from 'lucide-react-native';
import { useColors, type ThemeColors } from '@/constants/colors';
import GlassCard from './GlassCard';
import StatusRing from './StatusRing';
import { Circle } from '@/types';

interface CircleCardProps {
  circle: Circle;
  onPress: () => void;
}

function CircleCard({ circle, onPress }: CircleCardProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  const statusColors: Record<string, string> = {
    recruiting: colors.warning,
    active: colors.statusOpen,
    completed: colors.accent,
    voting: colors.primary,
  };

  const statusLabels: Record<string, string> = {
    recruiting: 'Recruiting',
    active: 'Active',
    completed: 'Completed',
    voting: 'Voting',
  };

  const statusColor = statusColors[circle.status] ?? colors.mediumGray;
  const progress = circle.totalSeats > 0 ? circle.currentMonth / 4 : 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
      <GlassCard style={styles.card}>
        <View style={styles.row}>
          <StatusRing avatar={circle.avatar} status={circle.status === 'recruiting' ? 'open' : 'locked'} />
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={1}>{circle.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {statusLabels[circle.status] ?? circle.status}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.contribution}>${circle.contribution}</Text>
              <Text style={styles.metaLabel}>/month</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaLabel}>Cycle {circle.currentMonth}/4</Text>
            </View>

            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Users size={12} color={colors.mediumGray} />
                <Text style={styles.detailText}>{circle.filledSeats}/4 members</Text>
              </View>
              {circle.nextPayoutMember && (
                <View style={styles.detailItem}>
                  <DollarSign size={12} color={colors.accent} />
                  <Text style={[styles.detailText, { color: colors.accent }]}>Next: {circle.nextPayoutMember}</Text>
                </View>
              )}
            </View>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: statusColor }]} />
            </View>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

export default React.memo(CircleCard);

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  content: { flex: 1, marginLeft: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '700' as const, color: colors.black, flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '600' as const },
  metaRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  contribution: { fontSize: 17, fontWeight: '700' as const, color: colors.accent },
  metaLabel: { fontSize: 12, color: colors.mediumGray, marginLeft: 2 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.lightGray, marginHorizontal: 8, alignSelf: 'center' },
  details: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  detailText: { fontSize: 12, color: colors.mediumGray, fontWeight: '500' as const },
  progressBarBg: { height: 4, backgroundColor: colors.extraLightGray, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: 4, borderRadius: 2 },
});
