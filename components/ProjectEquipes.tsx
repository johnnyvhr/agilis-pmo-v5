import React from 'react';
import { Project, Team, User } from '../types';

interface ProjectEquipesProps {
  project: Project | null;
  allTeams: Team[];
  allUsers: User[];
}

const ProjectEquipes: React.FC<ProjectEquipesProps> = ({ project, allTeams, allUsers }) => {

  if (!project) {
    return (
      <div className="p-8 bg-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Equipes do Projeto</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-slate-600">Por favor, selecione um projeto na barra lateral para ver suas equipes.</p>
        </div>
      </div>
    );
  }
  
  const findUserById = (id: number) => allUsers.find(u => u.id === id);
  
  const associatedTeams = allTeams.filter(team => project.associatedTeamIds?.includes(team.id));

  return (
    <div className="p-8 bg-slate-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Equipes - {project.name}</h1>

      {associatedTeams.length > 0 ? (
        <div className="space-y-6">
          {associatedTeams.map(team => (
            <div key={team.id} className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">{team.name}</h2>
              <div className="mb-4">
                <p className="text-sm text-slate-500">Líder da Equipe</p>
                <p className="font-semibold text-slate-700">{findUserById(team.leaderId)?.name || 'Não definido'}</p>
              </div>
              <div>
                <h3 className="text-sm text-slate-500 mb-2">Membros</h3>
                <ul className="divide-y divide-slate-200">
                  {team.members.map(member => (
                    <li key={member.userId} className="py-2 flex justify-between items-center">
                       <span className="font-medium text-slate-600">{findUserById(member.userId)?.name || 'Usuário desconhecido'}</span>
                       <span className="text-sm text-slate-500">{member.roleInTeam}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-slate-600">Nenhuma equipe associada a este projeto.</p>
            <p className="text-sm text-slate-500 mt-2">Você pode associar equipes editando o projeto.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectEquipes;