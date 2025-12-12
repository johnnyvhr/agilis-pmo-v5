import React from 'react';
import { ArrowLeftIcon } from '../icons';

interface SettingsPageLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

const SettingsPageLayout: React.FC<SettingsPageLayoutProps> = ({ title, onBack, children }) => {
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack} 
          className="mr-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeftIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
        {children}
      </div>
    </div>
  );
};

export default SettingsPageLayout;