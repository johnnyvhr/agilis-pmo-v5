import React, { useState, useEffect } from 'react';
import { Task, Project } from '../types';

interface TaskDuplicateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDuplicate: (config: DuplicateConfig) => void;
    taskToDuplicate: Task | null;
    projects: Project[];
    currentProjectName: string;
}

export interface DuplicateConfig {
    newName: string;
    targetProjectName: string;
    dateMode: 'original' | 'shift';
    newStartDate?: string;
    includeResources: boolean;
}

const TaskDuplicateModal: React.FC<TaskDuplicateModalProps> = ({ 
    isOpen, 
    onClose, 
    onDuplicate, 
    taskToDuplicate, 
    projects,
    currentProjectName
}) => {
    const [newName, setNewName] = useState('');
    const [targetProjectName, setTargetProjectName] = useState('');
    const [dateMode, setDateMode] = useState<'original' | 'shift'>('original');
    const [newStartDate, setNewStartDate] = useState('');
    const [includeResources, setIncludeResources] = useState(true);

    useEffect(() => {
        if (taskToDuplicate) {
            setNewName(`${taskToDuplicate.name} (Cópia)`);
            setTargetProjectName(currentProjectName);
            setDateMode('original');
            setNewStartDate('');
            setIncludeResources(true);
        }
    }, [taskToDuplicate, currentProjectName, isOpen]);

    if (!isOpen || !taskToDuplicate) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (dateMode === 'shift' && !newStartDate) {
            alert('Por favor, selecione uma nova data de início.');
            return;
        }

        onDuplicate({
            newName,
            targetProjectName,
            dateMode,
            newStartDate: dateMode === 'shift' ? newStartDate : undefined,
            includeResources
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Duplicar Tarefa</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl" aria-label="Fechar">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Name */}
                    <div>
                        <label htmlFor="newName" className="block text-sm font-medium text-slate-700">Nome da Nova Tarefa</label>
                        <input 
                            type="text" 
                            id="newName" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Target Project */}
                    <div>
                        <label htmlFor="targetProject" className="block text-sm font-medium text-slate-700">Projeto de Destino</label>
                        <select 
                            id="targetProject" 
                            value={targetProjectName} 
                            onChange={(e) => setTargetProjectName(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Strategy */}
                    <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Configuração de Datas</label>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input 
                                    id="dateOriginal" 
                                    name="dateMode" 
                                    type="radio" 
                                    value="original" 
                                    checked={dateMode === 'original'} 
                                    onChange={() => setDateMode('original')}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                />
                                <label htmlFor="dateOriginal" className="ml-3 block text-sm text-slate-700">
                                    Manter datas originais
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input 
                                    id="dateShift" 
                                    name="dateMode" 
                                    type="radio" 
                                    value="shift" 
                                    checked={dateMode === 'shift'} 
                                    onChange={() => setDateMode('shift')}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                />
                                <label htmlFor="dateShift" className="ml-3 block text-sm text-slate-700">
                                    Deslocar datas (Definir novo início)
                                </label>
                            </div>
                        </div>

                        {/* Date Input for Shifting */}
                        {dateMode === 'shift' && (
                            <div className="mt-3 ml-7">
                                <label htmlFor="newStartDate" className="block text-xs font-medium text-slate-500">Nova Data de Início</label>
                                <input 
                                    type="date" 
                                    id="newStartDate" 
                                    value={newStartDate} 
                                    onChange={(e) => setNewStartDate(e.target.value)} 
                                    className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    required={dateMode === 'shift'}
                                />
                                <p className="text-xs text-slate-400 mt-1">A duração original será mantida.</p>
                            </div>
                        )}
                    </div>

                    {/* Options */}
                    <div>
                         <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="includeResources"
                                    name="includeResources"
                                    type="checkbox"
                                    checked={includeResources}
                                    onChange={(e) => setIncludeResources(e.target.checked)}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="includeResources" className="font-medium text-slate-700">Manter Responsável/Recursos</label>
                                <p className="text-slate-500 text-xs">A disponibilidade do recurso pode variar no novo período.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                        >
                            Duplicar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskDuplicateModal;