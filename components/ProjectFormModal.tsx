
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, Team } from '../types';
import { TrashIcon } from './icons';

interface ProjectFormModalProps {
    onClose: () => void;
    onSave: (project: Omit<Project, 'id'> & { id?: number }) => void;
    onDelete: (projectId: number) => void;
    projectToEdit: Project | null;
    departments: string[];
    teams: Team[];
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ onClose, onSave, onDelete, projectToEdit, departments, teams }) => {
    
    // FIX: Added explicit return type for better type safety.
    const getInitialFormData = (): Omit<Project, 'id'> => {
        if (projectToEdit) {
            return {
                name: projectToEdit.name,
                description: projectToEdit.description,
                manager: projectToEdit.manager,
                // FIX: Corrected typo from projectToetoEdit to projectToEdit.
                client: projectToEdit.client,
                startDate: projectToEdit.startDate,
                endDate: projectToEdit.endDate,
                status: projectToEdit.status,
                departmentBudgets: projectToEdit.departmentBudgets,
                contractAdditives: projectToEdit.contractAdditives,
                associatedTeamIds: projectToEdit.associatedTeamIds || [],
            };
        }
        return {
            name: '',
            description: '',
            manager: '',
            client: '',
            startDate: '',
            endDate: '',
            status: ProjectStatus.EmPlanejamento,
            departmentBudgets: {},
            contractAdditives: [],
            associatedTeamIds: [],
        };
    };

    // FIX: Added explicit type to useState for better type inference.
    const [formData, setFormData] = useState<Omit<Project, 'id'>>(getInitialFormData);

    useEffect(() => {
        setFormData(getInitialFormData());
    }, [projectToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleTeamSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => parseInt(option.value));
        setFormData(prev => ({ ...prev, associatedTeamIds: selectedIds }));
    };


    const handleBudgetChange = (department: string, value: string) => {
        // FIX: The error "Property 'value' does not exist on type 'unknown'" suggests a typing issue. Explicitly casting to string for safety, although the call site should already provide a string.
        const numericValue = parseFloat((value as string).replace(/[^0-9,.-]+/g, "").replace(",", ".")) || 0;
        setFormData(prev => ({
            ...prev,
            departmentBudgets: { ...prev.departmentBudgets, [department]: numericValue }
        }));
    };
    
    const handleAdditiveChange = (index: number, value: string) => {
        const numericValue = parseFloat(value.replace(/[^0-9,.-]+/g, "").replace(",", ".")) || 0;
        const newAdditives = [...formData.contractAdditives];
        newAdditives[index] = numericValue;
        setFormData(prev => ({ ...prev, contractAdditives: newAdditives }));
    };

    const handleAddAdditive = () => {
        setFormData(prev => ({...prev, contractAdditives: [...prev.contractAdditives, 0]}));
    };

    const handleRemoveAdditive = (index: number) => {
        const newAdditives = formData.contractAdditives.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, contractAdditives: newAdditives }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.name){
            alert('O nome do projeto é obrigatório.');
            return;
        }
        const dataToSave = projectToEdit ? { ...formData, id: projectToEdit.id } : formData;
        onSave(dataToSave);
    };

    const handleDelete = () => {
        if (projectToEdit && window.confirm(`Tem certeza que deseja excluir o projeto "${projectToEdit.name}"?`)) {
            onDelete(projectToEdit.id);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{projectToEdit ? 'Editar Projeto' : 'Criar Novo Projeto'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl" aria-label="Fechar">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Project Info */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome do Projeto *</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="manager" className="block text-sm font-medium text-slate-700">Gerente do Projeto</label>
                            <input type="text" id="manager" name="manager" value={formData.manager} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="client" className="block text-sm font-medium text-slate-700">Cliente</label>
                            <input type="text" id="client" name="client" value={formData.client} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                    </div>

                    {/* Schedule & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Data de Início</label>
                            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">Data de Término</label>
                            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md">
                                {Object.values(ProjectStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Team Association */}
                    <div>
                        <label htmlFor="associatedTeamIds" className="block text-sm font-medium text-slate-700">Equipes Associadas</label>
                        <select
                            id="associatedTeamIds"
                            name="associatedTeamIds"
                            multiple
                            value={(formData.associatedTeamIds || []).map(String)}
                            onChange={handleTeamSelectionChange}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md h-24"
                        >
                            {teams.filter(t => t.status === 'Ativa').map(team => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Segure Ctrl (ou Cmd em Mac) para selecionar múltiplas equipes.</p>
                    </div>
                    
                    {/* Budgets */}
                    <div className="p-4 border border-slate-200 rounded-md">
                        <h3 className="text-blue-600 font-semibold mb-3">Orçamento por Departamento</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                           {departments.map(dep => (
                               <div key={dep} className="flex justify-between items-center">
                                   <label htmlFor={`budget-${dep}`} className="text-sm text-slate-600 truncate pr-2" title={dep}>{dep}</label>
                                   <input
                                        type="text"
                                        id={`budget-${dep}`}
                                        value={(formData.departmentBudgets[dep] || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        onChange={(e) => handleBudgetChange(dep, e.target.value)}
                                        placeholder="R$ 0,00"
                                        className="w-32 px-2 py-1 text-right bg-white border border-slate-300 rounded-md"
                                   />
                               </div>
                           ))}
                        </div>
                    </div>

                    {/* Additives */}
                    <div className="p-4 border border-slate-200 rounded-md">
                        <h3 className="text-blue-600 font-semibold mb-3">Aditivos de Contrato</h3>
                        <div className="space-y-2">
                            {formData.contractAdditives.map((additive, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={additive.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        onChange={(e) => handleAdditiveChange(index, e.target.value)}
                                        placeholder="R$ 0,00"
                                        className="flex-grow px-3 py-2 text-right bg-white border border-slate-300 rounded-md"
                                    />
                                    <button type="button" onClick={() => handleRemoveAdditive(index)} className="text-red-500 hover:text-red-700 p-1">
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddAdditive} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                            + Adicionar Aditivo
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4">
                        <div>
                        {projectToEdit && (
                            <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">
                                Excluir Projeto
                            </button>
                        )}
                        </div>
                        <div className="flex space-x-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-medium">
                                Cancelar
                            </button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                                {projectToEdit ? 'Salvar Alterações' : 'Salvar Projeto'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectFormModal;
