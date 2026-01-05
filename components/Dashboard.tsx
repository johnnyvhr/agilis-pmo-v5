import React, { useState, useMemo } from 'react';
import StatCard from './StatCard';
import ProjectSummaryTable, { type FilterState } from './ProjectSummaryTable';
import { Project, ProjectStatus } from '../types';
import GanttChart, { ViewMode } from './GanttChart';
import { ImportIcon } from './icons';
import ProjectImportModal from './ProjectImportModal';
import { supabase } from '../lib/supabaseClient';
import ErrorBoundary from './ErrorBoundary';

interface DashboardProps {
  projects: Project[];
  onEditProject: (project: Project) => void;
}

import { useToast } from '../context/ToastContext';

export default function Dashboard({ projects, onEditProject }: DashboardProps) {
  const toast = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('quarter');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [managers, setManagers] = useState<{ id: string, name: string }[]>([]);

  // Filter State (Hoisted from Table)
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    manager: '',
    client: '',
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Fetch Managers (Profiles) for Filter
  React.useEffect(() => {
    const fetchManagers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name');

      if (data) {
        setManagers(data);
      }
    };
    fetchManagers();
  }, []);

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status !== ProjectStatus.Concluido).length;
  const concludedProjects = projects.filter(p => p.status === ProjectStatus.Concluido).length;


  // Unified Filtering Logic
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (filters.status && project.status !== filters.status) return false;
      if (filters.manager && project.manager !== filters.manager) return false;
      if (filters.client && project.client !== filters.client) return false;

      if (filters.startDate) {
        const projStart = new Date(project.startDate);
        const filterStart = new Date(filters.startDate);
        // Project starts after filter start
        if (!isNaN(projStart.getTime()) && projStart < filterStart) return false;
      }

      if (filters.endDate) {
        const projEnd = new Date(project.endDate);
        const filterEnd = new Date(filters.endDate);
        // Project ends before filter end
        if (!isNaN(projEnd.getTime()) && projEnd > filterEnd) return false;
      }

      return true;
    });
  }, [projects, filters]);

  // Logic for Gantt Chart (using filtered projects)
  // Logic for Gantt Chart (using filtered projects)
  // Logic for Gantt Chart (using filtered projects)
  // Helper to safely parse dates that might be in different formats
  const parseSafeDate = (val: string | Date | undefined | null): Date | null => {
    if (!val) return null;
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? null : val;
    }

    // DEBUG: Log incoming date to see what we are dealing with
    console.log('Parsing Date:', val);

    // Handle standard ISO string (YYYY-MM-DD or full ISO)
    let d = new Date(val);
    if (!isNaN(d.getTime())) {
      // Double check if it looked like Brazilian format but got parsed as US (e.g. 01/05/2023 becoming Jan 5 instead of May 1)
      // If the string contains '/', we treat it as potentially ambiguous and prefer manual parsing if safe.
      // However, generic matching is risky. Let's rely on specific check.
    }

    // Handle Brazilian format DD/MM/YYYY specifically
    if (typeof val === 'string' && val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        // Valid parts?
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const d2 = new Date(year, month, day);
          if (!isNaN(d2.getTime())) return d2;
        }
      }
    }

    // Return the ISO parsed date if valid
    if (!isNaN(d.getTime())) return d;

    console.warn('Failed to parse date:', val);
    return null;
  };

  const ganttProjects = useMemo(() => {
    return filteredProjects.map(p => {
      const startDate = parseSafeDate(p.startDate);
      const endDate = parseSafeDate(p.endDate);

      // If start date is invalid, we might default to today, but for the CHART RANGE calculation, we will filter these out.
      // For display purposes, we need a date.
      const effectiveStart = startDate || new Date();

      // Default end date logic
      let effectiveEnd = endDate;
      if (!effectiveEnd) {
        effectiveEnd = new Date(effectiveStart);
        effectiveEnd.setMonth(effectiveEnd.getMonth() + 1);
      }

      // Ensure End is after Start
      if (effectiveEnd < effectiveStart) {
        effectiveEnd = new Date(effectiveStart.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
      }

      return {
        name: p.name,
        startDate: effectiveStart,
        endDate: effectiveEnd,
        status: p.status,
        originalStart: startDate // Keep track if it was valid
      };
    });
  }, [filteredProjects]);

  // Dynamic Date Calculation - HARD RESET VIEWPORT
  const { overallStartDate, overallEndDate } = useMemo(() => {
    // Filter only projects that had VALID start dates for the range calculation
    // This prevents "Today" defaults from skewing the minimum if we have older valid projects.
    // Actually, we used 'effectiveStart' above which defaults to Today. 
    // We should look at 'originalStart' if we want to be strict, or just use the earliest effective date.
    // If the user has 2023 projects, min(2023, Today) is 2023. So effectiveStart is fine PROVIDED parsing works.

    if (ganttProjects.length === 0) {
      const now = new Date();
      return {
        overallStartDate: new Date(now.getFullYear(), 0, 1),
        overallEndDate: new Date(now.getFullYear(), 11, 31)
      };
    }

    const startDates = ganttProjects.map(p => p.startDate.getTime());
    const endDates = ganttProjects.map(p => p.endDate.getTime());

    const minTimestamp = Math.min(...startDates);
    const maxTimestamp = Math.max(...endDates);

    const minDate = new Date(minTimestamp);
    const maxDate = new Date(maxTimestamp);

    console.log("Calculated Earliest Date (Raw):", minDate);

    // Hard Reset: Ensure we start BEFORE the earliest project
    // Add buffer: Start 1 month before earliest project
    minDate.setMonth(minDate.getMonth() - 1);

    // Add buffer: End 2 months after latest project
    maxDate.setMonth(maxDate.getMonth() + 2);

    console.log("Gantt Viewport Start:", minDate);

    return { overallStartDate: minDate, overallEndDate: maxDate };
  }, [ganttProjects]);

  const handleImportProjects = async (importedProjects: Partial<Project>[]) => {
    // Map to DB Schema
    const projectsToInsert = importedProjects.map(p => ({
      code: p.code || null,
      name: p.name,
      client: p.client || null,
      start_date: p.startDate || null,
      end_date: p.endDate || null,
      status: p.status,
      description: p.description,
      manager_name: p.manager,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('projects').insert(projectsToInsert);

    if (error) {
      toast.error('Erro ao importar projetos: ' + error.message);
    } else {
      toast.success(`${projectsToInsert.length} projetos importados com sucesso!`);
      window.location.reload();
    }
  };

  const handleBulkUpdate = async (ids: number[], updates: Partial<Project>) => {
    try {
      const dbUpdates: any = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.manager) dbUpdates.manager_name = updates.manager;
      if (updates.client) dbUpdates.client = updates.client;
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .in('id', ids);

      if (error) throw error;

      toast.success('Projetos atualizados com sucesso!');
      window.location.reload();
    } catch (err: any) {
      toast.error('Erro na atualização em massa: ' + err.message);
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .in('id', ids);

      if (error) throw error;

      toast.success('Projetos excluídos com sucesso!');
      window.location.reload();
    } catch (err: any) {
      toast.error('Erro ao excluir projetos: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard do Portfólio</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            <ImportIcon className="w-5 h-5" />
            <span>Importar Excel</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total de Projetos" value={totalProjects} color="blue" />
        <StatCard title="Em Execução" value={activeProjects} color="yellow" />
        <StatCard title="Concluídos" value={concludedProjects} color="green" />

      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Resumo de Projetos no Portfólio</h3>
          <span className="text-sm text-slate-400">Exibindo {filteredProjects.length} registros</span>
        </div>
        <ProjectSummaryTable
          projects={filteredProjects}
          allProjects={projects}
          filters={filters}
          onFilterChange={handleFilterChange}
          onEdit={onEditProject}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          managers={managers}
        />
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Linha do Tempo (Gantt)</h3>
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
          <ErrorBoundary>
            <GanttChart
              projects={ganttProjects}
              viewMode={viewMode}
              startDate={overallStartDate}
              endDate={overallEndDate}
            />
          </ErrorBoundary>
        </div>
      </div>

      <ProjectImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportProjects}
      />
    </div>
  );
}