import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus } from '../types';
import { PencilIcon, TrashIcon } from './icons';
import BulkProjectEditModal from './BulkProjectEditModal';
import { useConfirmation } from '../context/ConfirmationContext';

export interface FilterState {
  status: string;
  manager: string;
  client: string;
  startDate: string;
  endDate: string;
}

interface ProjectSummaryTableProps {
  projects: Project[]; // Filtered projects
  allProjects: Project[]; // All projects for dropdowns
  onEdit: (project: Project) => void;
  onBulkUpdate?: (ids: number[], updates: Partial<Project>) => void;
  onBulkDelete?: (ids: number[]) => void;
  managers?: { id: string, name: string }[];
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case ProjectStatus.Concluido:
      return 'bg-green-100 text-green-700';
    case 'Em Dia':
    case 'Atrasado':
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

const ProjectSummaryTable: React.FC<ProjectSummaryTableProps> = ({
  projects,
  allProjects,
  onEdit,
  onBulkUpdate,
  onBulkDelete,
  managers = [],
  filters,
  onFilterChange
}) => {
  const { confirm } = useConfirmation();

  // Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);

  // Derived Values for Dropdowns (using allProjects to show full options)
  const managerOptions = useMemo(() => {
    if (managers.length > 0) {
      return managers.map(m => m.name);
    }
    return Array.from(new Set(allProjects.map(p => p.manager).filter(Boolean)));
  }, [allProjects, managers]);

  const uniqueClients = useMemo(() => Array.from(new Set(allProjects.map(p => p.client).filter(Boolean))), [allProjects]);

  // Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(projects.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkEditSave = (updates: Partial<Project>) => {
    if (onBulkUpdate) {
      onBulkUpdate(selectedIds, updates);
      setIsBulkEditOpen(false);
      setSelectedIds([]); // Clear selection after action
    }
  };

  const handleBulkDeleteClick = async () => {
    if (!onBulkDelete) return;
    const confirmed = await confirm({
      title: 'Excluir Projetos',
      description: `Tem certeza que deseja EXCLUIR ${selectedIds.length} projetos? Esta ação é irreversível.`,
      confirmText: 'Excluir',
      variant: 'destructive'
    });

    if (confirmed) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-4">

      {/* 1. Filter Toolbar */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={e => onFilterChange('status', e.target.value)}
            className="w-full text-sm border-slate-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">Todos</option>
            {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Gerente</label>
          <select
            value={filters.manager}
            onChange={e => onFilterChange('manager', e.target.value)}
            className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            {managerOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Cliente</label>
          <select
            value={filters.client}
            onChange={e => onFilterChange('client', e.target.value)}
            className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Data Início (De)</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={e => onFilterChange('startDate', e.target.value)}
            className="w-full text-sm border-slate-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Data Término (Até)</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={e => onFilterChange('endDate', e.target.value)}
            className="w-full text-sm border-slate-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
      </div>

      {/* 2. Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex justify-between items-center animate-pulse">
          <span className="text-blue-800 font-semibold text-sm">{selectedIds.length} projetos selecionados</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsBulkEditOpen(true)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
            >
              Editar Selecionados
            </button>
            <button
              onClick={handleBulkDeleteClick}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 flex items-center"
            >
              <TrashIcon className="w-4 h-4 mr-1" /> Excluir
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-md">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {/* Checkbox Header */}
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={projects.length > 0 && selectedIds.length === projects.length}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Nome do Projeto</th>
              <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Gerente</th>
              <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
              <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Início Previsto</th>
              <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Término Previsto</th>
              <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
            {projects.length > 0 ? projects.map((project) => (
              <tr key={project.id} className={selectedIds.includes(project.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors'}>
                {/* Checkbox Cell */}
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(project.id)}
                    onChange={() => handleSelectRow(project.id)}
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-700"
                  />
                </td>
                <td className="p-3 font-medium whitespace-nowrap text-slate-700 dark:text-slate-200">{project.code || '-'}</td>
                <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{project.name}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{project.manager}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{project.client}</td>
                <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{project.startDate}</td>
                <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{project.endDate}</td>
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
            )) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  Nenhum projeto encontrado com os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <BulkProjectEditModal
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        onSave={handleBulkEditSave}
        selectedCount={selectedIds.length}
      />
    </div>
  );
};

export default ProjectSummaryTable;