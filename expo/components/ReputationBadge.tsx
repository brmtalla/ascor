import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Clock, Star } from 'lucide-react-native';
import { useColors, type ThemeColors } from '@/constants/colors';

interface ReputationBadgeProps {
  completedCycles: number;
  onTimeRate: number;
  accountAge: string;
  compact?: boolean;
}

function ReputationBadge({ completedCycles, onTimeRate, accountAge, compact = false }: ReputationBadgeProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const ratingColor = onTimeRate >= 0.95 ? colors.statusOpen : onTimeRate >= 0.85 ? colors.warning : colors.primary;

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <View style={[styles.compactBadge, { backgroundColor: ratingColor + '15' }]}>
          <Star size={10} color={ratingColor} />
          <Text style={[styles.compactText, { color: ratingColor }]}>{Math.round(onTimeRate * 100)}%</Text>
        </View>
        <Text style={styles.compactCycles}>{completedCycles} cycles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Shield size={14} color={colors.accent} />
        <Text style={styles.label}>{completedCycles} cycles</Text>
      </View>
      <View style={styles.item}>
        <Clock size={14} color={ratingColor} />
        <Text style={[styles.label, { color: ratingColor }]}>{Math.round(onTimeRate * 100)}% on-time</Text>
      </View>
      <View style={styles.item}>
        <Star size={14} color={colors.mediumGray} />
        <Text style={styles.label}>{accountAge}</Text>
      </View>
    </View>
  );
}

export default React.memo(ReputationBadge);

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: { fontSize: 12, color: colors.mediumGray, fontWeight: '500' as const },
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  compactBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  compactText: { fontSize: 11, fontWeight: '600' as const },
  compactCycles: { fontSize: 11, color: colors.mediumGray, fontWeight: '500' as const },
});
