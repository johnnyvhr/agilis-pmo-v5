import React from 'react';
import { Team, User, TeamStatus } from '../types';
import { PlusIcon, PencilIcon } from './icons';

interface GestaoEquipesProps {
  teams: Team[];
  users: User[];
  onAddTeam: () => void;
  onEditTeam: (team: Team) => void;
}

const GestaoEquipes: React.FC<GestaoEquipesProps> = ({ teams, users, onAddTeam, onEditTeam }) => {

  const findUserById = (id: number) => users.find(u => u.id === id);

  const getStatusColor = (status: TeamStatus) => {
    switch (status) {
      case 'Ativa': return 'bg-green-100 text-green-700';
      case 'Inativa': return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="p-8 bg-slate-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestão de Equipes</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Equipes da Organização</h2>
          <button onClick={onAddTeam} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-bold">
            <PlusIcon className="w-4 h-4" />
            <span>Adicionar Equipe</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Nome da Equipe</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Líder</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Nº de Membros</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {teams.length > 0 ? teams.map(team => (
                <tr key={team.id}>
                  <td className="p-3">
                    <div className="font-medium text-slate-800">{team.name}</div>
                    <div className="text-slate-500">{team.description}</div>
                  </td>
                  <td className="p-3">{findUserById(team.leaderId)?.name || 'N/A'}</td>
                  <td className="p-3">{team.members.length}</td>
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
                  <td colSpan={5} className="text-center p-6 text-slate-500">Nenhuma equipe cadastrada.</td>
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