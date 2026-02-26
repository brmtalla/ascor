import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

  return (
    <View
      style={[
        styles.ring,
        {
          width: size + 6,
          height: size + 6,
          borderRadius: (size + 6) / 2,
          borderColor: ringColor,
        },
      ]}
    >
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
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2.5,
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
