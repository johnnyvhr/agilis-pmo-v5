
import React from 'react';
import { Project } from '../types';
import StatCard from './StatCard';

interface ProjectDashboardProps {
  project: Project | null;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project }) => {
  if (!project) {
    return (
      <div className="p-8 bg-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard do Projeto</h1>
         <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-slate-600">Por favor, selecione um projeto na barra lateral para ver seu dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">{project.name}</h1>
      <p className="text-slate-500 mb-6">Gerente: {project.manager} | Cliente: {project.client}</p>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Status do Projeto" value={project.status} />
        <StatCard title="Data de Início" value={project.startDate} />
        <StatCard title="Data de Término" value={project.endDate} />
        <StatCard title="SPI (Índice de Desempenho de Prazo)" value="N/A" />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Orçamento" value="R$ 0" />
        <StatCard title="Custo Real" value="R$ 0" />
        <StatCard title="Variação de Custo" value="R$ 0" />
        <StatCard title="CPI (Índice de Desempenho de Custo)" value="N/A" />
      </div>
       <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Mais detalhes do projeto aqui...</h2>
        <p className="text-slate-600">Outros gráficos e informações sobre o andamento do projeto {project.name}.</p>
      </div>
    </div>
  );
};

export default ProjectDashboard;
