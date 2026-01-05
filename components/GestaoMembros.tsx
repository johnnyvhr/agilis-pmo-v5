
import React from 'react';
import { User, ROLE_LABELS, UserRole } from '../types';
import { PlusIcon, PencilIcon } from './icons';
import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';
import ConfirmationDialog from './ui/ConfirmationDialog';

interface GestaoMembrosProps {
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
}

import { useToast } from '../context/ToastContext';

const GestaoMembros: React.FC<GestaoMembrosProps> = ({ users, onAddUser, onEditUser }) => {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // Confirmation Dialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: 'default' | 'destructive';
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { },
    variant: 'default'
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(users.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string | number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    setConfirmConfig({
      isOpen: true,
      title: "Remover Membros Selecionados",
      description: `Tem certeza que deseja remover ${selectedIds.length} selecionados? Esta ação removerá o acesso deles ao Workspace.`,
      variant: 'destructive',
      onConfirm: async () => {
        setLoading(true);
        try {
          const inviteIds = selectedIds.filter(id => String(id).startsWith('invite-'));
          const memberIds = selectedIds.filter(id => !String(id).startsWith('invite-'));

          // 1. Delete Invites
          if (inviteIds.length > 0) {
            const cleanInviteIds = inviteIds.map(id => String(id).replace('invite-', ''));
            const { error: inviteError } = await supabase
              .from('invitations')
              .delete()
              .in('id', cleanInviteIds);

            if (inviteError) throw inviteError;
          }

          // 2. Delete Active Members
          if (memberIds.length > 0) {
            const { error: memberError } = await supabase
              .from('space_members')
              .delete()
              .in('user_id', memberIds);

            if (memberError) throw memberError;
          }

          toast.success(`${selectedIds.length} removidos com sucesso.`);
          setSelectedIds([]);
          window.location.reload();

        } catch (error: any) {
          toast.error('Erro ao remover: ' + error.message);
        } finally {
          setLoading(false);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="p-8 bg-slate-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Gerenciamento de Membros</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-800">Membros da Organização</h2>
            {selectedIds.length > 0 && (
              <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-1 rounded-md border border-red-200 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="font-semibold">{selectedIds.length} selecionados</span>
                <button
                  onClick={handleBulkDelete}
                  className="text-red-700 hover:text-red-900 hover:underline font-bold ml-2"
                >
                  Remover Selecionados
                </button>
              </div>
            )}
          </div>
          <button onClick={onAddUser} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-bold">
            <PlusIcon className="w-4 h-4" />
            <span>Convidar Membro</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>

                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={users.length > 0 && selectedIds.length === users.length}
                  />
                </th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Nome do Membro</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Função</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.length > 0 ? users.map(user => (
                <tr key={user.id} className={`hover:bg-slate-50 ${selectedIds.includes(user.id) ? 'bg-blue-50' : ''}`}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => handleSelectRow(user.id)}
                    />
                  </td>
                  <td className="p-3 font-medium text-slate-800">{user.name}</td>
                  <td className="p-3 text-slate-600">{ROLE_LABELS[user.role as UserRole] || user.role}</td>
                  <td className="p-3">
                    <button onClick={() => onEditUser(user)} className="text-slate-500 hover:text-blue-600">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-slate-500">Nenhum membro cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        variant={confirmConfig.variant}
      />
    </div>
  );
};


export default GestaoMembros;
