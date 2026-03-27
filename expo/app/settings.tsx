import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Switch,
    Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
    User,
    Bell,
    Store,
    CreditCard,
    ChevronRight,
    Shield,
    HelpCircle,
    Info,
    Sparkles,
    Sun,
    Moon,
    Monitor,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';
import { userService } from '@/services/userService';
import { shopService } from '@/services/shopService';

const MONTHLY_FEE = 14.99;

export default function SettingsScreen() {
    const colors = useColors();
    const styles = createStyles(colors);
    const { themeMode, setThemeMode } = useTheme();
    const router = useRouter();
    const user = userService.getUser();
    const [isBusinessUser, setIsBusinessUser] = useState(user.isBusinessOwner);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [circleReminders, setCircleReminders] = useState(true);

    useEffect(() => {
        shopService.getBusinessMode().then(setIsBusinessUser);
    }, []);

    const handleBusinessToggle = useCallback(async (value: boolean) => {
        if (value) {
            Alert.alert(
                'Become a Business User',
                `Enabling business mode lets you sell products and offer services on Ascor.\n\nMonthly fee: $${MONTHLY_FEE}/month\n\nYou can cancel anytime.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Enable',
                        onPress: async () => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            setIsBusinessUser(true);
                            await shopService.setBusinessMode(true);
                        },
                    },
                ]
            );
        } else {
            Alert.alert(
                'Disable Business Mode',
                'Your shop listings will be hidden but not deleted. You can re-enable anytime.',
                [
                    { text: 'Keep Active', style: 'cancel' },
                    {
                        text: 'Disable',
                        style: 'destructive',
                        onPress: async () => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                            setIsBusinessUser(false);
                            await shopService.setBusinessMode(false);
                        },
                    },
                ]
            );
        }
    }, []);

    const handleManageShop = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/shop');
    }, [router]);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Stack.Screen options={{ title: 'Settings' }} />

            {/* Account Section */}
            <Text style={styles.sectionHeader}>Account</Text>
            <View style={styles.section}>
                <View style={styles.row}>
                    <View style={[styles.iconWrap, { backgroundColor: colors.primary + '12' }]}>
                        <User size={18} color={colors.primary} />
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>Display Name</Text>
                        <Text style={styles.rowValue}>{user.username}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <View style={[styles.iconWrap, { backgroundColor: colors.accent + '12' }]}>
                        <Shield size={18} color={colors.accent} />
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>Reputation Score</Text>
                        <Text style={styles.rowValue}>{Math.round(user.onTimeRate * 100)}% on-time · {user.completedCycles} cycles</Text>
                    </View>
                </View>
            </View>

            {/* Notifications Section */}
            <Text style={styles.sectionHeader}>Notifications</Text>
            <View style={styles.section}>
                <View style={styles.row}>
                    <View style={[styles.iconWrap, { backgroundColor: colors.warning + '12' }]}>
                        <Bell size={18} color={colors.warning} />
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>Push Notifications</Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: colors.lightGray, true: colors.primary + '50' }}
                        thumbColor={notificationsEnabled ? colors.primary : colors.mediumGray}
                    />
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <View style={[styles.iconWrap, { backgroundColor: colors.accent + '12' }]}>
                        <Bell size={18} color={colors.accent} />
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>Circle Payment Reminders</Text>
                    </View>
                    <Switch
                        value={circleReminders}
                        onValueChange={setCircleReminders}
                        trackColor={{ false: colors.lightGray, true: colors.accent + '50' }}
                        thumbColor={circleReminders ? colors.accent : colors.mediumGray}
                    />
                </View>
            </View>

            {/* Appearance Section */}
            <Text style={styles.sectionHeader}>Appearance</Text>
            <View style={styles.section}>
                <View style={styles.row}>
                    <View style={[styles.iconWrap, { backgroundColor: '#6366F112' }]}>
                        <Sun size={18} color="#6366F1" />
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>Theme</Text>
                        <Text style={styles.rowHint}>Choose your preferred appearance</Text>
                    </View>
                </View>
                <View style={styles.themeSelector}>
                    {([['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'System', Monitor]] as const).map(([mode, label, Icon]) => (
                        <Pressable
                            key={mode}
                            style={[styles.themeOption, themeMode === mode && styles.themeOptionActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setThemeMode(mode as ThemeMode);
                            }}
                        >
                            <Icon size={16} color={themeMode === mode ? '#7C3AED' : colors.mediumGray} />
                            <Text style={[styles.themeOptionText, themeMode === mode && styles.themeOptionTextActive]}>{label}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Business Section */}
            <Text style={styles.sectionHeader}>Business</Text>
            <View style={styles.section}>
                <View style={styles.row}>
                    <View style={[styles.iconWrap, { backgroundColor: '#7C3AED12' }]}>
                        <Store size={18} color="#7C3AED" />
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>Business Mode</Text>
                        <Text style={styles.rowHint}>Sell products & offer services</Text>
                    </View>
                    <Switch
                        value={isBusinessUser}
                        onValueChange={handleBusinessToggle}
                        trackColor={{ false: colors.lightGray, true: '#7C3AED50' }}
                        thumbColor={isBusinessUser ? '#7C3AED' : colors.mediumGray}
                    />
                </View>

                {isBusinessUser && (
                    <>
                        <View style={styles.divider} />

                        {/* Subscription info */}
                        <View style={styles.subscriptionCard}>
                            <View style={styles.subscriptionHeader}>
                                <Sparkles size={16} color="#7C3AED" />
                                <Text style={styles.subscriptionTitle}>Business Subscription</Text>
                            </View>
                            <View style={styles.subscriptionDetails}>
                                <Text style={styles.subscriptionPrice}>${MONTHLY_FEE}</Text>
                                <Text style={styles.subscriptionPeriod}>/month</Text>
                            </View>
                            <Text style={styles.subscriptionDesc}>
                                List products, offer services, and reach the Ascor community. Cancel anytime.
                            </Text>
                            <Pressable
                                style={({ pressed }) => [styles.subscriptionBtn, pressed && { opacity: 0.9 }]}
                                onPress={() => Alert.alert('Subscription', 'Payment processing will be connected via Stripe.')}
                            >
                                <CreditCard size={16} color={colors.white} />
                                <Text style={styles.subscriptionBtnText}>Manage Subscription</Text>
                            </Pressable>
                        </View>

                        <View style={styles.divider} />

                        {/* Manage Shop */}
                        <Pressable
                            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.extraLightGray }]}
                            onPress={handleManageShop}
                        >
                            <View style={[styles.iconWrap, { backgroundColor: colors.statusOpen + '12' }]}>
                                <Store size={18} color={colors.statusOpen} />
                            </View>
                            <View style={styles.rowContent}>
                                <Text style={styles.rowLabel}>Manage Your Shop</Text>
                                <Text style={styles.rowHint}>Add, edit, or remove listings</Text>
                            </View>
                            <ChevronRight size={18} color={colors.mediumGray} />
                        </Pressable>
                    </>
                )}
            </View>

            {/* App Section */}
            <Text style={styles.sectionHeader}>App</Text>
            <View style={styles.section}>
                <Pressable
                    style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.extraLightGray }]}
                    onPress={() => Alert.alert('Help', 'Help center coming soon.')}
                >
                    <View style={[styles.iconWrap, { backgroundColor: colors.primary + '12' }]}>
                        <HelpCircle size={18} color={colors.primary} />
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>Help Center</Text>
                    </View>
                    <ChevronRight size={18} color={colors.mediumGray} />
                </Pressable>
                <View style={styles.divider} />
                <Pressable
                    style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.extraLightGray }]}
                    onPress={() => Alert.alert('About', 'Ascor v1.0.0\nCapital Coordination Platform')}
                >
                    <View style={[styles.iconWrap, { backgroundColor: colors.mediumGray + '18' }]}>
                        <Info size={18} color={colors.mediumGray} />
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>About Ascor</Text>
                        <Text style={styles.rowValue}>v1.0.0</Text>
                    </View>
                    <ChevronRight size={18} color={colors.mediumGray} />
                </Pressable>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: colors.mediumGray,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.8,
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 8,
    },
    section: {
        backgroundColor: colors.white,
        marginHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.lightGray,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowContent: {
        flex: 1,
    },
    rowLabel: {
        fontSize: 15,
        fontWeight: '500' as const,
        color: colors.black,
    },
    rowValue: {
        fontSize: 13,
        color: colors.mediumGray,
        marginTop: 1,
    },
    rowHint: {
        fontSize: 12,
        color: colors.mediumGray,
        marginTop: 1,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.lightGray,
        marginLeft: 62,
    },
    subscriptionCard: {
        padding: 16,
        backgroundColor: '#7C3AED08',
    },
    subscriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    subscriptionTitle: {
        fontSize: 14,
        fontWeight: '700' as const,
        color: '#7C3AED',
    },
    subscriptionDetails: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    subscriptionPrice: {
        fontSize: 28,
        fontWeight: '800' as const,
        color: colors.black,
    },
    subscriptionPeriod: {
        fontSize: 14,
        color: colors.mediumGray,
        fontWeight: '500' as const,
        marginLeft: 2,
    },
    subscriptionDesc: {
        fontSize: 13,
        color: colors.mediumGray,
        lineHeight: 19,
        marginBottom: 12,
    },
    subscriptionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#7C3AED',
        paddingVertical: 12,
        borderRadius: 10,
    },
    subscriptionBtnText: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: '#FFFFFF',
    },
    themeSelector: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 14,
        paddingBottom: 14,
    },
    themeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: colors.extraLightGray,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    themeOptionActive: {
        backgroundColor: '#7C3AED10',
        borderColor: '#7C3AED',
    },
    themeOptionText: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: colors.mediumGray,
    },
    themeOptionTextActive: {
        color: '#7C3AED',
    },
});
