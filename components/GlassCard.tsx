import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColors, type ThemeColors } from '@/constants/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GlassCard({ children, style }: GlassCardProps) {
  const colors = useColors();
  const dynamicStyles = createStyles(colors);

  return (
    <View style={[dynamicStyles.card, style]}>
      {children}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
});
