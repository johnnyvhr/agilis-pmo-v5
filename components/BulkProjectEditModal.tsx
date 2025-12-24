
import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';

interface BulkProjectEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updates: Partial<Project>) => void;
    selectedCount: number;
}

const BulkProjectEditModal: React.FC<BulkProjectEditModalProps> = ({ isOpen, onClose, onSave, selectedCount }) => {
    const [status, setStatus] = useState<ProjectStatus | ''>('');
    const [manager, setManager] = useState('');
    const [client, setClient] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Confirmation Step
        if (!window.confirm(`Você tem certeza que deseja atualizar ${selectedCount} projetos? Esta ação não pode ser desfeita.`)) {
            return;
        }

        const updates: Partial<Project> = {};
        if (status) updates.status = status;
        if (manager) updates.manager = manager;
        if (client) updates.client = client;

        onSave(updates);
        // Reset and close
        setStatus('');
        setManager('');
        setClient('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Edição em Massa</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>

                <p className="mb-4 text-slate-600 text-sm">
                    Editando <span className="font-bold text-blue-600">{selectedCount}</span> projetos selecionados.
                    Preencha apenas os campos que deseja atualizar para todos.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Novo Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                        >
                            <option value="">-- Não Alterar --</option>
                            {Object.values(ProjectStatus).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Novo Gerente</label>
                        <input
                            type="text"
                            value={manager}
                            onChange={(e) => setManager(e.target.value)}
                            placeholder="Deixe em branco para não alterar"
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Novo Cliente</label>
                        <input
                            type="text"
                            value={client}
                            onChange={(e) => setClient(e.target.value)}
                            placeholder="Deixe em branco para não alterar"
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-4">
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
                            Aplicar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkProjectEditModal;
