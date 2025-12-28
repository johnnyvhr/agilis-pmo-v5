import React, { useState } from 'react';
import {
  UsersIcon,
  CreditCardIcon,
  BuildingIcon,
  LinkIcon,
  ShieldIcon,
  UserCircleIcon,
  BellIcon,
  SunIcon,
  ArrowLeftIcon
} from './icons';
import GestaoUsuarios from './settings/GestaoUsuarios';
import Faturamento from './settings/Faturamento';
import ConfiguracoesGerais from './settings/ConfiguracoesGerais';
import Integracoes from './settings/Integracoes';
import Seguranca from './settings/Seguranca';
import DadosPessoais from './settings/DadosPessoais';
import Notificacoes from './settings/Notificacoes';
import Aparencia from './settings/Aparencia';
import { User, UserRole } from '../types';

interface SettingsProps {
  onClose: () => void;
  currentUser: User;
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
}

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm text-left w-full hover:shadow-md hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-blue-100 dark:bg-slate-700 p-3 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

const Settings: React.FC<SettingsProps> = ({ onClose, currentUser, users, onAddUser, onEditUser, onDeleteUser, companyName, setCompanyName }) => {
  const [currentView, setCurrentView] = useState('main');

  const renderMainSettings = () => (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Configurações</h1>
      </div>

      {currentUser.role === UserRole.Admin && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">Configurações do Ambiente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SettingsCard
              icon={<UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              title="Gestão de Usuários"
              description="Convide, remova e altere funções dos membros."
              onClick={() => setCurrentView('users')}
            />
            <SettingsCard
              icon={<CreditCardIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              title="Faturamento e Assinatura"
              description="Gerencie seu plano, faturas e forma de pagamento."
              onClick={() => setCurrentView('billing')}
            />
            <SettingsCard
              icon={<BuildingIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              title="Configurações Gerais"
              description="Altere o nome e a URL do seu ambiente."
              onClick={() => setCurrentView('general')}
            />
            <SettingsCard
              icon={<LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              title="Integrações"
              description="Conecte com outras ferramentas (Slack, Jira, etc)."
              onClick={() => setCurrentView('integrations')}
            />
            <SettingsCard
              icon={<ShieldIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              title="Segurança"
              description="Configure logon único (SSO) e políticas de acesso."
              onClick={() => setCurrentView('security')}
            />
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">Configurações de Perfil</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SettingsCard
            icon={<UserCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            title="Dados Pessoais"
            description="Altere seu nome, foto de perfil e senha."
            onClick={() => setCurrentView('profile')}
          />
          <SettingsCard
            icon={<BellIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            title="Notificações"
            description="Escolha como e quando você quer ser notificado."
            onClick={() => setCurrentView('notifications')}
          />
          <SettingsCard
            icon={<SunIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            title="Aparência"
            description="Personalize a interface com temas claro ou escuro."
            onClick={() => setCurrentView('appearance')}
          />

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="mb-3">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Criar um novo ambiente?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Comece do zero com um novo portfólio, equipes e configurações em um ambiente separado.</p>
            <button
              onClick={() => alert('Redirecionando para o fluxo de criação de novo ambiente...')}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 group-hover:scale-105 transition-transform"
            >
              Criar Novo Ambiente
            </button>
          </div>
        </div>
      </section>
    </>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return <GestaoUsuarios onBack={() => setCurrentView('main')} users={users} onAddUser={onAddUser} onEditUser={onEditUser} onDeleteUser={onDeleteUser} />;
      case 'billing':
        return <Faturamento onBack={() => setCurrentView('main')} />;
      case 'general':
        return <ConfiguracoesGerais onBack={() => setCurrentView('main')} companyName={companyName} setCompanyName={setCompanyName} />;
      case 'integrations':
        return <Integracoes onBack={() => setCurrentView('main')} />;
      case 'security':
        return <Seguranca onBack={() => setCurrentView('main')} />;
      case 'profile':
        return <DadosPessoais onBack={() => setCurrentView('main')} />;
      case 'notifications':
        return <Notificacoes onBack={() => setCurrentView('main')} />;
      case 'appearance':
        return <Aparencia onBack={() => setCurrentView('main')} />;
      case 'main':
      default:
        return renderMainSettings();
    }
  };

  return (
    <div className="p-8 bg-slate-100 dark:bg-slate-900 min-h-screen">
      {renderContent()}
    </div>
  );
};

export default Settings;