import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

const TIPS = [
    "Pay yourself first — save before you spend.",
    "Compound interest is the 8th wonder of the world.",
    "Don't put all your eggs in one basket — diversify.",
    "A budget isn't restrictive, it's freeing.",
    "Emergency funds should cover 3–6 months of expenses.",
    "Time in the market beats timing the market.",
    "Avoid lifestyle inflation as your income grows.",
    "Every dollar saved is a dollar that can work for you.",
    "Investing isn't gambling — it's patience and research.",
    "The best investment you can make is in yourself.",
    "Start small, stay consistent — that's the formula.",
    "High-yield savings accounts are free money. Use them.",
    "Debt with interest is wealth in reverse.",
    "Your network is your net worth.",
    "Financial literacy is the most underrated superpower.",
    "Track every dollar — what gets measured gets managed.",
    "Build assets, not just income streams.",
    "Generational wealth starts with one smart decision.",
    "Circles multiply savings. Community multiplies results.",
    "The earlier you start, the less you need to invest.",
];

interface AppSplashProps {
    onFinish: () => void;
}

export default function AppSplash({ onFinish }: AppSplashProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const tipFade = useRef(new Animated.Value(0)).current;
    const exitAnim = useRef(new Animated.Value(1)).current;

    const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], []);

    useEffect(() => {
        // Logo entrance
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 60,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();

        // Tip fade in after logo
        setTimeout(() => {
            Animated.timing(tipFade, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, 400);

        // Exit after showing
        setTimeout(() => {
            Animated.timing(exitAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        }, 2800);
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: exitAnim }]}>
            <View style={styles.content}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Image
                        source={require('../assets/images/splash-icon.png')}
                        style={styles.logo}
                        contentFit="contain"
                    />
                </Animated.View>

                <Animated.View style={[styles.tipContainer, { opacity: tipFade }]}>
                    <Text style={styles.tipLabel}>💡 Tip</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                </Animated.View>
            </View>

            <Text style={styles.footer}>Ascor — Community-Powered Savings</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    content: {
        alignItems: 'center',
        gap: 40,
    },
    logo: {
        width: width * 0.55,
        height: width * 0.55,
    },
    tipContainer: {
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    tipLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#999',
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    tipText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        fontSize: 12,
        color: '#BBB',
        fontWeight: '500',
    },
});
