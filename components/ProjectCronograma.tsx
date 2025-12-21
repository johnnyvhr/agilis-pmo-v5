
declare const XLSX: any;
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { Project, Task, TaskStatus } from '../types';
import { EyeIcon, FilterIcon, ImportIcon, ExportIcon, PlusIcon, PencilIcon, TrashIcon, CopyIcon, BoardIcon } from './icons';
import GanttChart, { ViewMode } from './GanttChart';
import TaskDuplicateModal, { DuplicateConfig } from './TaskDuplicateModal';
import TaskImportModal from './TaskImportModal';

interface ProjectCronogramaProps {
    onAddTask: () => void;
    onEditTask: (task: Task) => void;
}

const ProjectCronograma: React.FC<ProjectCronogramaProps> = ({ onAddTask, onEditTask }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        projects,
        tasks,
        addTask,
        updateTask,
        departments,
        // We can access modals via context? No, modals are in App.
        // We need to trigger modals. App handles modals?
        // If modals are in App, we need a way to open them.
        // For now, let's keep onAddTask/onEditTask as props OR move modals to Context/Global.
        // But the prompt says "Migrate state...".
        // If I remove props, I lose onAddTask.
        // I should keep UI handler props OR use a UI Context.
        // I will keep UI handler props for now, but derive data from context.
    } = useProjectContext();

    const project = projects.find(p => p.id === Number(id));
    const projectTasks = tasks.filter(t => t.projectName === project?.name);

    const initialFilterState = { startDate: '', endDate: '', responsible: '', status: 'Todos', department: 'Todos', group: 'Todos' };
    const [filters, setFilters] = useState(initialFilterState);
    const [appliedFilters, setAppliedFilters] = useState(initialFilterState);
    const [viewMode, setViewMode] = useState<ViewMode>('month'); // Default to month as a safe fallback

    // Duplication State
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [taskToDuplicate, setTaskToDuplicate] = useState<Task | null>(null);

    // Import State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Intelligent Scale Prioritization (Auto-Fit)
    useEffect(() => {
        if (project) {
            const start = new Date(project.startDate).getTime();
            const end = new Date(project.endDate).getTime();
            const durationDays = (end - start) / (1000 * 60 * 60 * 24);

            // Determine appropriate scale based on duration
            if (durationDays > 365) {
                setViewMode('quarter');
            } else if (durationDays > 90) {
                setViewMode('month');
            } else if (durationDays > 30) {
                setViewMode('week');
            } else {
                setViewMode('day');
            }
        }
    }, [project?.id]); // Re-run when project changes

    // Get unique groups for the filter dropdown
    const uniqueGroups = useMemo(() => {
        const groups = projectTasks.map(t => t.group).filter(Boolean);
        return Array.from(new Set(groups)).sort();
    }, [projectTasks]);

    const filteredTasks = useMemo(() => {
        return projectTasks.filter(task => {
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
        }).sort((a, b) => {
            // Primary: Start Date (Ascending)
            const startA = new Date(a.plannedStart).getTime();
            const startB = new Date(b.plannedStart).getTime();
            if (startA !== startB) return startA - startB;

            // Secondary: End Date (Ascending)
            const endA = new Date(a.plannedEnd).getTime();
            const endB = new Date(b.plannedEnd).getTime();
            if (endA !== endB) return endA - endB;

            // Tertiary: Name (Alphabetical)
            return a.name.localeCompare(b.name);
        });
    }, [tasks, appliedFilters]);

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

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'Não Iniciada': return 'bg-gray-200 text-gray-800';
            case 'Em Andamento': return 'bg-blue-200 text-blue-800';
            case 'Concluída': return 'bg-green-200 text-green-800';
            case 'Atrasada': return 'bg-red-200 text-red-800';
            case 'Travado': return 'bg-slate-700 text-white';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    const handleExportXLSX = () => {
        if (tasks.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        // Map tasks to a user-friendly format for Excel
        const dataToExport = tasks.map(t => ({
            'ID Sistema': t.id,
            'Fase/Grupo': t.group,
            'Atividade/Marco': t.name,
            'Responsável': t.responsible,
            'Departamento': t.department,
            'Início Previsto': t.plannedStart,
            'Término Previsto': t.plannedEnd,
            'Duração (dias)': t.plannedDuration,
            '% Concluído': t.percentComplete,
            'Status': t.status,
            'Início Real': t.actualStart || '',
            'Término Real': t.actualEnd || '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Auto-width for columns
        const wscols = Object.keys(dataToExport[0]).map(key => ({ wch: Math.max(key.length, 15) }));
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cronograma");

        const fileName = `Cronograma_${project?.name || 'Projeto'}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handleImportClick = () => {
        setIsImportModalOpen(true);
    };

    const handleImportTasks = (importedTasks: Partial<Task>[], mode: 'append' | 'update') => {
        let addedCount = 0;
        let updatedCount = 0;

        importedTasks.forEach(importData => {
            const { id, ...data } = importData;

            // Calculate duration if dates exist
            let duration = 0;
            if (data.plannedStart && data.plannedEnd) {
                const start = new Date(data.plannedStart).getTime();
                const end = new Date(data.plannedEnd).getTime();
                duration = Math.ceil((end - start) / (1000 * 3600 * 24));
            }

            const taskPayload: any = {
                ...data,
                plannedDuration: duration,
                projectName: project?.name // Ensure it belongs to current project
            };

            if (mode === 'update' && id) {
                const existingTask = tasks.find(t => t.id === Number(id));
                if (existingTask) {
                    updateTask({ ...existingTask, ...taskPayload });
                    updatedCount++;
                } else {
                    // ID provided but not found, treat as new
                    addTask({ ...taskPayload, id: Date.now() + Math.random() } as Task);
                    addedCount++;
                }
            } else {
                // Append Mode or no ID
                addTask({ ...taskPayload, id: Date.now() + Math.random() } as Task);
                addedCount++;
            }
        });

        alert(`Importação concluída!\nTarefas adicionadas: ${addedCount}\nTarefas atualizadas: ${updatedCount}`);
    };

    const openDuplicateModal = (task: Task) => {
        setTaskToDuplicate(task);
        setIsDuplicateModalOpen(true);
    };

    const handleDuplicateTask = (config: DuplicateConfig) => {
        if (!taskToDuplicate) return;

        let plannedStart = taskToDuplicate.plannedStart;
        let plannedEnd = taskToDuplicate.plannedEnd;

        // Date Shifting Logic
        if (config.dateMode === 'shift' && config.newStartDate) {
            plannedStart = config.newStartDate;

            // Calculate original duration in milliseconds
            const originalStart = new Date(taskToDuplicate.plannedStart).getTime();
            const originalEnd = new Date(taskToDuplicate.plannedEnd).getTime();
            const durationMs = originalEnd - originalStart;

            // Calculate new end date
            const newStartMs = new Date(plannedStart).getTime();
            const newEndMs = newStartMs + durationMs;

            plannedEnd = new Date(newEndMs).toISOString().split('T')[0];
        }

        const newTask: Task = {
            ...taskToDuplicate,
            id: Date.now(),
            name: config.newName,
            projectName: config.targetProjectName,
            status: 'Não Iniciada',
            percentComplete: 0,
            plannedStart: plannedStart,
            plannedEnd: plannedEnd,
            responsible: config.includeResources ? taskToDuplicate.responsible : '',
            actualStart: undefined,
            actualEnd: undefined,
            actualDuration: undefined,
        };

        addTask(newTask);

        // Alert if duplicated to another project
        if (config.targetProjectName !== project?.name) {
            alert(`Tarefa duplicada com sucesso para o projeto "${config.targetProjectName}".`);
        }
    };


    if (!project) {
        return (
            <div className="p-8 bg-slate-100">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">Cronograma do Projeto</h1>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-slate-600">Por favor, selecione um projeto na barra lateral para ver seu cronograma.</p>
                </div>
            </div>
        );
    }

    const ganttTasks = filteredTasks.length > 0 ? filteredTasks.map(t => ({
        name: t.name,
        startDate: new Date(t.plannedStart),
        endDate: new Date(t.plannedEnd),
        status: t.status,
    })) : [];

    const allDates = ganttTasks.length > 0 ? ganttTasks.flatMap(t => [t.startDate, t.endDate]) : [new Date(project.startDate), new Date(project.endDate)];
    const overallStartDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const overallEndDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    overallStartDate.setDate(overallStartDate.getDate() - 5);
    overallEndDate.setDate(overallEndDate.getDate() + 10);

    return (
        <div className="p-8 bg-slate-100 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Cronograma - {project.name}</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => project && navigate(`/projeto/${project.id}/kanban`)}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm font-medium">
                        <BoardIcon className="w-4 h-4" />
                        <span>Acessar Kanban</span>
                    </button>
                    <button
                        onClick={() => project && navigate(`/projeto/${project.id}/vista`)}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm font-medium">
                        <EyeIcon className="w-4 h-4" />
                        <span>Acessar Gestão à Vista</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Filtros do Cronograma</h2>
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
                            <option>Não Iniciada</option>
                            <option>Em Andamento</option>
                            <option>Concluída</option>
                            <option>Atrasada</option>
                            <option>Travado</option>
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

            {/* Schedule Table */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Cronograma e Marcos</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleImportClick} className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm">
                            <ImportIcon className="w-4 h-4" />
                            <span>Importar (XLSX)</span>
                        </button>
                        <button onClick={handleExportXLSX} className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm">
                            <ExportIcon className="w-4 h-4" />
                            <span>Exportar (XLSX)</span>
                        </button>
                        <button onClick={onAddTask} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-bold">
                            <PlusIcon className="w-4 h-4" />
                            <span>Adicionar</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                {['FASE/GRUPO', 'ATIVIDADE/MARCO', 'RESPONSÁVEL', 'DEPARTAMENTO', 'INÍCIO PREVISTO', 'TÉRMINO PREVISTO', 'DURAÇÃO PREV. (DIA)', '% CONCLUÍDO', 'INÍCIO REAL', 'TÉRMINO REAL', 'DURAÇÃO REAL (DIA)', 'STATUS', 'AÇÕES'].map(header => (
                                    <th key={header} className="p-3 font-semibold text-slate-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredTasks.length > 0 ? filteredTasks.map(task => (
                                <tr key={task.id}>
                                    <td className="p-3">{task.group}</td>
                                    <td className="p-3 font-medium text-slate-800">{task.name}</td>
                                    <td className="p-3">{task.responsible}</td>
                                    <td className="p-3">{task.department || '-'}</td>
                                    <td className="p-3">{task.plannedStart}</td>
                                    <td className="p-3">{task.plannedEnd}</td>
                                    <td className="p-3">{task.plannedDuration}</td>
                                    <td className="p-3">{task.percentComplete}%</td>
                                    <td className="p-3">{task.actualStart || '-'}</td>
                                    <td className="p-3">{task.actualEnd || '-'}</td>
                                    <td className="p-3">{task.actualDuration || '-'}</td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>{task.status}</span></td>
                                    <td className="p-3">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => openDuplicateModal(task)} className="text-slate-500 hover:text-green-600" title="Duplicar Tarefa">
                                                <CopyIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => onEditTask(task)} className="text-slate-500 hover:text-blue-600" title="Editar Tarefa">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={13} className="text-center p-6 text-slate-500">Nenhum dado disponível.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Gantt Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Gráfico de Gantt - {project.name}</h2>
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
                    {ganttTasks.length > 0 ? (
                        <GanttChart
                            projects={ganttTasks}
                            startDate={overallStartDate}
                            endDate={overallEndDate}
                            viewMode={viewMode}
                        />
                    ) : (
                        <p className="text-center p-6 text-slate-500">Nenhuma tarefa para exibir no Gantt.</p>
                    )}
                </div>
            </div>

            <TaskDuplicateModal
                isOpen={isDuplicateModalOpen}
                onClose={() => setIsDuplicateModalOpen(false)}
                onDuplicate={handleDuplicateTask}
                taskToDuplicate={taskToDuplicate}
                projects={projects}
                currentProjectName={project.name}
            />

            <TaskImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportTasks}
                projectName={project.name}
            />
        </div>
    );
};

export default ProjectCronograma;
