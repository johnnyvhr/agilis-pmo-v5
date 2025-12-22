
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { TrashIcon } from './icons';
import { supabase } from '../lib/supabaseClient';

interface TaskFormModalProps {
    onClose: () => void;
    onSave: (task: Omit<Task, 'id'> & { id?: number }) => void;
    onDelete: (taskId: number) => void;
    taskToEdit: Task | null;
    projectName: string;
    departments: string[]; // Keeping this prop for compatibility, but we'll use DB data.
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ onClose, onSave, onDelete, taskToEdit, projectName }) => {

    // Departments state
    const [dbDepartments, setDbDepartments] = useState<string[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            setLoadingDepartments(true);
            const { data, error } = await supabase
                .from('departments')
                .select('name')
                .order('name', { ascending: true });

            if (!error && data) {
                setDbDepartments(data.map((d: any) => d.name));
            } else if (error) {
                console.error("Error fetching departments", error);
            }
            setLoadingDepartments(false);
        };

        fetchDepartments();
    }, []);

    const getInitialFormData = () => {
        if (taskToEdit) {
            return taskToEdit;
        }
        return {
            projectName: projectName,
            group: '',
            name: '',
            responsible: '',
            department: '',
            plannedStart: '',
            plannedEnd: '',
            plannedDuration: 0,
            percentComplete: 0,
            status: 'Não Iniciada' as TaskStatus,
            actualStart: undefined,
            actualEnd: undefined,
            actualDuration: undefined,
        };
    };

    const [formData, setFormData] = useState<Omit<Task, 'id'>>(getInitialFormData);

    useEffect(() => {
        // If editing and departments are loaded, ensure the department matches if possible.
        // If adding new, we can default to the first department if we want, or keep empty.
        // For editing, getInitialFormData handles it.
        // We just need to make sure formData is updated if taskToEdit changes.
        setFormData(getInitialFormData());
    }, [taskToEdit, projectName]);

    // Calculate planned duration
    useEffect(() => {
        if (formData.plannedStart && formData.plannedEnd) {
            const start = new Date(formData.plannedStart);
            const end = new Date(formData.plannedEnd);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
                const diffTime = end.getTime() - start.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
                setFormData(prev => ({ ...prev, plannedDuration: diffDays }));
            } else {
                setFormData(prev => ({ ...prev, plannedDuration: 0 }));
            }
        } else {
            setFormData(prev => ({ ...prev, plannedDuration: 0 }));
        }
    }, [formData.plannedStart, formData.plannedEnd]);

    // Calculate actual duration
    useEffect(() => {
        if (formData.actualStart && formData.actualEnd) {
            const start = new Date(formData.actualStart);
            const end = new Date(formData.actualEnd);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
                const diffTime = end.getTime() - start.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
                setFormData(prev => ({ ...prev, actualDuration: diffDays }));
            } else {
                setFormData(prev => ({ ...prev, actualDuration: 0 }));
            }
        } else {
            setFormData(prev => ({ ...prev, actualDuration: 0 }));
        }
    }, [formData.actualStart, formData.actualEnd]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (name === 'percentComplete') ? parseInt(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = taskToEdit ? { ...formData, id: taskToEdit.id } : formData;
        onSave(dataToSave);
    };

    const handleDelete = () => {
        if (taskToEdit) {
            onDelete(taskToEdit.id);
        }
    };

    // Check if fields should be locked (when status is 'Travado')
    const isLocked = formData.status === 'Travado';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{taskToEdit ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl" aria-label="Fechar">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Atividade/Marco *</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="group" className="block text-sm font-medium text-slate-700">Fase/Grupo</label>
                            <input type="text" id="group" name="group" value={formData.group} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="responsible" className="block text-sm font-medium text-slate-700">Responsável</label>
                            <input type="text" id="responsible" name="responsible" value={formData.responsible} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-slate-700">Departamento</label>
                            <select id="department" name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                                <option value="">Selecione...</option>
                                {loadingDepartments && <option disabled>Carregando departamentos...</option>}
                                {!loadingDepartments && dbDepartments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="p-4 border rounded-md">
                        <h3 className="font-semibold text-slate-700 mb-2">Planejado</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="plannedStart" className="block text-sm font-medium text-slate-700">Início Previsto</label>
                                <input type="date" id="plannedStart" name="plannedStart" value={formData.plannedStart} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="plannedEnd" className="block text-sm font-medium text-slate-700">Término Previsto</label>
                                <input type="date" id="plannedEnd" name="plannedEnd" value={formData.plannedEnd} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="plannedDuration" className="block text-sm font-medium text-slate-700">Duração (dias)</label>
                                <input type="number" id="plannedDuration" name="plannedDuration" value={formData.plannedDuration} readOnly className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-100" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border rounded-md relative">
                        {isLocked && (
                            <div className="absolute top-0 right-0 p-2 text-xs text-red-500 font-bold bg-white border border-red-200 rounded-bl-md">
                                Campos bloqueados (Status: Travado)
                            </div>
                        )}
                        <h3 className="font-semibold text-slate-700 mb-2">Real</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="actualStart" className="block text-sm font-medium text-slate-700">Início Real</label>
                                <input
                                    type="date"
                                    id="actualStart"
                                    name="actualStart"
                                    value={formData.actualStart || ''}
                                    onChange={handleChange}
                                    disabled={isLocked}
                                    className={`mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md ${isLocked ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}
                                />
                            </div>
                            <div>
                                <label htmlFor="actualEnd" className="block text-sm font-medium text-slate-700">Término Real</label>
                                <input
                                    type="date"
                                    id="actualEnd"
                                    name="actualEnd"
                                    value={formData.actualEnd || ''}
                                    onChange={handleChange}
                                    disabled={isLocked}
                                    className={`mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md ${isLocked ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}
                                />
                            </div>
                            <div>
                                <label htmlFor="actualDuration" className="block text-sm font-medium text-slate-700">Duração Real (dias)</label>
                                <input type="number" id="actualDuration" name="actualDuration" value={formData.actualDuration || 0} readOnly className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-100" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="percentComplete" className="block text-sm font-medium text-slate-700">% Concluído</label>
                            <input
                                type="number"
                                id="percentComplete"
                                name="percentComplete"
                                min="0"
                                max="100"
                                value={formData.percentComplete}
                                onChange={handleChange}
                                disabled={isLocked}
                                className={`mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md ${isLocked ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}
                            />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                                <option>Não Iniciada</option>
                                <option>Em Andamento</option>
                                <option>Concluída</option>
                                <option>Atrasada</option>
                                <option className="text-slate-900 font-bold bg-slate-100">Travado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <div>
                            {taskToEdit && (
                                <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium flex items-center space-x-2">
                                    <TrashIcon className="w-4 h-4" /> <span>Excluir</span>
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-medium">
                                Cancelar
                            </button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                                {taskToEdit ? 'Salvar Alterações' : 'Salvar Tarefa'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskFormModal;
