import React, { useState, useMemo } from 'react';
import StatCard from './StatCard';
import ProjectSummaryTable from './ProjectSummaryTable';
import { Project, ProjectStatus } from '../types';
import GanttChart, { ViewMode } from './GanttChart';

interface DashboardProps {
  projects: Project[];
  onEditProject: (project: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onEditProject }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status !== ProjectStatus.Concluido).length;
  const concludedProjects = projects.filter(p => p.status === ProjectStatus.Concluido).length;
  const delayedProjects = projects.filter(p => p.status === ProjectStatus.Atrasado).length;

  // Logic for Gantt Chart
  const ganttProjects = projects.map(p => ({
    name: p.name,
    startDate: new Date(p.startDate),
    endDate: new Date(p.endDate),
  }));

  // Dynamic Date Calculation
  const { overallStartDate, overallEndDate } = useMemo(() => {
    if (projects.length === 0) {
      const now = new Date();
      return { 
        overallStartDate: new Date(now.getFullYear(), 0, 1), 
        overallEndDate: new Date(now.getFullYear(), 11, 31) 
      };
    }

    const startDates = projects.map(p => new Date(p.startDate).getTime());
    const endDates = projects.map(p => new Date(p.endDate).getTime());

    const minDate = new Date(Math.min(...startDates));
    const maxDate = new Date(Math.max(...endDates));

    // Add buffer (1 month before, 2 months after)
    minDate.setMonth(minDate.getMonth() - 1);
    maxDate.setMonth(maxDate.getMonth() + 2);

    return { overallStartDate: minDate, overallEndDate: maxDate };
  }, [projects]);

  return (
    <div className="p-8 bg-slate-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard do Portfólio</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total de Projetos" value={String(totalProjects)} />
        <StatCard title="Projetos Ativos" value={String(activeProjects)} />
        <StatCard title="Projetos Concluídos" value={String(concludedProjects)} valueColor="text-green-500" />
        <StatCard title="Projetos Atrasados" value={String(delayedProjects)} valueColor="text-red-500" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Orçamento Total" value="R$ 0" />
        <StatCard title="Custo Total Real" value="R$ 0" />
        <StatCard title="Variação de Custo" value="R$ 0" valueColor="text-green-500" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Resumo de Projetos no Portfólio</h2>
        <ProjectSummaryTable projects={projects} onEdit={onEditProject} />
      </div>

      {projects.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Cronograma Geral do Portfólio</h2>
            <div className="flex space-x-2 mt-2 md:mt-0">
                <button 
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1 text-xs font-medium rounded-md border ${viewMode === 'day' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                  Dia
                </button>
                <button 
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 text-xs font-medium rounded-md border ${viewMode === 'week' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                  Semana
                </button>
                <button 
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 text-xs font-medium rounded-md border ${viewMode === 'month' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                  Mês
                </button>
                 <button 
                  onClick={() => setViewMode('quarter')}
                  className={`px-3 py-1 text-xs font-medium rounded-md border ${viewMode === 'quarter' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                  Trimestre
                </button>
            </div>
          </div>
          <div className="overflow-x-auto">
             <GanttChart 
                projects={ganttProjects} 
                startDate={overallStartDate} 
                endDate={overallEndDate} 
                viewMode={viewMode}
             />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;