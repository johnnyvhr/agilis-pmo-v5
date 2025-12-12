import React, { useState, useEffect } from 'react';
import { Risk, RiskImpact, RiskProbability, RiskStatus } from '../types';

interface RiskFormModalProps {
    onClose: () => void;
    onSave: (risk: Omit<Risk, 'id'> & { id?: number }) => void;
    riskToEdit: Risk | null;
    projectName: string;
}

const RiskFormModal: React.FC<RiskFormModalProps> = ({ onClose, onSave, riskToEdit, projectName }) => {
    
    const getInitialFormData = () => {
        if (riskToEdit) return riskToEdit;
        
        return {
            projectName,
            description: '',
            category: '',
            probability: 'Baixa' as RiskProbability,
            impact: 'Baixo' as RiskImpact,
            responsible: '',
            status: 'Aberto' as RiskStatus,
            lastUpdate: new Date().toISOString().split('T')[0],
            mitigationPlan: '',
        };
    };

    const [formData, setFormData] = useState<Omit<Risk, 'id'>>(getInitialFormData);

    useEffect(() => {
        setFormData(getInitialFormData());
    }, [riskToEdit, projectName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value, lastUpdate: new Date().toISOString().split('T')[0] }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = riskToEdit ? { ...formData, id: riskToEdit.id } : formData;
        onSave(dataToSave);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-full overflow-y-auto">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{riskToEdit ? 'Editar Risco' : 'Adicionar Novo Risco'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl" aria-label="Fechar">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição do Risco *</label>
                        <input type="text" id="description" name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700">Categoria</label>
                            <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="responsible" className="block text-sm font-medium text-slate-700">Responsável</label>
                            <input type="text" id="responsible" name="responsible" value={formData.responsible} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="probability" className="block text-sm font-medium text-slate-700">Probabilidade</label>
                            <select id="probability" name="probability" value={formData.probability} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md">
                                <option>Baixa</option>
                                <option>Média</option>
                                <option>Alta</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="impact" className="block text-sm font-medium text-slate-700">Impacto</label>
                            <select id="impact" name="impact" value={formData.impact} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md">
                                <option>Baixo</option>
                                <option>Médio</option>
                                <option>Alto</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md">
                                <option>Aberto</option>
                                <option>Em Tratamento</option>
                                <option>Mitigado</option>
                                <option>Fechado</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="mitigationPlan" className="block text-sm font-medium text-slate-700">Plano de Mitigação</label>
                        <textarea id="mitigationPlan" name="mitigationPlan" value={formData.mitigationPlan} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-medium">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RiskFormModal;
