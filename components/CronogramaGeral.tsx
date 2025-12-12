import React, { useState, useMemo } from 'react';
import GanttChart, { ViewMode } from './GanttChart';
import { Project } from '../types';

interface CronogramaGeralProps {
  projects: Project[];
}

const CronogramaGeral: React.FC<CronogramaGeralProps> = ({ projects }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  if (projects.length === 0) {
    return (
      <div className="p-8 bg-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Cronograma Geral</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-slate-600">Nenhum projeto para exibir. Adicione um novo projeto para ver o cronograma geral.</p>
        </div>
      </div>
    );
  }

  const ganttProjects = projects.map(p => ({
    name: p.name,
    startDate: new Date(p.startDate),
    endDate: new Date(p.endDate),
  }));

  // Dynamic Date Calculation
  const { overallStartDate, overallEndDate } = useMemo(() => {
    const startDates = ganttProjects.map(p => p.startDate.getTime());
    const endDates = ganttProjects.map(p => p.endDate.getTime());

    const minDate = new Date(Math.min(...startDates));
    const maxDate = new Date(Math.max(...endDates));

    // Add buffer
    minDate.setMonth(minDate.getMonth() - 1);
    maxDate.setMonth(maxDate.getMonth() + 2);

    return { overallStartDate: minDate, overallEndDate: maxDate };
  }, [ganttProjects]);

  return (
    <div className="p-8 bg-slate-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Cronograma Geral do Portfólio</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
         <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Visualização de Cronograma</h2>
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
    </div>
  );
};

export default CronogramaGeral;