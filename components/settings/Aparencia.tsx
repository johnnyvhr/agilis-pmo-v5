import React from 'react';
import SettingsPageLayout from './SettingsPageLayout';
import { useTheme } from '../../context/ThemeContext';

interface AparenciaProps {
    onBack: () => void;
}

const ThemeOption: React.FC<{
    title: string;
    value: 'light' | 'dark' | 'system';
    currentTheme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    children: React.ReactNode;
}> = ({ title, value, currentTheme, setTheme, children }) => {
    const isActive = currentTheme === value;
    return (
        <div>
            <button
                onClick={() => setTheme(value)}
                className={`w-full p-2 border-2 rounded-lg transition-colors ${isActive ? 'border-blue-500' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'}`}
            >
                {children}
            </button>
            <p className={`mt-2 text-center text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>{title}</p>
        </div>
    );
};


const Aparencia: React.FC<AparenciaProps> = ({ onBack }) => {
    const { theme, setTheme } = useTheme();

    return (
        <SettingsPageLayout title="Aparência" onBack={onBack}>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Tema</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Personalize a aparência do Agilis PMO no seu navegador.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
                <ThemeOption title="Claro" value="light" currentTheme={theme} setTheme={setTheme}>
                    <div className="w-full h-32 bg-white rounded-md flex p-3">
                        <div className="w-1/3 bg-slate-100 rounded-l-sm"></div>
                        <div className="flex-1 bg-slate-50 rounded-r-sm border border-slate-200 ml-1"></div>
                    </div>
                </ThemeOption>
                <ThemeOption title="Escuro" value="dark" currentTheme={theme} setTheme={setTheme}>
                    <div className="w-full h-32 bg-slate-900 rounded-md flex p-3">
                        <div className="w-1/3 bg-slate-800 rounded-l-sm"></div>
                        <div className="flex-1 bg-slate-700 rounded-r-sm border border-slate-600 ml-1"></div>
                    </div>
                </ThemeOption>
                <ThemeOption title="Padrão do Sistema" value="system" currentTheme={theme} setTheme={setTheme}>
                    <div className="w-full h-32 bg-white rounded-md flex p-3 overflow-hidden">
                        <div className="w-full h-full relative">
                            <div className="absolute top-0 left-0 w-1/2 h-full bg-white">
                                <div className="w-1/3 h-full bg-slate-100 rounded-l-sm"></div>
                                <div className="absolute top-0 left-1/3 w-2/3 h-full bg-slate-50 rounded-r-sm border border-slate-200 ml-1"></div>
                            </div>
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-900">
                                <div className="w-1/3 h-full bg-slate-800 rounded-l-sm"></div>
                                <div className="absolute top-0 left-1/3 w-2/3 h-full bg-slate-700 rounded-r-sm border border-slate-600 ml-1"></div>
                            </div>
                        </div>
                    </div>
                </ThemeOption>
            </div>
        </SettingsPageLayout>
    );
};

export default Aparencia;
