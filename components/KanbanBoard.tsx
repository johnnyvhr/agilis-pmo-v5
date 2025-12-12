
import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { Project, Task, TaskStatus } from '../types';
import { FilterIcon } from './icons';

interface KanbanBoardProps {
  onEditTask: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onEditTask }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, tasks, updateTask, departments } = useProjectContext();

  const project = projects.find(p => p.id === Number(id));
  const filteredTasksSource = tasks.filter(t => t.projectName === project?.name);

  // We need to pass setTasks-like behavior for drag and drop
  // KanbanBoard uses setTasks(prev => ...)
  // updateTask(task) updates a single task.
  // We need to adapt the onDrop logic.

  const setTasks = (action: React.SetStateAction<Task[]>) => {
    // This is a dummy or adapter.
    // Kanban calls setTasks with functional update or value.
    // But we can't update all tasks via this in Context easily if we don't change logic.
    // We should change logic in the component body.
  };
  // Filter State
  // Use filteredTasksSource for initial data or subsequent filters??
  // The component logic filters 'tasks' prop. Now 'filteredTasksSource'.
  const initialFilterState = { startDate: '', endDate: '', responsible: '', status: 'Todos', department: 'Todos', group: 'Todos' };
  const [filters, setFilters] = useState(initialFilterState);
  const [appliedFilters, setAppliedFilters] = useState(initialFilterState);

  // Get unique groups for the filter dropdown
  const uniqueGroups = useMemo(() => {
    const groups = filteredTasksSource.map(t => t.group).filter(Boolean);
    return Array.from(new Set(groups)).sort();
  }, [filteredTasksSource]);

  // Filter Logic
  const filteredTasks = useMemo(() => {
    return filteredTasksSource.filter(task => {
      const taskStartDate = new Date(task.plannedStart);
      const filterStartDate = appliedFilters.startDate ? new Date(appliedFilters.startDate) : null;
      const filterEndDate = appliedFilters.endDate ? new Date(appliedFilters.endDate) : null;

      if (filterStartDate && taskStartDate < filterStartDate) return false;
      if (filterEndDate && taskStartDate > filterEndDate) return false;
      if (appliedFilters.responsible && !task.responsible.toLowerCase().includes(appliedFilters.responsible.toLowerCase())) return false;
      if (appliedFilters.status !== 'Todos' && task.status !== appliedFilters.status) return false;
      if (appliedFilters.department !== 'Todos' && task.department !== appliedFilters.department) return false;
      if (appliedFilters.group !== 'Todos' && task.group !== appliedFilters.group) return false;

      return true;
    });
  }, [filteredTasksSource, appliedFilters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    setFilters(initialFilterState);
    setAppliedFilters(initialFilterState);
  };

  // Drag and Drop Logic
  const onDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("taskId", taskId.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData("taskId");
    if (!taskIdStr) return;

    const taskId = parseInt(taskIdStr);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask({ ...task, status: newStatus });
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Não Iniciada': return 'bg-gray-100 border-t-4 border-gray-400';
      case 'Em Andamento': return 'bg-blue-50 border-t-4 border-blue-500';
      case 'Concluída': return 'bg-green-50 border-t-4 border-green-500';
      case 'Atrasada': return 'bg-red-50 border-t-4 border-red-500';
      case 'Travado': return 'bg-slate-100 border-t-4 border-slate-600';
      default: return 'bg-white border-t-4 border-gray-200';
    }
  };

  if (!project) {
    return (
      <div className="p-8 bg-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Kanban do Projeto</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-slate-600">Por favor, selecione um projeto na barra lateral.</p>
        </div>
      </div>
    );
  }

  const columns: TaskStatus[] = ['Não Iniciada', 'Em Andamento', 'Concluída', 'Atrasada', 'Travado'];

  return (
    <div className="p-8 bg-slate-100 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Kanban - {project.name}</h1>
        <button onClick={() => project && navigate(`/projeto/${project.id}/cronograma`)} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
          <span className="mr-1">&larr;</span> Voltar ao Cronograma
        </button>
      </div>

      {/* Filters (Replicated from ProjectCronograma) */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 items-end">
          <div className="flex-grow" style={{ minWidth: '130px' }}>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Data Início (De):</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
          </div>
          <div className="flex-grow" style={{ minWidth: '130px' }}>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">Data Início (Até):</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
          </div>
          <div className="flex-grow" style={{ minWidth: '130px' }}>
            <label htmlFor="group" className="block text-sm font-medium text-slate-700">Fase/Grupo:</label>
            <select name="group" value={filters.group} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
              <option>Todos</option>
              {uniqueGroups.map(grp => <option key={grp} value={grp}>{grp}</option>)}
            </select>
          </div>
          <div className="flex-grow" style={{ minWidth: '130px' }}>
            <label htmlFor="responsible" className="block text-sm font-medium text-slate-700">Responsável:</label>
            <input type="text" name="responsible" value={filters.responsible} onChange={handleFilterChange} placeholder="Filtrar por nome" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
          </div>
          <div className="flex-grow" style={{ minWidth: '130px' }}>
            <label htmlFor="department" className="block text-sm font-medium text-slate-700">Departamento:</label>
            <select name="department" value={filters.department} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
              <option>Todos</option>
              {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>
          <div className="flex-grow" style={{ minWidth: '130px' }}>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status:</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
              <option>Todos</option>
              {columns.map(status => <option key={status}>{status}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={clearFilters} className="flex items-center justify-center space-x-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm font-medium h-10 w-full" title="Limpar Filtros">
              <FilterIcon className="w-4 h-4" />
            </button>
            <button onClick={handleApplyFilters} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium h-10 w-full">
              <span>Aplicar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-grow overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max h-full">
          {columns.map(status => (
            <div
              key={status}
              className={`w-80 rounded-lg p-4 flex flex-col h-full ${getStatusColor(status)} shadow-sm`}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, status)}
            >
              <h3 className="font-bold text-slate-700 mb-4 flex justify-between items-center">
                {status}
                <span className="bg-white px-2 py-0.5 rounded-full text-xs text-slate-500 shadow-sm border border-slate-200">
                  {filteredTasks.filter(t => t.status === status).length}
                </span>
              </h3>

              <div className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-2">
                {filteredTasks.filter(t => t.status === status).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    onClick={() => onEditTask(task)}
                    className="bg-white p-3 rounded shadow-sm border border-slate-200 cursor-move hover:shadow-md transition-shadow active:cursor-grabbing"
                  >
                    <div className="text-xs text-slate-500 mb-1">{task.group}</div>
                    <div className="font-semibold text-slate-800 mb-2 cursor-pointer hover:text-blue-600">{task.name}</div>
                    <div className="text-xs text-slate-600 mb-1">
                      <span className="font-medium">Resp:</span> {task.responsible}
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      <span>{new Date(task.plannedEnd).toLocaleDateString('pt-BR')}</span>
                      {task.percentComplete > 0 && (
                        <span className={`px-1.5 py-0.5 rounded ${task.percentComplete === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {task.percentComplete}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredTasks.filter(t => t.status === status).length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-300 rounded">
                    Arraste tarefas aqui
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
