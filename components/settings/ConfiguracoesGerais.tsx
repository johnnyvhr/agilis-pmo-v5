import React, { useState } from 'react';
import SettingsPageLayout from './SettingsPageLayout';
import { LogOutIcon } from '../icons';

interface ConfiguracoesGeraisProps {
  onBack: () => void;
  companyName: string;
  setCompanyName: (name: string) => void;
}

const ConfiguracoesGerais: React.FC<ConfiguracoesGeraisProps> = ({ onBack, companyName, setCompanyName }) => {
  const [localCompanyName, setLocalCompanyName] = useState(companyName);
  const [environmentUrl, setEnvironmentUrl] = useState('agilis-pmo.app/sua-empresa');

  const handleSave = () => {
    setCompanyName(localCompanyName);
    alert('Configurações salvas com sucesso!');
  };
  
  const handleDeleteEnvironment = () => {
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
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Ambiente</label>
          <input
            type="text"
            id="companyName"
            value={localCompanyName}
            onChange={(e) => setLocalCompanyName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
           <label htmlFor="environmentUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL do Ambiente</label>
           <input
            type="text"
            id="environmentUrl"
            value={environmentUrl}
            onChange={(e) => setEnvironmentUrl(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Atenção: Mudar a URL invalidará links de convite e compartilhamento existentes.</p>
        </div>
        
        <div className="flex justify-end">
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
            >
                Salvar Alterações
            </button>
        </div>
      </div>

      {/* Zona de Perigo */}
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
    </SettingsPageLayout>
  );
};

export default ConfiguracoesGerais;
