import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

interface ThemeContextState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean; // Helper to know resolved state
}

const initialState: ThemeContextState = {
    theme: 'system',
    setTheme: () => null,
    isDark: false,
};

const ThemeContext = createContext<ThemeContextState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
    // Initialize state from storage directly (Client-side SPA safe)
    const [theme, setThemeState] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );
    const [isDark, setIsDark] = useState(false);

    // 1. 'Nuclear' Cleanup (First Run Only)
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        // If the saved theme is not strictly 'light', 'dark', 'system', force reset it.
        if (saved && !['light', 'dark', 'system'].includes(saved)) {
            console.warn('Corrupt theme state detected. Resetting to default.');
            localStorage.removeItem(storageKey);
            setThemeState(defaultTheme);
        }
    }, [storageKey, defaultTheme]);

    // Initial Apply & System Listener
    useEffect(() => {
        const applyTheme = () => {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');

            if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                root.classList.add(systemTheme);
                setIsDark(systemTheme === 'dark');
            } else {
                root.classList.add(theme);
                setIsDark(theme === 'dark');
            }
        };

        applyTheme();

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = () => {
            if (theme === 'system') {
                applyTheme();
            }
        };
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [theme]);

    const setTheme = (mode: Theme) => {
        // 1. Update React State
        setThemeState(mode);
        // 2. Update LocalStorage
        localStorage.setItem(storageKey, mode);

        // 3. Update DOM Immediately (Synchronous)
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (mode === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.add(systemDark ? 'dark' : 'light');
            setIsDark(systemDark); // Keep helper in sync
        } else {
            root.classList.add(mode);
            setIsDark(mode === 'dark'); // Keep helper in sync
        }
    };

    const value = {
        theme,
        setTheme,
        isDark
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};
