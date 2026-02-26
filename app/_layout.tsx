import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColors } from "@/constants/colors";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const colors = useColors();
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.black,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
        <Stack.Screen name="menu" options={{ title: "Menu", presentation: "modal" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="shop" options={{ headerShown: false }} />
        <Stack.Screen name="vault/[vaultId]" options={{ title: "" }} />
        <Stack.Screen name="user/[userId]" options={{ title: "" }} />
        <Stack.Screen name="messages/index" options={{ title: "Messages" }} />
        <Stack.Screen name="messages/[conversationId]" options={{ title: "" }} />
        <Stack.Screen name="learn/[moduleId]" options={{ title: "" }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <GestureHandlerRootView>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </CartProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
