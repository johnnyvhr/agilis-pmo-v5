import React from 'react';
import SettingsPageLayout from './SettingsPageLayout';

interface IntegracoesProps {
  onBack: () => void;
}

const IntegrationCard: React.FC<{ name: string; logoUrl: string; description: string; connected?: boolean }> = ({ name, logoUrl, description, connected = false }) => (
  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg flex flex-col items-center text-center">
    <img src={logoUrl} alt={`${name} logo`} className="w-12 h-12 mb-3" />
    <h3 className="font-bold text-slate-800 dark:text-slate-200">{name}</h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 flex-grow my-2">{description}</p>
    {connected ? (
      <button className="w-full mt-2 px-3 py-1.5 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-500 font-medium text-sm">
        Gerenciar
      </button>
    ) : (
      <button className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm">
        Conectar
      </button>
    )}
  </div>
);

const Integracoes: React.FC<IntegracoesProps> = ({ onBack }) => {
  return (
    <SettingsPageLayout title="Integrações" onBack={onBack}>
      <p className="text-slate-600 dark:text-slate-400 mb-6">Conecte o Agilis PMO com as ferramentas que você já usa para automatizar fluxos de trabalho.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <IntegrationCard 
          name="Slack"
          logoUrl="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg"
          description="Receba notificações de projetos e tarefas diretamente no Slack."
          connected
        />
        <IntegrationCard 
          name="Jira"
          logoUrl="https://cdn.worldvectorlogo.com/logos/jira-1.svg"
          description="Sincronize issues do Jira com tarefas do Agilis PMO."
        />
        <IntegrationCard 
          name="Trello"
          logoUrl="https://cdn.worldvectorlogo.com/logos/trello.svg"
          description="Importe quadros e cartões do Trello como projetos e tarefas."
        />
         <IntegrationCard 
          name="GitHub"
          logoUrl="https://cdn.worldvectorlogo.com/logos/github-icon-1.svg"
          description="Associe commits e pull requests a tarefas do projeto."
        />
      </div>
    </SettingsPageLayout>
  );
};

export default Integracoes;
