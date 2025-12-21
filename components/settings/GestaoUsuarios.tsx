
import React from 'react';
import SettingsPageLayout from './SettingsPageLayout';
import { User, ROLE_LABELS, UserRole } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon } from '../icons';

interface GestaoUsuariosProps {
  onBack: () => void;
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: number) => void;
}

const GestaoUsuarios: React.FC<GestaoUsuariosProps> = ({ onBack, users, onAddUser, onEditUser, onDeleteUser }) => {
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Inativo':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <SettingsPageLayout title="Gestão de Usuários" onBack={onBack}>
      <div className="flex justify-between items-center mb-4">
        <p className="text-slate-600 dark:text-slate-400">Gerencie quem tem acesso a este ambiente.</p>
        <button onClick={onAddUser} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-bold">
          <PlusIcon className="w-4 h-4" />
          <span>Convidar Membro</span>
        </button>
      </div>
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
            <tr>
              <th className="p-3 font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Nome</th>
              <th className="p-3 font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Função</th>
              <th className="p-3 font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
              <th className="p-3 font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-3 text-slate-700 dark:text-slate-200">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                </td>
                <td className="p-3 text-slate-700 dark:text-slate-300">{ROLE_LABELS[user.role as UserRole] || user.role}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-3">
                    <button onClick={() => onEditUser(user)} className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400" aria-label={`Editar ${user.name}`}>
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteUser(user.id)} className="text-slate-500 hover:text-red-600 dark:hover:text-red-400" aria-label={`Remover ${user.name}`}>
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsPageLayout>
  );
};

export default GestaoUsuarios;
