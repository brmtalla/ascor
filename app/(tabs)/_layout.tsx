import React from 'react';
import { Tabs } from 'expo-router';
import { CircleDot, Users, Rocket, BookOpen, User } from 'lucide-react-native';
import { useColors } from '@/constants/colors';

export default function TabLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.lightGray,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="(circles)"
        options={{
          title: 'Circles',
          tabBarIcon: ({ color, size }) => <CircleDot size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="deploy"
        options={{
          title: 'Deploy',
          tabBarIcon: ({ color, size }) => <Rocket size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
