import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShieldAlert, DollarSign, MessageSquare } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import { circlesService } from '@/services/circlesService';
import GlassCard from '@/components/GlassCard';

export default function JoinCircleScreen() {
    const colors = useColors();
    const styles = createStyles(colors);
    const router = useRouter();
    const { circleId } = useLocalSearchParams<{ circleId: string }>();

    const circle = circlesService.getCircleById(circleId ?? '');

    const [income, setIncome] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!circle) return null;

    const handleSubmit = () => {
        const numericIncome = Number(income.replace(/[^0-9.-]+/g, ""));

        if (!numericIncome || numericIncome <= 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Required', 'Please enter your accurate monthly income.');
            return;
        }

        if (numericIncome < circle.contribution * 3) {
            Alert.alert(
                'Warning',
                'Your income seems low for this contribution amount. The organizer may decline your request to prevent you from overextending financially. Are you sure you want to proceed?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Submit Anyway', style: 'destructive', onPress: submitRequest(numericIncome) }
                ]
            );
        } else {
            submitRequest(numericIncome)();
        }
    };

    const submitRequest = (numericIncome: number) => () => {
        setIsSubmitting(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        setTimeout(() => {
            try {
                circlesService.requestToJoinCircle(circle.id, {
                    monthlyIncome: numericIncome,
                    message: message.trim()
                });

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Request Sent', 'Your request has been sent to the organizer for review.');
                router.back();
            } catch (err) {
                Alert.alert('Error', 'Could not send request at this time.');
            } finally {
                setIsSubmitting(false);
            }
        }, 800);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <GlassCard style={styles.headerCard}>
                    <Text style={styles.title}>Apply to join {circle.name}</Text>
                    <Text style={styles.subtitle}>
                        This circle requires a contribution of <Text style={{ color: colors.accent, fontWeight: '700' }}>${circle.contribution}/month</Text>.
                    </Text>
                </GlassCard>

                <View style={styles.warningBox}>
                    <ShieldAlert size={20} color={colors.warning} />
                    <View style={styles.warningTextContainer}>
                        <Text style={styles.warningTitle}>Trust & Verification</Text>
                        <Text style={styles.warningDesc}>
                            To protect all members from default, organizers review financial capacity before approving requests. Ascor values honesty—repeated defaults will result in platform bans.
                        </Text>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Monthly Income (Required)</Text>
                    <Text style={styles.helpText}>Approximate take-home pay</Text>
                    <View style={styles.inputWrapper}>
                        <DollarSign size={20} color={colors.mediumGray} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor={colors.mediumGray}
                            keyboardType="numeric"
                            value={income}
                            onChangeText={setIncome}
                            editable={!isSubmitting}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Message to Organizer (Optional)</Text>
                    <Text style={styles.helpText}>Why do you want to join this circle?</Text>
                    <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                        <MessageSquare size={20} color={colors.mediumGray} style={styles.textAreaIcon} />
                        <TextInput
                            style={styles.textArea}
                            placeholder="I have a stable job and am looking to save for a down payment..."
                            placeholderTextColor={colors.mediumGray}
                            multiline
                            numberOfLines={4}
                            value={message}
                            onChangeText={setMessage}
                            editable={!isSubmitting}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.submitBtn,
                        (!income || isSubmitting) && styles.submitBtnDisabled,
                        pressed && { opacity: 0.9 }
                    ]}
                    onPress={handleSubmit}
                    disabled={!income || isSubmitting}
                >
                    <Text style={styles.submitBtnText}>
                        {isSubmitting ? 'Sending Request...' : 'Submit Request'}
                    </Text>
                </Pressable>

                <Text style={styles.termsText}>
                    By submitting, you agree to Ascor's Community Trust Guidelines.
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    headerCard: {
        marginBottom: 20,
        alignItems: 'center',
        paddingVertical: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '800' as const,
        color: colors.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: colors.darkGray,
        textAlign: 'center',
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: colors.warning + '15',
        borderWidth: 1,
        borderColor: colors.warning + '30',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        gap: 12,
    },
    warningTextContainer: {
        flex: 1,
    },
    warningTitle: {
        fontSize: 15,
        fontWeight: '700' as const,
        color: colors.warning,
        marginBottom: 4,
    },
    warningDesc: {
        fontSize: 13,
        color: colors.darkGray,
        lineHeight: 18,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '700' as const,
        color: colors.black,
        marginBottom: 4,
    },
    helpText: {
        fontSize: 13,
        color: colors.mediumGray,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightGray,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 52,
        fontSize: 16,
        color: colors.black,
    },
    textAreaWrapper: {
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    textAreaIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    textArea: {
        flex: 1,
        minHeight: 100,
        fontSize: 16,
        color: colors.black,
    },
    submitBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitBtnText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700' as const,
    },
    termsText: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.mediumGray,
        marginTop: 16,
    },
});
