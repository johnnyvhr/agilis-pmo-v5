
import React from 'react';
import { Project, ProjectStatus } from '../types';
import { PencilIcon } from './icons';

interface ProjectSummaryTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
}

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.Atrasado:
      return 'bg-red-100 text-red-700';
    case ProjectStatus.Concluido:
      return 'bg-green-100 text-green-700';
    case ProjectStatus.EmDia:
       return 'bg-blue-100 text-blue-700';
    case ProjectStatus.EmAndamento:
        return 'bg-yellow-100 text-yellow-700';
    case ProjectStatus.EmPlanejamento:
        return 'bg-indigo-100 text-indigo-700';
    case ProjectStatus.Cancelado:
        return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const ProjectSummaryTable: React.FC<ProjectSummaryTableProps> = ({ projects, onEdit }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Nome do Projeto</th>
            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Gerente</th>
            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Início Previsto</th>
            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Término Previsto</th>
            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {projects.map((project) => (
            <tr key={project.id}>
              <td className="p-3 text-slate-700 font-medium">{project.name}</td>
              <td className="p-3 text-slate-700">{project.manager}</td>
              <td className="p-3 text-slate-700">{project.client}</td>
              <td className="p-3 text-slate-700">{project.startDate}</td>
              <td className="p-3 text-slate-700">{project.endDate}</td>
              <td className="p-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </td>
              <td className="p-3">
                <button onClick={() => onEdit(project)} className="text-slate-500 hover:text-blue-600" aria-label={`Editar ${project.name}`}>
                  <PencilIcon className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectSummaryTable;