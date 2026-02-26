import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { MessageCircle, Video, BarChart3, UserPlus, DollarSign, Calendar, Users, CheckCircle, XCircle, Vote, Vault, BookOpen, ChevronRight, Shield, Clock, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import StatusRing from '@/components/StatusRing';
import ReputationBadge from '@/components/ReputationBadge';
import { circlesService } from '@/services/circlesService';
import { JoinRequest } from '@/types';

export default function CircleDetailScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { circleId } = useLocalSearchParams<{ circleId: string }>();
  const router = useRouter();
  const circle = useMemo(() => circlesService.getCircleById(circleId ?? ''), [circleId]);
  const [showPayoutPlan, setShowPayoutPlan] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);

  if (!circle) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text style={styles.errorText}>Circle not found</Text>
      </View>
    );
  }

  const seatsLeft = circle.totalSeats - circle.filledSeats;
  const progress = circle.currentMonth / 4;
  const payoutAmount = circle.contribution * 4;

  const handleAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(action, `${action} feature coming soon!`);
  };

  const handleApproveRequest = (request: JoinRequest) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Approved', `${request.username} has been approved to join!`);
  };

  const handleDeclineRequest = (request: JoinRequest) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Declined', `${request.username}'s request has been declined.`);
  };

  const handleRequestToJoin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(circles)/join?circleId=${circleId}`);
  };

  const handleVote = (option: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowVoteModal(false);
    Alert.alert('Vote Cast', `You voted to "${option}". Results will be shared when all members vote.`);
  };

  const handlePlanPayout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPayoutPlan(true);
  };

  const handleMemberPress = (memberId: string) => {
    router.push(`/user/${memberId}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: circle.name }} />

      <View style={styles.heroSection}>
        <StatusRing avatar={circle.avatar} status={circle.status === 'recruiting' ? 'open' : 'locked'} size={72} />
        <Text style={styles.circleName}>{circle.name}</Text>
        <Text style={styles.circleDesc}>{circle.description}</Text>
        <View style={styles.chipRow}>
          <View style={[styles.statusChip, { backgroundColor: (circle.status === 'active' ? colors.statusOpen : circle.status === 'recruiting' ? colors.warning : colors.primary) + '15' }]}>
            <Text style={[styles.statusChipText, { color: circle.status === 'active' ? colors.statusOpen : circle.status === 'recruiting' ? colors.warning : colors.primary }]}>
              {circle.status === 'recruiting' ? 'Recruiting' : circle.status === 'active' ? 'Active' : circle.status === 'voting' ? 'Voting' : 'Completed'}
            </Text>
          </View>
          <View style={styles.fixedChip}>
            <Text style={styles.fixedChipText}>4 Members · 4 Months</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <GlassCard style={styles.statCard}>
          <DollarSign size={18} color={colors.accent} />
          <Text style={styles.statValue}>${circle.contribution}</Text>
          <Text style={styles.statLabel}>Monthly</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <Calendar size={18} color={colors.primary} />
          <Text style={styles.statValue}>{circle.currentMonth}/4</Text>
          <Text style={styles.statLabel}>Month</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <DollarSign size={18} color={colors.statusOpen} />
          <Text style={styles.statValue}>${payoutAmount}</Text>
          <Text style={styles.statLabel}>Payout</Text>
        </GlassCard>
      </View>

      <GlassCard style={styles.section}>
        <Text style={styles.sectionTitle}>Cycle Progress</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={styles.poolRow}>
          <Text style={styles.poolLabel}>Total Pool</Text>
          <Text style={styles.poolValue}>${circle.totalPool.toLocaleString()}</Text>
        </View>
        <View style={styles.poolRow}>
          <Text style={styles.poolLabel}>Next Payout</Text>
          <Text style={styles.poolValue}>{circle.nextPayoutDate}</Text>
        </View>
        {circle.nextPayoutMember && (
          <View style={styles.poolRow}>
            <Text style={styles.poolLabel}>Next Recipient</Text>
            <Text style={[styles.poolValue, { color: colors.accent }]}>{circle.nextPayoutMember}</Text>
          </View>
        )}
        {circle.vaultContribution > 0 && (
          <View style={styles.poolRow}>
            <Text style={styles.poolLabel}>Vault Contribution</Text>
            <Text style={styles.poolValue}>${circle.vaultContribution}/payout</Text>
          </View>
        )}
      </GlassCard>

      <GlassCard style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payout Schedule</Text>
        </View>
        {circle.members.map((member, index) => {
          const isPaid = index < circle.currentMonth;
          const isCurrent = index === circle.currentMonth;
          return (
            <Pressable key={member.id} style={styles.payoutRow} onPress={() => handleMemberPress(member.id)}>
              <View style={[styles.payoutMonth, { backgroundColor: isPaid ? colors.statusOpen + '15' : isCurrent ? colors.primary + '15' : colors.extraLightGray }]}>
                <Text style={[styles.payoutMonthText, { color: isPaid ? colors.statusOpen : isCurrent ? colors.primary : colors.mediumGray }]}>
                  M{index + 1}
                </Text>
              </View>
              <Image source={{ uri: member.avatar }} style={styles.payoutAvatar} />
              <View style={styles.payoutInfo}>
                <Text style={styles.payoutName}>{member.username}</Text>
                <Text style={styles.payoutStatus}>
                  {isPaid ? 'Paid out' : isCurrent ? 'Next payout' : 'Upcoming'}
                </Text>
              </View>
              <Text style={[styles.payoutAmount, { color: isPaid ? colors.statusOpen : isCurrent ? colors.primary : colors.mediumGray }]}>
                ${payoutAmount}
              </Text>
            </Pressable>
          );
        })}
      </GlassCard>

      <GlassCard style={styles.section}>
        <Text style={styles.sectionTitle}>Members ({circle.filledSeats}/4)</Text>
        {circle.members.map((member) => (
          <Pressable key={member.id} style={styles.memberRow} onPress={() => handleMemberPress(member.id)}>
            <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.username}</Text>
              <ReputationBadge
                completedCycles={member.completedCycles}
                onTimeRate={member.onTimeRate}
                accountAge={member.accountAge}
                compact
              />
            </View>
            {member.hasPaid ? (
              <CheckCircle size={18} color={colors.statusOpen} />
            ) : (
              <XCircle size={18} color={colors.mediumGray} />
            )}
          </Pressable>
        ))}
      </GlassCard>

      {circle.pendingRequests.length > 0 && (
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Join Requests ({circle.pendingRequests.length})</Text>
          {circle.pendingRequests.map((request) => (
            <View key={request.id} style={styles.requestRow}>
              <Image source={{ uri: request.avatar }} style={styles.memberAvatar} />
              <View style={styles.requestInfo}>
                <Text style={styles.memberName}>{request.username}</Text>
                <View style={styles.requestReputation}>
                  <View style={styles.repItem}>
                    <Shield size={11} color={colors.accent} />
                    <Text style={styles.repText}>{request.completedCycles} cycles</Text>
                  </View>
                  <View style={styles.repItem}>
                    <Clock size={11} color={request.onTimeRate >= 0.95 ? colors.statusOpen : colors.warning} />
                    <Text style={styles.repText}>{Math.round(request.onTimeRate * 100)}%</Text>
                  </View>
                  <View style={styles.repItem}>
                    <Star size={11} color={colors.mediumGray} />
                    <Text style={styles.repText}>{request.accountAge}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.requestActions}>
                <Pressable
                  style={styles.approveBtn}
                  onPress={() => handleApproveRequest(request)}
                >
                  <CheckCircle size={18} color={colors.statusOpen} />
                </Pressable>
                <Pressable
                  style={styles.declineBtn}
                  onPress={() => handleDeclineRequest(request)}
                >
                  <XCircle size={18} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          ))}
        </GlassCard>
      )}

      {circle.status === 'recruiting' && seatsLeft > 0 && (
        <View style={styles.actionsGrid}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.actionPrimary, pressed && { opacity: 0.9 }]}
            onPress={handleRequestToJoin}
          >
            <UserPlus size={20} color={colors.white} />
            <Text style={styles.actionButtonTextPrimary}>Request to Join</Text>
          </Pressable>
        </View>
      )}

      {circle.status === 'active' && (
        <View style={styles.actionsGrid}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.actionPrimary, pressed && { opacity: 0.9 }]}
            onPress={() => handleAction('Make Contribution')}
          >
            <DollarSign size={20} color={colors.white} />
            <Text style={styles.actionButtonTextPrimary}>Contribute ${circle.contribution}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.actionOutline, pressed && { opacity: 0.9 }]}
            onPress={handlePlanPayout}
          >
            <BookOpen size={20} color={colors.accent} />
            <Text style={[styles.actionButtonText, { color: colors.accent }]}>Plan Payout</Text>
          </Pressable>
        </View>
      )}

      {circle.status === 'voting' && (
        <View style={styles.actionsGrid}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.actionVote, pressed && { opacity: 0.9 }]}
            onPress={() => setShowVoteModal(true)}
          >
            <Vote size={20} color={colors.white} />
            <Text style={styles.actionButtonTextPrimary}>Vote on Next Steps</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.toolsRow}>
        <Pressable style={styles.toolBtn} onPress={() => handleAction('Chat')}>
          <MessageCircle size={22} color={colors.darkGray} />
          <Text style={styles.toolText}>Chat</Text>
        </Pressable>
        <Pressable style={styles.toolBtn} onPress={() => handleAction('Video Call')}>
          <Video size={22} color={colors.darkGray} />
          <Text style={styles.toolText}>Video</Text>
        </Pressable>
        <Pressable style={styles.toolBtn} onPress={() => handleAction('Analytics')}>
          <BarChart3 size={22} color={colors.darkGray} />
          <Text style={styles.toolText}>Analytics</Text>
        </Pressable>
      </View>

      <Modal visible={showVoteModal} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.voteModal}>
            <Text style={styles.voteTitle}>Cycle Complete!</Text>
            <Text style={styles.voteSubtitle}>All 4 payouts have been distributed. What would you like to do next?</Text>

            <Pressable style={[styles.voteOption, { borderColor: colors.statusOpen }]} onPress={() => handleVote('Start Another Cycle')}>
              <Text style={styles.voteOptionTitle}>Start Another Cycle</Text>
              <Text style={styles.voteOptionDesc}>Run another 4-month round with the same members</Text>
            </Pressable>

            <Pressable style={[styles.voteOption, { borderColor: colors.accent }]} onPress={() => handleVote('Create a Vault')}>
              <Vault size={18} color={colors.accent} />
              <View style={styles.voteOptionContent}>
                <Text style={styles.voteOptionTitle}>Pool into a Vault</Text>
                <Text style={styles.voteOptionDesc}>Combine contributions into a shared vault for a business venture or cause</Text>
              </View>
            </Pressable>

            <Pressable style={[styles.voteOption, { borderColor: colors.mediumGray }]} onPress={() => handleVote('End Circle')}>
              <Text style={styles.voteOptionTitle}>Take Payouts & End</Text>
              <Text style={styles.voteOptionDesc}>Each member keeps their payout and the circle closes</Text>
            </Pressable>

            <Pressable style={styles.voteCancelBtn} onPress={() => setShowVoteModal(false)}>
              <Text style={styles.voteCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showPayoutPlan} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.voteModal}>
            <Text style={styles.voteTitle}>Plan Your Payout</Text>
            <Text style={styles.voteSubtitle}>Your upcoming payout: ${payoutAmount}</Text>

            {circle.vaultContribution > 0 && (
              <View style={styles.planRow}>
                <Text style={styles.planLabel}>Vault Contribution</Text>
                <Text style={styles.planValue}>-${circle.vaultContribution}</Text>
              </View>
            )}
            <View style={styles.planRow}>
              <Text style={styles.planLabel}>Personal Amount</Text>
              <Text style={[styles.planValue, { color: colors.statusOpen }]}>${payoutAmount - circle.vaultContribution}</Text>
            </View>

            <View style={styles.planDivider} />

            <Text style={styles.planSectionTitle}>Recommended Learning</Text>
            <Pressable style={styles.planCard} onPress={() => { setShowPayoutPlan(false); router.push('/(tabs)/learn'); }}>
              <BookOpen size={18} color={colors.accent} />
              <View style={styles.planCardContent}>
                <Text style={styles.planCardTitle}>Smart Payout Strategies</Text>
                <Text style={styles.planCardDesc}>Learn how to maximize your ${payoutAmount} payout</Text>
              </View>
              <ChevronRight size={16} color={colors.mediumGray} />
            </Pressable>

            <Text style={styles.planSectionTitle}>Deploy Opportunities</Text>
            <Pressable style={styles.planCard} onPress={() => { setShowPayoutPlan(false); router.push('/(tabs)/deploy'); }}>
              <DollarSign size={18} color={colors.primary} />
              <View style={styles.planCardContent}>
                <Text style={styles.planCardTitle}>Opportunities under ${payoutAmount}</Text>
                <Text style={styles.planCardDesc}>Browse businesses and causes matching your payout</Text>
              </View>
              <ChevronRight size={16} color={colors.mediumGray} />
            </Pressable>

            <Pressable style={styles.voteCancelBtn} onPress={() => setShowPayoutPlan(false)}>
              <Text style={styles.voteCancelText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    color: colors.mediumGray,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  circleName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.black,
    marginTop: 12,
    textAlign: 'center',
  },
  circleDesc: {
    fontSize: 14,
    color: colors.mediumGray,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  fixedChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.extraLightGray,
  },
  fixedChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.mediumGray,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.black,
  },
  statLabel: {
    fontSize: 11,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.extraLightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.accent,
    width: 40,
    textAlign: 'right',
  },
  poolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  poolLabel: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  poolValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.black,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  payoutMonth: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutMonthText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  payoutAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 10,
  },
  payoutInfo: {
    flex: 1,
    marginLeft: 10,
  },
  payoutName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.black,
  },
  payoutStatus: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  payoutAmount: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 10,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 2,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 10,
  },
  requestReputation: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 3,
  },
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  repText: {
    fontSize: 11,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    padding: 6,
    backgroundColor: colors.statusOpen + '12',
    borderRadius: 8,
  },
  declineBtn: {
    padding: 6,
    backgroundColor: colors.primary + '12',
    borderRadius: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionPrimary: {
    backgroundColor: colors.primary,
  },
  actionOutline: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  actionVote: {
    backgroundColor: colors.accent,
  },
  actionButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 16,
    marginHorizontal: 16,
  },
  toolBtn: {
    alignItems: 'center',
    gap: 4,
  },
  toolText: {
    fontSize: 12,
    color: colors.darkGray,
    fontWeight: '500' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  voteModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  voteTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.black,
    marginBottom: 6,
  },
  voteSubtitle: {
    fontSize: 14,
    color: colors.mediumGray,
    marginBottom: 20,
    lineHeight: 20,
  },
  voteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  voteOptionContent: {
    flex: 1,
  },
  voteOptionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.black,
  },
  voteOptionDesc: {
    fontSize: 13,
    color: colors.mediumGray,
    marginTop: 2,
  },
  voteCancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  voteCancelText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.mediumGray,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  planLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  planValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  planDivider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 16,
  },
  planSectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 8,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: colors.extraLightGray,
    borderRadius: 12,
    marginBottom: 12,
  },
  planCardContent: {
    flex: 1,
  },
  planCardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.black,
  },
  planCardDesc: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 1,
  },
  bottomPadding: {
    height: 30,
  },
});
