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
    const [theme, setThemeState] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';

            root.classList.add(systemTheme);
            setIsDark(systemTheme === 'dark');
            return;
        }

        root.classList.add(theme);
        setIsDark(theme === 'dark');
    }, [theme]);

    // Listener for system changes
    useEffect(() => {
        if (theme !== 'system') return;

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = () => {
            const root = window.document.documentElement;
            const systemTheme = media.matches ? 'dark' : 'light';
            root.classList.remove('light', 'dark');
            root.classList.add(systemTheme);
            setIsDark(media.matches);
        }

        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [theme])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setThemeState(theme);
        },
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
