import React from 'react';
import { Team, User, TeamStatus } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';
import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';

interface GestaoEquipesProps {
  teams: Team[];
  users: User[];
  onAddTeam: () => void;
  onEditTeam: (team: Team) => void;
}

import { useToast } from '../context/ToastContext';

const GestaoEquipes: React.FC<GestaoEquipesProps> = ({ teams = [], users, onAddTeam, onEditTeam }) => {
  const toast = useToast();

  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const findUserById = (id: string | number) => users?.find(u => u.id === id);

  const getStatusColor = (status: TeamStatus) => {
    switch (status) {
      case 'Ativa': return 'bg-green-100 text-green-700';
      case 'Inativa': return 'bg-red-100 text-red-700';
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(teams.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string | number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedIds || selectedIds.length === 0) return;

    if (window.confirm(`Tem certeza que deseja excluir ${selectedIds.length} equipes?`)) {
      const { error } = await supabase
        .from('teams')
        .delete()
        .in('id', selectedIds);

      if (error) {
        toast.error('Erro ao excluir equipes: ' + error.message);
      } else {
        toast.success(`${selectedIds.length} equipes excluídas com sucesso. A lista será atualizada.`);
        setSelectedIds([]);
        window.location.reload(); // Refresh to update props from parent
      }
    }
  };

  return (
    <div className="p-8 bg-slate-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestão de Equipes</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-800">Equipes da Organização</h2>
            {selectedIds?.length > 0 && (
              <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-1 rounded-md border border-red-200 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="font-semibold">{selectedIds.length} selecionados</span>
                <button
                  onClick={handleBulkDelete}
                  className="text-red-700 hover:text-red-900 hover:underline font-bold ml-2"
                >
                  Excluir Selecionados
                </button>
              </div>
            )}
          </div>
          <button onClick={onAddTeam} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-bold">
            <PlusIcon className="w-4 h-4" />
            <span>Adicionar Equipe</span>
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
                    checked={teams?.length > 0 && selectedIds?.length === teams.length}
                  />
                </th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Nome da Equipe</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Líder</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Nº de Membros</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {teams?.length > 0 ? teams.map(team => (
                <tr key={team.id} className={`hover:bg-slate-50 ${selectedIds?.includes(team.id) ? 'bg-blue-50' : ''}`}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds?.includes(team.id) ?? false}
                      onChange={() => handleSelectRow(team.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-800">{team.name}</div>
                    <div className="text-slate-500">{team.description}</div>
                  </td>
                  <td className="p-3">{findUserById(team.leaderId)?.name || 'N/A'}</td>
                  <td className="p-3">{team.members?.length || 0}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(team.status)}`}>
                      {team.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => onEditTeam(team)} className="text-slate-500 hover:text-blue-600">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-slate-500">Nenhuma equipe cadastrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestaoEquipes;