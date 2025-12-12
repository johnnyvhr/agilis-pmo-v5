
import React, { useState, useEffect } from 'react';
import { Medicao, Project } from '../types';

interface MedicaoFormModalProps {
    onClose: () => void;
    onSave: (medicao: Omit<Medicao, 'id'> & { id?: number }) => void;
    medicaoToEdit: Medicao | null;
    projects: Project[];
    departments: string[];
}

const MedicaoFormModal: React.FC<MedicaoFormModalProps> = ({ onClose, onSave, medicaoToEdit, projects, departments }) => {
    const [formData, setFormData] = useState({
        projeto: medicaoToEdit?.projeto || (projects.length > 0 ? projects[0].name : ''),
        item: medicaoToEdit?.item || '',
        qtd: medicaoToEdit?.qtd || 0,
        unidade: medicaoToEdit?.unidade || '',
        valorUnitario: medicaoToEdit?.valorUnitario || 0,
        data: medicaoToEdit?.data || '',
        departamento: medicaoToEdit?.departamento || (departments.length > 0 ? departments[0] : ''),
    });

    useEffect(() => {
        if (medicaoToEdit) {
            setFormData({
                projeto: medicaoToEdit.projeto,
                item: medicaoToEdit.item,
                qtd: medicaoToEdit.qtd,
                unidade: medicaoToEdit.unidade,
                valorUnitario: medicaoToEdit.valorUnitario,
                data: medicaoToEdit.data,
                departamento: medicaoToEdit.departamento,
            });
        }
    }, [medicaoToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'qtd' || name === 'valorUnitario' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = medicaoToEdit ? { ...formData, id: medicaoToEdit.id } : formData;
        onSave(dataToSave);
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">{medicaoToEdit ? 'Editar Medição' : 'Adicionar Nova Medição'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="projeto" className="block text-sm font-medium text-slate-700">Projeto</label>
                            <select id="projeto" name="projeto" value={formData.projeto} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md" required>
                                {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="departamento" className="block text-sm font-medium text-slate-700">Departamento</label>
                            <select id="departamento" name="departamento" value={formData.departamento} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md" required>
                               {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                     <div>
                        <label htmlFor="item" className="block text-sm font-medium text-slate-700">Item Medido</label>
                        <input type="text" id="item" name="item" value={formData.item} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="qtd" className="block text-sm font-medium text-slate-700">Quantidade Medida</label>
                            <input type="number" id="qtd" name="qtd" value={formData.qtd} onChange={handleChange} step="any" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md" required />
                        </div>
                        <div>
                             <label htmlFor="unidade" className="block text-sm font-medium text-slate-700">Unidade</label>
                            <input type="text" id="unidade" name="unidade" value={formData.unidade} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="valorUnitario" className="block text-sm font-medium text-slate-700">Valor Unitário (R$)</label>
                            <input type="number" id="valorUnitario" name="valorUnitario" value={formData.valorUnitario} onChange={handleChange} step="any" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md" required />
                        </div>
                         <div>
                            <label htmlFor="data" className="block text-sm font-medium text-slate-700">Data da Medição</label>
                            <input type="date" id="data" name="data" value={formData.data} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md" required />
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-medium">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MedicaoFormModal;
