import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import {
  Settings,
  DollarSign,
  Users,
  ChevronRight,
  Calendar,
  User,
  Target,
  FileText,
  ImageIcon,
  MessageCircle,
  Send,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Upload,
  Link2,
  XCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import { userService } from '@/services/userService';
import { VaultContributor, VaultMilestone, VaultMediaItem, VaultMessage, VaultVote } from '@/types';

type TabType = 'milestones' | 'media' | 'messages' | 'contributors';

export default function VaultDetailScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { vaultId } = useLocalSearchParams<{ vaultId: string }>();
  const router = useRouter();
  const vault = useMemo(() => userService.getVaultById(vaultId ?? ''), [vaultId]);
  const [activeTab, setActiveTab] = useState<TabType>('milestones');
  const [messageText, setMessageText] = useState<string>('');
  const scrollRef = useRef<ScrollView>(null);

  const MILESTONE_STATUS_CONFIG = {
    verified: { color: colors.statusOpen, icon: CheckCircle2, label: 'Verified' },
    in_progress: { color: '#6366F1', icon: Clock, label: 'In Progress' },
    pending: { color: colors.mediumGray, icon: Circle, label: 'Pending' },
    rejected: { color: colors.danger, icon: XCircle, label: 'Rejected' },
  } as const;

  if (!vault) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text style={styles.errorText}>Vault not found</Text>
      </View>
    );
  }

  const progress = Math.min(vault.raised / vault.goal, 1);
  const isOverfunded = vault.raised > vault.goal;

  const milestonesProgress = useMemo(() => {
    const required = vault.milestones.filter(m => m.required);
    const verified = required.filter(m => m.status === 'verified');
    return { total: required.length, done: verified.length, allMet: required.length > 0 && verified.length === required.length };
  }, [vault.milestones]);

  const handleContribute = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Contribute', 'Contribution flow coming soon!');
  }, []);

  const handleReleaseFunds = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Release Funds',
      'All milestones verified and vote passed. Funds will be distributed to contributors according to the vault agreement.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm Release', onPress: () => Alert.alert('Funds Released!', 'All contributors have been notified.') },
      ]
    );
  }, []);

  const voteStats = useMemo(() => {
    const approvals = vault.votes.filter(v => v.vote === 'approve').length;
    const denials = vault.votes.filter(v => v.vote === 'deny').length;
    const totalVoters = vault.contributors.length;
    const voted = vault.votes.length;
    const majority = Math.ceil(totalVoters / 2);
    const passed = approvals >= majority;
    const currentUserVote = vault.votes.find(v => v.userId === 'u1');
    return { approvals, denials, totalVoters, voted, majority, passed, currentUserVote };
  }, [vault.votes, vault.contributors.length]);

  const handleVote = useCallback((vote: 'approve' | 'deny') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const label = vote === 'approve' ? 'Approve' : 'Deny';
    Alert.alert(
      `${label} Fund Release`,
      `You are voting to ${vote === 'approve' ? 'approve' : 'deny'} the release of ${vault.raised.toLocaleString()} from this vault.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: label,
          style: vote === 'deny' ? 'destructive' : 'default',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Vote Recorded', `Your ${vote} vote has been submitted.`);
          },
        },
      ]
    );
  }, [vault.raised]);

  const handleManage = useCallback(() => {
    Alert.alert('Manage Vault', 'Vault settings, milestone management, and distribution rules.');
  }, []);

  const handleUploadMedia = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Upload', 'Choose a file type to upload', [
      { text: 'Photo', onPress: () => Alert.alert('Camera roll access coming soon') },
      { text: 'Document', onPress: () => Alert.alert('Document picker coming soon') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!messageText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Message Sent', `"${messageText.trim()}" posted to vault chat.`);
    setMessageText('');
  }, [messageText]);

  const handleVerifyMilestone = useCallback((milestone: VaultMilestone) => {
    if (milestone.status === 'verified') {
      if (milestone.verificationDocId) {
        const doc = vault.media.find(m => m.id === milestone.verificationDocId);
        if (doc) {
          Alert.alert('Verification Document', `${doc.title}\n\n${doc.description ?? ''}\n\nUploaded: ${doc.uploadedDate}`);
        }
      }
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Verify Milestone',
      `Upload supporting documentation to verify "${milestone.title}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upload Document', onPress: () => Alert.alert('Document picker coming soon') },
      ]
    );
  }, [vault.media]);

  const renderContributor = useCallback((contributor: VaultContributor) => (
    <Pressable key={contributor.id} style={styles.contributorRow} onPress={() => router.push(`/user/${contributor.id}`)}>
      <Image source={{ uri: contributor.avatar }} style={styles.contributorAvatar} />
      <View style={styles.contributorInfo}>
        <Text style={styles.contributorName}>{contributor.username}</Text>
        <Text style={styles.contributorAmount}>${contributor.contributed.toLocaleString()} contributed</Text>
      </View>
      <ChevronRight size={16} color={colors.mediumGray} />
    </Pressable>
  ), [router]);

  const renderMilestone = useCallback((milestone: VaultMilestone, index: number) => {
    const config = MILESTONE_STATUS_CONFIG[milestone.status];
    const IconComponent = config.icon;
    const isLast = index === vault.milestones.length - 1;

    return (
      <View key={milestone.id} style={styles.milestoneItem}>
        <View style={styles.milestoneTimeline}>
          <View style={[styles.milestoneIconCircle, { backgroundColor: config.color + '15', borderColor: config.color + '30' }]}>
            <IconComponent size={16} color={config.color} />
          </View>
          {!isLast && <View style={[styles.timelineLine, { backgroundColor: config.color + '20' }]} />}
        </View>
        <Pressable style={styles.milestoneContent} onPress={() => handleVerifyMilestone(milestone)}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.milestoneTitle}>{milestone.title}</Text>
            {milestone.required && (
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>Required</Text>
              </View>
            )}
          </View>
          <Text style={styles.milestoneDescription}>{milestone.description}</Text>
          <View style={styles.milestoneFooter}>
            <View style={[styles.statusChip, { backgroundColor: config.color + '12' }]}>
              <Text style={[styles.statusChipText, { color: config.color }]}>{config.label}</Text>
            </View>
            {milestone.verifiedDate && (
              <Text style={styles.milestoneDate}>{milestone.verifiedDate}</Text>
            )}
            {milestone.status !== 'verified' && milestone.status !== 'rejected' && (
              <View style={styles.uploadHint}>
                <Upload size={11} color={colors.mediumGray} />
                <Text style={styles.uploadHintText}>Upload proof</Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>
    );
  }, [vault.milestones.length, handleVerifyMilestone, colors, styles]);

  const renderMediaItem = useCallback((item: VaultMediaItem) => {
    const linkedMilestone = item.linkedMilestoneId
      ? vault.milestones.find(m => m.id === item.linkedMilestoneId)
      : null;

    return (
      <Pressable
        key={item.id}
        style={styles.mediaCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Alert.alert(item.title, `${item.description ?? ''}\n\nUploaded by ${item.uploadedBy} on ${item.uploadedDate}`);
        }}
      >
        {item.type === 'image' && item.url && (
          <Image source={{ uri: item.thumbnailUrl ?? item.url }} style={styles.mediaThumbnail} />
        )}
        {item.type === 'document' && (
          <View style={styles.mediaDocIcon}>
            <FileText size={24} color={colors.primary} />
          </View>
        )}
        {item.type === 'link' && (
          <View style={styles.mediaDocIcon}>
            <Link2 size={24} color="#6366F1" />
          </View>
        )}
        <View style={styles.mediaInfo}>
          <Text style={styles.mediaTitle} numberOfLines={1}>{item.title}</Text>
          {item.description && (
            <Text style={styles.mediaDescription} numberOfLines={2}>{item.description}</Text>
          )}
          <View style={styles.mediaMetaRow}>
            <Image source={{ uri: item.uploadedByAvatar }} style={styles.mediaUploaderAvatar} />
            <Text style={styles.mediaUploaderName}>{item.uploadedBy}</Text>
            <Text style={styles.mediaDate}>{item.uploadedDate}</Text>
          </View>
          {linkedMilestone && (
            <View style={styles.linkedMilestoneBadge}>
              <Target size={10} color={colors.statusOpen} />
              <Text style={styles.linkedMilestoneText}>{linkedMilestone.title}</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  }, [vault.milestones, colors, styles]);

  const renderMessage = useCallback((msg: VaultMessage) => {
    const isMilestoneMsg = msg.type === 'milestone_verified';
    const isContribution = msg.type === 'contribution';
    const isUpdate = msg.type === 'update';

    return (
      <View key={msg.id} style={styles.messageItem}>
        <Pressable onPress={() => router.push(`/user/${msg.userId}`)}>
          <Image source={{ uri: msg.avatar }} style={styles.messageAvatar} />
        </Pressable>
        <View style={styles.messageBubble}>
          <View style={styles.messageHeaderRow}>
            <Text style={styles.messageUsername}>{msg.username}</Text>
            {isMilestoneMsg && (
              <View style={[styles.msgTypeBadge, { backgroundColor: colors.statusOpen + '12' }]}>
                <CheckCircle2 size={9} color={colors.statusOpen} />
                <Text style={[styles.msgTypeBadgeText, { color: colors.statusOpen }]}>Milestone</Text>
              </View>
            )}
            {isUpdate && (
              <View style={[styles.msgTypeBadge, { backgroundColor: '#6366F1' + '12' }]}>
                <AlertCircle size={9} color="#6366F1" />
                <Text style={[styles.msgTypeBadgeText, { color: '#6366F1' }]}>Update</Text>
              </View>
            )}
            {isContribution && (
              <View style={[styles.msgTypeBadge, { backgroundColor: colors.accent + '12' }]}>
                <DollarSign size={9} color={colors.accent} />
                <Text style={[styles.msgTypeBadgeText, { color: colors.accent }]}>Contribution</Text>
              </View>
            )}
          </View>
          <Text style={styles.messageContent}>{msg.content}</Text>
          <Text style={styles.messageTimestamp}>{msg.timestamp}</Text>
        </View>
      </View>
    );
  }, [router, colors, styles]);

  const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = useMemo(() => [
    { key: 'milestones', label: 'Milestones', icon: <Target size={14} color={activeTab === 'milestones' ? colors.black : colors.mediumGray} /> },
    { key: 'media', label: 'Media', icon: <ImageIcon size={14} color={activeTab === 'media' ? colors.black : colors.mediumGray} /> },
    { key: 'messages', label: 'Messages', icon: <MessageCircle size={14} color={activeTab === 'messages' ? colors.black : colors.mediumGray} /> },
    { key: 'contributors', label: 'Members', icon: <Users size={14} color={activeTab === 'contributors' ? colors.black : colors.mediumGray} /> },
  ], [activeTab, colors]);

  const showMessageInput = activeTab === 'messages';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <Pressable onPress={handleManage} hitSlop={8}>
              <Settings size={22} color={colors.black} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroIcon}>{vault.icon}</Text>
          <Text style={styles.vaultName}>{vault.name}</Text>
          <Pressable onPress={() => {
            const user = vault.organizerId;
            if (user) router.push(`/user/${user}`);
          }}>
            <Text style={styles.vaultOrganizer}>Organized by {vault.organizer}</Text>
          </Pressable>
        </View>

        {vault.description ? (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{vault.description}</Text>
          </View>
        ) : null}

        {vault.organizerNotes ? (
          <View style={styles.organizerNoteCard}>
            <View style={styles.organizerNoteHeader}>
              <User size={13} color={colors.primary} />
              <Text style={styles.organizerNoteLabel}>Organizer Note</Text>
            </View>
            <Text style={styles.organizerNoteText}>{vault.organizerNotes}</Text>
          </View>
        ) : null}

        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: isOverfunded ? colors.statusOpen : colors.primary }]} />
          </View>

          <View style={styles.fundingRow}>
            <View>
              <Text style={[styles.fundingAmount, { color: isOverfunded ? colors.statusOpen : colors.primary }]}>
                ${vault.raised.toLocaleString()}
              </Text>
              <Text style={styles.fundingLabel}>raised</Text>
            </View>
            <View style={styles.fundingCenter}>
              <Text style={styles.fundingGoalAmount}>${vault.goal.toLocaleString()}</Text>
              <Text style={styles.fundingLabel}>goal</Text>
            </View>
            <View style={styles.fundingRight}>
              <View style={styles.contributorAvatarsRow}>
                {vault.contributors.slice(0, 4).map((c, i) => (
                  <Image
                    key={c.id}
                    source={{ uri: c.avatar }}
                    style={[styles.miniAvatar, { marginLeft: i > 0 ? -8 : 0 }]}
                  />
                ))}
                {vault.contributors.length > 4 && (
                  <View style={[styles.miniAvatarMore, { marginLeft: -8 }]}>
                    <Text style={styles.miniAvatarMoreText}>+{vault.contributors.length - 4}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.contributorCountText}>{vault.contributors.length} contributors</Text>
            </View>
          </View>
        </View>

        <View style={styles.milestoneProgressCard}>
          <View style={styles.milestoneProgressHeader}>
            <Target size={16} color={milestonesProgress.allMet ? colors.statusOpen : colors.primary} />
            <Text style={styles.milestoneProgressTitle}>
              Milestones: {milestonesProgress.done}/{milestonesProgress.total} verified
            </Text>
          </View>
          <View style={styles.milestoneProgressBarBg}>
            <View
              style={[
                styles.milestoneProgressBarFill,
                {
                  width: milestonesProgress.total > 0 ? `${(milestonesProgress.done / milestonesProgress.total) * 100}%` : '0%',
                  backgroundColor: milestonesProgress.allMet ? colors.statusOpen : colors.primary,
                },
              ]}
            />
          </View>
          {milestonesProgress.allMet && (
            <Text style={styles.allMilestonesMet}>All required milestones verified — funds eligible for release</Text>
          )}
          {!milestonesProgress.allMet && (
            <Text style={styles.milestonesRemaining}>
              {milestonesProgress.total - milestonesProgress.done} milestone{milestonesProgress.total - milestonesProgress.done !== 1 ? 's' : ''} remaining before funds can be released
            </Text>
          )}
        </View>

        {vault.status === 'active' && (
          <Pressable
            style={({ pressed }) => [styles.contributeBtn, pressed && { opacity: 0.9 }]}
            onPress={handleContribute}
          >
            <DollarSign size={18} color={colors.white} />
            <Text style={styles.contributeBtnText}>Contribute</Text>
          </Pressable>
        )}

        {(vault.status === 'milestones_met' || vault.status === 'voting') && (
          <View style={styles.releaseBtnContainer}>
            <View style={styles.milestonesMetBanner}>
              <CheckCircle2 size={16} color={colors.statusOpen} />
              <Text style={styles.milestonesMetText}>All milestones verified! Vote to release funds.</Text>
            </View>

            <View style={styles.voteCard}>
              <Text style={styles.voteCardTitle}>Member Vote</Text>
              <Text style={styles.voteCardSubtext}>
                {voteStats.voted}/{voteStats.totalVoters} members voted · Majority needed: {voteStats.majority}
              </Text>

              <View style={styles.voteBarContainer}>
                <View style={styles.voteBarBg}>
                  {voteStats.voted > 0 && (
                    <>
                      <View style={[styles.voteBarApprove, { flex: voteStats.approvals || 0.01 }]} />
                      <View style={[styles.voteBarDeny, { flex: voteStats.denials || 0.01 }]} />
                    </>
                  )}
                </View>
                <View style={styles.voteCountsRow}>
                  <Text style={styles.voteApproveCount}>{voteStats.approvals} approve</Text>
                  <Text style={styles.voteDenyCount}>{voteStats.denials} deny</Text>
                </View>
              </View>

              {vault.votes.length > 0 && (
                <View style={styles.votersSection}>
                  {vault.votes.map((v: VaultVote) => (
                    <View key={v.id} style={styles.voterRow}>
                      <Image source={{ uri: v.avatar }} style={styles.voterAvatar} />
                      <Text style={styles.voterName}>{v.username}</Text>
                      <View style={[
                        styles.voterBadge,
                        { backgroundColor: v.vote === 'approve' ? colors.statusOpen + '15' : colors.primary + '15' },
                      ]}>
                        <Text style={[
                          styles.voterBadgeText,
                          { color: v.vote === 'approve' ? colors.statusOpen : colors.primary },
                        ]}>
                          {v.vote === 'approve' ? 'Approve' : 'Deny'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {!voteStats.currentUserVote ? (
                <View style={styles.voteActions}>
                  <Pressable
                    style={({ pressed }) => [styles.voteDenyBtn, pressed && { opacity: 0.85 }]}
                    onPress={() => handleVote('deny')}
                  >
                    <Text style={styles.voteDenyBtnText}>Deny</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.voteApproveBtn, pressed && { opacity: 0.85 }]}
                    onPress={() => handleVote('approve')}
                  >
                    <Text style={styles.voteApproveBtnText}>Approve Release</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.votedBanner}>
                  <CheckCircle2 size={14} color={colors.accent} />
                  <Text style={styles.votedBannerText}>
                    You voted to {voteStats.currentUserVote.vote}
                  </Text>
                </View>
              )}
            </View>

            {voteStats.passed && (
              <Pressable
                style={({ pressed }) => [styles.releaseBtn, pressed && { opacity: 0.9 }]}
                onPress={handleReleaseFunds}
              >
                <DollarSign size={18} color={colors.white} />
                <Text style={styles.releaseBtnText}>Release Funds</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <Pressable
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab(tab.key);
              }}
            >
              {tab.icon}
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'milestones' && (
          <View style={styles.tabContent}>
            {vault.milestones.length === 0 ? (
              <View style={styles.emptyState}>
                <Target size={32} color={colors.lightGray} />
                <Text style={styles.emptyTitle}>No milestones yet</Text>
                <Text style={styles.emptySubtext}>The organizer will add milestones that must be verified before funds are released.</Text>
              </View>
            ) : (
              vault.milestones.map((m, i) => renderMilestone(m, i))
            )}
          </View>
        )}

        {activeTab === 'media' && (
          <View style={styles.tabContent}>
            <Pressable style={styles.uploadBtn} onPress={handleUploadMedia}>
              <Upload size={16} color={colors.primary} />
              <Text style={styles.uploadBtnText}>Upload Document or Photo</Text>
            </Pressable>
            {vault.media.length === 0 ? (
              <View style={styles.emptyState}>
                <ImageIcon size={32} color={colors.lightGray} />
                <Text style={styles.emptyTitle}>No media yet</Text>
                <Text style={styles.emptySubtext}>Upload documents, photos, and proof to verify milestones and share updates.</Text>
              </View>
            ) : (
              vault.media.map(renderMediaItem)
            )}
          </View>
        )}

        {activeTab === 'messages' && (
          <View style={styles.tabContent}>
            {vault.messages.length === 0 ? (
              <View style={styles.emptyState}>
                <MessageCircle size={32} color={colors.lightGray} />
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Send updates, coordinate with contributors, and share milestone progress.</Text>
              </View>
            ) : (
              vault.messages.map(renderMessage)
            )}
          </View>
        )}

        {activeTab === 'contributors' && (
          <View style={styles.tabContent}>
            {vault.contributors.map(renderContributor)}
          </View>
        )}

        <View style={{ height: showMessageInput ? 80 : 40 }} />
      </ScrollView>

      {showMessageInput && (
        <View style={styles.messageInputBar}>
          <TextInput
            style={styles.messageInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Send an update..."
            placeholderTextColor={colors.mediumGray}
            multiline
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              !messageText.trim() && styles.sendBtnDisabled,
              pressed && messageText.trim() ? { opacity: 0.85 } : {},
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Send size={18} color={messageText.trim() ? colors.white : colors.mediumGray} />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  heroIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  vaultName: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.black,
    textAlign: 'center',
  },
  vaultOrganizer: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500' as const,
  },
  progressSection: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: colors.extraLightGray,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: 10,
    borderRadius: 5,
  },
  fundingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fundingAmount: {
    fontSize: 22,
    fontWeight: '800' as const,
  },
  fundingLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 1,
  },
  fundingCenter: {
    alignItems: 'center',
  },
  fundingGoalAmount: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.black,
  },
  fundingRight: {
    alignItems: 'flex-end',
  },
  contributorAvatarsRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.white,
  },
  miniAvatarMore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.extraLightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarMoreText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: colors.mediumGray,
  },
  contributorCountText: {
    fontSize: 11,
    color: colors.mediumGray,
  },
  milestoneProgressCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  milestoneProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  milestoneProgressTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.black,
  },
  milestoneProgressBarBg: {
    height: 6,
    backgroundColor: colors.extraLightGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  milestoneProgressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  allMilestonesMet: {
    fontSize: 12,
    color: colors.statusOpen,
    fontWeight: '600' as const,
  },
  milestonesRemaining: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  contributeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  contributeBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
  releaseBtnContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  milestonesMetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.statusOpen + '10',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  milestonesMetText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.statusOpen,
  },
  releaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.statusOpen,
    paddingVertical: 16,
    borderRadius: 14,
  },
  releaseBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.extraLightGray,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.mediumGray,
  },
  tabTextActive: {
    color: colors.black,
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  milestoneTimeline: {
    alignItems: 'center',
    width: 40,
  },
  milestoneIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginVertical: 4,
  },
  milestoneContent: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginLeft: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.black,
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  milestoneDescription: {
    fontSize: 13,
    color: colors.mediumGray,
    lineHeight: 19,
    marginBottom: 8,
  },
  milestoneFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  milestoneDate: {
    fontSize: 11,
    color: colors.mediumGray,
  },
  uploadHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  uploadHintText: {
    fontSize: 11,
    color: colors.mediumGray,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary + '08',
    borderWidth: 1,
    borderColor: colors.primary + '20',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderStyle: 'dashed',
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  mediaCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    marginBottom: 10,
  },
  mediaThumbnail: {
    width: 80,
    height: 80,
  },
  mediaDocIcon: {
    width: 80,
    height: 80,
    backgroundColor: colors.extraLightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaInfo: {
    flex: 1,
    padding: 10,
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 2,
  },
  mediaDescription: {
    fontSize: 12,
    color: colors.mediumGray,
    lineHeight: 17,
    marginBottom: 6,
  },
  mediaMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mediaUploaderAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  mediaUploaderName: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.darkGray,
  },
  mediaDate: {
    fontSize: 11,
    color: colors.mediumGray,
    marginLeft: 'auto',
  },
  linkedMilestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: colors.statusOpen + '08',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  linkedMilestoneText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.statusOpen,
  },
  messageItem: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  messageAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  messageBubble: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderTopLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  messageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  messageUsername: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.black,
  },
  msgTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  msgTypeBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
  },
  messageContent: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
  },
  messageTimestamp: {
    fontSize: 11,
    color: colors.mediumGray,
    marginTop: 4,
  },
  messageInputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    gap: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.extraLightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.black,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.extraLightGray,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.darkGray,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  contributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  contributorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contributorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contributorName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.black,
  },
  contributorAmount: {
    fontSize: 13,
    color: colors.mediumGray,
    marginTop: 1,
  },
  descriptionCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 21,
  },
  organizerNoteCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.primary + '06',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primary + '15',
  },
  organizerNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  organizerNoteLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  organizerNoteText: {
    fontSize: 13,
    color: colors.darkGray,
    lineHeight: 20,
  },
  voteCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  voteCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 4,
  },
  voteCardSubtext: {
    fontSize: 13,
    color: colors.mediumGray,
    marginBottom: 14,
  },
  voteBarContainer: {
    marginBottom: 12,
  },
  voteBarBg: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.extraLightGray,
  },
  voteBarApprove: {
    backgroundColor: colors.statusOpen,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  voteBarDeny: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  voteCountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  voteApproveCount: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.statusOpen,
  },
  voteDenyCount: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  votersSection: {
    marginBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lightGray,
    paddingTop: 10,
  },
  voterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  voterAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  voterName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.darkGray,
    marginLeft: 8,
  },
  voterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  voterBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  voteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  voteDenyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  voteDenyBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  voteApproveBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.statusOpen,
  },
  voteApproveBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.white,
  },
  votedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent + '10',
    borderRadius: 10,
    padding: 12,
  },
  votedBannerText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.accent,
  },
});
