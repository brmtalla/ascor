import { useTheme } from '@/contexts/ThemeContext';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  black: string;
  darkGray: string;
  mediumGray: string;
  lightGray: string;
  extraLightGray: string;
  white: string;
  background: string;
  cardBg: string;
  cardBorder: string;
  glassBg: string;
  glassBorder: string;
  shadowColor: string;
  overlay: string;
  statusOpen: string;
  statusLocked: string;
  tabActive: string;
  tabInactive: string;
}

export const LightColors: ThemeColors = {
  primary: '#E63946',
  primaryDark: '#C1121F',
  accent: '#1B998B',
  success: '#2DC653',
  warning: '#F4A261',
  danger: '#E63946',
  black: '#0A0A0A',
  darkGray: '#2D2D2D',
  mediumGray: '#6B7280',
  lightGray: '#E5E7EB',
  extraLightGray: '#F3F4F6',
  white: '#FFFFFF',
  background: '#F8F9FA',
  cardBg: 'rgba(255, 255, 255, 0.85)',
  cardBorder: 'rgba(255, 255, 255, 0.6)',
  glassBg: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.45)',
  shadowColor: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  statusOpen: '#2DC653',
  statusLocked: '#E63946',
  tabActive: '#E63946',
  tabInactive: '#9CA3AF',
};

export const DarkColors: ThemeColors = {
  primary: '#EF4444',
  primaryDark: '#DC2626',
  accent: '#2DD4BF',
  success: '#22C55E',
  warning: '#FB923C',
  danger: '#EF4444',
  black: '#F0F0F0',
  darkGray: '#D4D4D4',
  mediumGray: '#9CA3AF',
  lightGray: '#2D2D2D',
  extraLightGray: '#1F1F1F',
  white: '#1A1A1A',
  background: '#0F0F0F',
  cardBg: 'rgba(30, 30, 30, 0.9)',
  cardBorder: 'rgba(50, 50, 50, 0.6)',
  glassBg: 'rgba(25, 25, 25, 0.85)',
  glassBorder: 'rgba(50, 50, 50, 0.45)',
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  statusOpen: '#22C55E',
  statusLocked: '#EF4444',
  tabActive: '#EF4444',
  tabInactive: '#6B7280',
};

export function useColors(): ThemeColors {
  const { isDark } = useTheme();
  return isDark ? DarkColors : LightColors;
}

// Default export for backward compatibility during migration
const Colors = LightColors;
export default Colors;
