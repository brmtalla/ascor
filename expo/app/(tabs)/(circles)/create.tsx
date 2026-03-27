import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import { Users, DollarSign, Calendar, Info } from 'lucide-react-native';

export default function CreateCircleScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const router = useRouter();
  const [name, setName] = useState('');
  const [contribution, setContribution] = useState('');
  const [description, setDescription] = useState('');
  const [vaultContribution, setVaultContribution] = useState('');

  const handleCreate = useCallback(() => {
    if (!name.trim() || !contribution.trim()) {
      Alert.alert('Missing Fields', 'Please fill in circle name and contribution amount.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Circle Created!', `"${name}" has been created. Share the invite so 3 more members can request to join!`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [name, contribution, router]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.infoCard}>
        <Info size={18} color={colors.accent} />
        <Text style={styles.infoText}>
          All circles are fixed at 4 members and 4 months. One payout per month, rotating until everyone receives theirs.
        </Text>
      </View>

      <View style={styles.fixedParams}>
        <View style={styles.fixedItem}>
          <Users size={18} color={colors.primary} />
          <View>
            <Text style={styles.fixedValue}>4 Members</Text>
            <Text style={styles.fixedLabel}>Fixed size</Text>
          </View>
        </View>
        <View style={styles.fixedItem}>
          <Calendar size={18} color={colors.primary} />
          <View>
            <Text style={styles.fixedValue}>4 Months</Text>
            <Text style={styles.fixedLabel}>Fixed duration</Text>
          </View>
        </View>
        <View style={styles.fixedItem}>
          <DollarSign size={18} color={colors.primary} />
          <View>
            <Text style={styles.fixedValue}>Monthly</Text>
            <Text style={styles.fixedLabel}>Contribution cycle</Text>
          </View>
        </View>
      </View>

      <GlassCard style={styles.form}>
        <Text style={styles.label}>Circle Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Neighborhood Savers"
          placeholderTextColor={colors.mediumGray}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Monthly Contribution ($) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 200"
          placeholderTextColor={colors.mediumGray}
          keyboardType="numeric"
          value={contribution}
          onChangeText={setContribution}
        />

        {contribution ? (
          <View style={styles.payoutPreview}>
            <Text style={styles.payoutPreviewLabel}>Each member receives</Text>
            <Text style={styles.payoutPreviewAmount}>${(Number(contribution) * 4).toLocaleString()}</Text>
            <Text style={styles.payoutPreviewNote}>(${ contribution} x 4 members)</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Vault Contribution per Payout ($)</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional - e.g., 50"
          placeholderTextColor={colors.mediumGray}
          keyboardType="numeric"
          value={vaultContribution}
          onChangeText={setVaultContribution}
        />
        <Text style={styles.helperText}>
          Amount each member sets aside from their payout for a shared vault. Must be agreed before the first payout.
        </Text>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell people about this circle..."
          placeholderTextColor={colors.mediumGray}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />
      </GlassCard>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>How it works</Text>
        <Text style={styles.noteText}>1. You create the circle and set the contribution</Text>
        <Text style={styles.noteText}>2. Others request to join — you approve based on reputation</Text>
        <Text style={styles.noteText}>3. Once 4 members are in, the circle locks and payments begin</Text>
        <Text style={styles.noteText}>4. Each month, one member receives the full pool</Text>
        <Text style={styles.noteText}>5. After 4 months, members vote on next steps</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.9 }]}
        onPress={handleCreate}
        testID="create-circle-submit"
      >
        <Text style={styles.createBtnText}>Create Circle</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.accent + '10',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.accent,
    lineHeight: 19,
    fontWeight: '500' as const,
  },
  fixedParams: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  fixedItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  fixedValue: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.black,
  },
  fixedLabel: {
    fontSize: 10,
    color: colors.mediumGray,
  },
  form: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.darkGray,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: colors.extraLightGray,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 4,
    lineHeight: 17,
  },
  payoutPreview: {
    alignItems: 'center',
    backgroundColor: colors.statusOpen + '10',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  payoutPreviewLabel: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  payoutPreviewAmount: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.statusOpen,
    marginTop: 2,
  },
  payoutPreviewNote: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 2,
  },
  noteCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: colors.mediumGray,
    lineHeight: 22,
  },
  createBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
});
