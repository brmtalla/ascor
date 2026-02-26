import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { useColors } from '@/constants/colors';

interface StatusRingProps {
  avatar: string;
  status: 'open' | 'locked' | 'completed';
  size?: number;
}

export default function StatusRing({ avatar, status, size = 52 }: StatusRingProps) {
  const colors = useColors();
  const ringColor = status === 'open' ? colors.statusOpen : colors.statusLocked;
  const isEmoji = !avatar.startsWith('http');

  // Shimmer rotation animation
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  // Pulse scale animation for 'open' status
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous rotation for shimmer effect
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    shimmerLoop.start();

    // Subtle pulse for open rings
    if (status === 'open') {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => { shimmerLoop.stop(); pulseLoop.stop(); };
    }

    return () => shimmerLoop.stop();
  }, [status]);

  const rotate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const outerSize = size + 8;

  return (
    <View style={{ width: outerSize, height: outerSize, alignItems: 'center', justifyContent: 'center' }}>
      {/* Animated shimmer ring */}
      <Animated.View
        style={[
          styles.shimmerRing,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            borderColor: ringColor,
            transform: [{ rotate }, { scale: pulseAnim }],
            shadowColor: ringColor,
            shadowOpacity: status === 'open' ? 0.4 : 0.15,
            shadowRadius: status === 'open' ? 8 : 4,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      />
      {/* Inner ring with dashed effect for shimmer */}
      <Animated.View
        style={[
          styles.innerGlow,
          {
            width: outerSize - 2,
            height: outerSize - 2,
            borderRadius: (outerSize - 2) / 2,
            borderColor: ringColor + '40',
            transform: [{ rotate: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] }) }],
          },
        ]}
      />
      {/* Avatar */}
      <View style={[styles.avatarContainer, { position: 'absolute' }]}>
        {isEmoji ? (
          <View
            style={[
              styles.emojiContainer,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: colors.extraLightGray,
              },
            ]}
          >
            <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{avatar}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: avatar }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shimmerRing: {
    position: 'absolute',
    borderWidth: 2.5,
    borderStyle: 'solid',
  },
  innerGlow: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});
