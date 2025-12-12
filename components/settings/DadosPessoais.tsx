import React from 'react';
import SettingsPageLayout from './SettingsPageLayout';
import { UploadCloudIcon } from '../icons';

interface DadosPessoaisProps {
  onBack: () => void;
}

const DadosPessoais: React.FC<DadosPessoaisProps> = ({ onBack }) => {
  return (
    <SettingsPageLayout title="Dados Pessoais" onBack={onBack}>
      <div className="max-w-2xl divide-y divide-slate-200 dark:divide-slate-700">
        {/* Nome e Foto */}
        <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Nome e Foto</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Suas informações básicas de perfil.</p>
            </div>
            <div className="md:col-span-2 space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                    <input
                        type="text"
                        id="fullName"
                        defaultValue="Carlos Ferreira"
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Foto de Perfil</label>
                    <div className="mt-1 flex items-center space-x-4">
                        <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-600">
                             <svg className="h-full w-full text-slate-300 dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </span>
                        <div className="flex text-sm text-slate-600 dark:text-slate-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 p-2 border dark:border-slate-600">
                                <span>Alterar Foto</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Alterar Senha */}
        <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
             <div className="md:col-span-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Alterar Senha</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Para sua segurança, escolha uma senha forte.</p>
            </div>
             <div className="md:col-span-2 space-y-4">
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha Atual</label>
                    <input type="password" id="currentPassword" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"/>
                </div>
                 <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nova Senha</label>
                    <input type="password" id="newPassword" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"/>
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar Nova Senha</label>
                    <input type="password" id="confirmPassword" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"/>
                </div>
            </div>
        </div>

         <div className="pt-6 flex justify-end">
            <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
            >
                Salvar Alterações
            </button>
        </div>
      </div>
    </SettingsPageLayout>
  );
};

export default DadosPessoais;
