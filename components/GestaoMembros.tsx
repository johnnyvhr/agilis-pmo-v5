
import React from 'react';
import { User } from '../types';
import { PlusIcon, PencilIcon } from './icons';

interface GestaoMembrosProps {
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
}

const GestaoMembros: React.FC<GestaoMembrosProps> = ({ users, onAddUser, onEditUser }) => {
  return (
    <div className="p-8 bg-slate-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Gerenciamento de Membros</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Membros da Organização</h2>
          <button onClick={onAddUser} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-bold">
            <PlusIcon className="w-4 h-4" />
            <span>Convidar Membro</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Nome do Membro</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Função</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.length > 0 ? users.map(user => (
                <tr key={user.id}>
                  <td className="p-3 font-medium text-slate-800">{user.name}</td>
                  <td className="p-3 text-slate-600">{user.role}</td>
                  <td className="p-3">
                    <button onClick={() => onEditUser(user)} className="text-slate-500 hover:text-blue-600">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="text-center p-6 text-slate-500">Nenhum membro cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestaoMembros;
