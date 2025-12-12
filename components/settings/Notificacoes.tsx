import React, { useState } from 'react';
import SettingsPageLayout from './SettingsPageLayout';

const NotificationRow: React.FC<{ title: string, description: string }> = ({ title, description }) => {
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [appEnabled, setAppEnabled] = useState(true);

    return (
        <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="p-4">
                <p className="font-medium text-slate-800 dark:text-slate-200">{title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </td>
            <td className="p-4 text-center">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />
            </td>
            <td className="p-4 text-center">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={appEnabled} onChange={() => setAppEnabled(!appEnabled)} />
            </td>
        </tr>
    );
};


const Notificacoes: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
  return (
    <SettingsPageLayout title="Notificações" onBack={onBack}>
      <p className="text-slate-600 dark:text-slate-400 mb-6">Escolha como você recebe notificações. As configurações se aplicam a todos os seus ambientes.</p>
       <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="p-4 font-semibold text-slate-500 dark:text-slate-300">Atividade</th>
                <th className="p-4 font-semibold text-slate-500 dark:text-slate-300 text-center w-24">E-mail</th>
                <th className="p-4 font-semibold text-slate-500 dark:text-slate-300 text-center w-24">No App</th>
              </tr>
            </thead>
            <tbody>
              <NotificationRow 
                title="Menções"
                description="Quando alguém @menciona você em um comentário."
              />
               <NotificationRow 
                title="Tarefas Atribuídas"
                description="Quando uma nova tarefa é atribuída a você."
              />
               <NotificationRow 
                title="Atualizações de Tarefas"
                description="Quando há atualizações em tarefas que você segue."
              />
              <NotificationRow 
                title="Resumos de Projeto"
                description="Receba resumos semanais sobre o progresso dos projetos."
              />
            </tbody>
          </table>
        </div>
        <div className="pt-6 flex justify-end">
            <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
            >
                Salvar Preferências
            </button>
        </div>
    </SettingsPageLayout>
  );
};

export default Notificacoes;
