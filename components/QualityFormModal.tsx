import React, { useState, useEffect } from 'react';
import { QualityCheck, QualityStatus } from '../types';

interface QualityFormModalProps {
    onClose: () => void;
    onSave: (qc: Omit<QualityCheck, 'id'> & { id?: number }) => void;
    qualityCheckToEdit: QualityCheck | null;
    projectName: string;
}

const QualityFormModal: React.FC<QualityFormModalProps> = ({ onClose, onSave, qualityCheckToEdit, projectName }) => {
    
    const getInitialFormData = () => {
        if (qualityCheckToEdit) return qualityCheckToEdit;
        
        return {
            projectName,
            item: '',
            category: '',
            responsible: '',
            status: 'Pendente' as QualityStatus,
            lastUpdate: new Date().toISOString().split('T')[0],
            details: '',
        };
    };

    const [formData, setFormData] = useState<Omit<QualityCheck, 'id'>>(getInitialFormData);

    useEffect(() => {
        setFormData(getInitialFormData());
    }, [qualityCheckToEdit, projectName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value, lastUpdate: new Date().toISOString().split('T')[0] }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = qualityCheckToEdit ? { ...formData, id: qualityCheckToEdit.id } : formData;
        onSave(dataToSave);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-full overflow-y-auto">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{qualityCheckToEdit ? 'Editar Item de Qualidade' : 'Adicionar Novo Item de Qualidade'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl" aria-label="Fechar">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="item" className="block text-sm font-medium text-slate-700">Item de Inspeção *</label>
                        <input type="text" id="item" name="item" value={formData.item} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" required />
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
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md">
                            <option>Pendente</option>
                            <option>Conforme</option>
                            <option>Não Conforme</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="details" className="block text-sm font-medium text-slate-700">Detalhes/Observações</label>
                        <textarea id="details" name="details" value={formData.details} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
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

export default QualityFormModal;
