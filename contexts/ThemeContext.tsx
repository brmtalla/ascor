import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDark: boolean;
}

const THEME_KEY = 'ascor_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
    themeMode: 'system',
    setThemeMode: () => { },
    isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(THEME_KEY).then(value => {
            if (value === 'light' || value === 'dark' || value === 'system') {
                setThemeModeState(value);
            }
            setLoaded(true);
        });
    }, []);

    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeModeState(mode);
        AsyncStorage.setItem(THEME_KEY, mode);
    }, []);

    const isDark =
        themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

    return (
        <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
