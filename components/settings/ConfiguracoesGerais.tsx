import React, { useState } from 'react';
import SettingsPageLayout from './SettingsPageLayout';
import { LogOutIcon } from '../icons';
import { useProjectContext } from '../../context/ProjectContext';
import { UserRole } from '../../types';

interface ConfiguracoesGeraisProps {
  onBack: () => void;
  // We can ignore props if we want to use context directly, but let's respect the interface since parent passes them.
  companyName: string;
  setCompanyName: (name: string) => void;
}

const ConfiguracoesGerais: React.FC<ConfiguracoesGeraisProps> = ({ onBack, companyName, setCompanyName }) => {
  const { currentUser } = useProjectContext();
  const [localCompanyName, setLocalCompanyName] = useState(companyName);
  const [environmentUrl, setEnvironmentUrl] = useState('agilis-pmo.app/sua-empresa');

  const isAdmin = currentUser?.role === UserRole.Admin;

  const handleSave = () => {
    if (!isAdmin) return;
    setCompanyName(localCompanyName);
    // Alert handled in context or here? Context has error handling. Success handling?
    // Context update is optimistic. We can show success here.
    // Ideally we wait for promise but setCompanyName is void in prop.
    // We assume success or context will revert/alert.
    alert('Solicitação de alteração enviada.');
  };

  const handleDeleteEnvironment = () => {
    if (!isAdmin) return;
    const confirmation = window.prompt(`Esta ação é irreversível. Todos os dados do ambiente serão perdidos.\n\nPara confirmar, digite o nome do ambiente: "${companyName}"`);
    if (confirmation === companyName) {
      alert('Ambiente excluído com sucesso.');
      // Here you would typically redirect the user or force a page reload
    } else if (confirmation !== null) {
      alert('O nome digitado não corresponde. A exclusão foi cancelada.');
    }
  };

  return (
    <SettingsPageLayout title="Configurações Gerais" onBack={onBack}>
      <div className="max-w-2xl space-y-6">
        {!isAdmin && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                {/* Warning Icon */}
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Apenas administradores podem alterar as configurações do ambiente.
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Ambiente</label>
          <input
            type="text"
            id="companyName"
            value={localCompanyName}
            onChange={(e) => setLocalCompanyName(e.target.value)}
            disabled={!isAdmin}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div>
          <label htmlFor="environmentUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL do Ambiente</label>
          <input
            type="text"
            id="environmentUrl"
            value={environmentUrl}
            onChange={(e) => setEnvironmentUrl(e.target.value)}
            disabled={true}
            className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm text-slate-500 cursor-not-allowed sm:text-sm"
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">A URL não pode ser alterada neste momento.</p>
        </div>

        {isAdmin && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
            >
              Salvar Alterações
            </button>
          </div>
        )}
      </div>

      {/* Zona de Perigo - Only Admin */}
      {isAdmin && (
        <div className="mt-10 pt-6 border-t border-red-500/30">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Zona de Perigo</h3>
          <div className="mt-4 p-4 border border-red-500/50 dark:border-red-400/50 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Excluir este ambiente</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Uma vez que você exclui um ambiente, não há como voltar atrás.</p>
            </div>
            <button
              onClick={handleDeleteEnvironment}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm"
            >
              <LogOutIcon className="w-4 h-4" />
              <span>Excluir Ambiente</span>
            </button>
          </div>
        </div>
      )}
    </SettingsPageLayout>
  );
};

export default ConfiguracoesGerais;
