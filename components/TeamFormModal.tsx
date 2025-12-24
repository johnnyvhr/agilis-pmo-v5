import React, { useState, useEffect } from 'react';
import { Team, User, TeamStatus, TeamMember, UserRole } from '../types';
import { TrashIcon, PlusIcon } from './icons';

interface TeamFormModalProps {
    onClose: () => void;
    onSave: (team: Omit<Team, 'id'> & { id?: number }) => void;
    onDelete: (teamId: number) => void;
    teamToEdit: Team | null;
    users: User[];
}

const TeamFormModal: React.FC<TeamFormModalProps> = ({ onClose, onSave, onDelete, teamToEdit, users }) => {

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [leaderId, setLeaderId] = useState<string | number>(0);
    const [status, setStatus] = useState<TeamStatus>('Ativa');
    const [members, setMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        if (teamToEdit) {
            setName(teamToEdit.name);
            setDescription(teamToEdit.description);
            setLeaderId(teamToEdit.leaderId);
            setStatus(teamToEdit.status);
            setMembers(teamToEdit.members || []);
        } else {
            setName('');
            setDescription('');
            setLeaderId(0);
            setStatus('Ativa');
            setMembers([]);
        }
    }, [teamToEdit]);

    const handleMemberChange = (index: number, field: keyof TeamMember, value: string | number) => {
        const newMembers = [...members];
        if (newMembers[index]) {
            (newMembers[index] as any)[field] = value;
            setMembers(newMembers);
        }
    };

    const addMember = () => {
        setMembers([...members, { userId: 0, roleInTeam: '' }]);
    };

    const removeMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Check for leaderId being 0 (default) or empty
        if (!name || !leaderId || leaderId === 0) {
            alert('Nome da equipe e Líder são obrigatórios.');
            return;
        }

        const dataToSave = {
            name,
            description,
            leaderId,
            status,
            members,
            ...(teamToEdit ? { id: teamToEdit.id } : {})
        };

        onSave(dataToSave);
    };

    const handleDelete = () => {
        if (teamToEdit) {
            onDelete(teamToEdit.id);
        }
    };

    const projectManagers = (users || []).filter(u => u.role === UserRole.ProjectManager || u.role === UserRole.Admin || u.role === UserRole.PMOManager);
    const availableMembers = (users || []).filter(u => !members.some(m => m.userId === u.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{teamToEdit ? 'Editar Equipe' : 'Criar Nova Equipe'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl" aria-label="Fechar">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome da Equipe *</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TeamStatus)}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                            >
                                <option>Ativa</option>
                                <option>Inativa</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição/Propósito</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="leaderId" className="block text-sm font-medium text-slate-700">Líder da Equipe *</label>
                        <select
                            id="leaderId"
                            value={leaderId}
                            onChange={(e) => setLeaderId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                            required
                        >
                            <option value={0} disabled>Selecione um líder</option>
                            {projectManagers.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-md">
                        <h3 className="font-semibold text-slate-700 mb-2">Membros da Equipe</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {(members || []).map((member, index) => (
                                <div key={index} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center">
                                    <select
                                        value={member.userId}
                                        onChange={(e) => handleMemberChange(index, 'userId', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md"
                                    >
                                        <option value={0} disabled>Selecione um membro</option>
                                        {/* Include current member in the list to allow viewing */}
                                        {users.find(u => u.id === member.userId) && <option value={member.userId}>{users.find(u => u.id === member.userId)?.name}</option>}
                                        {availableMembers.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Papel na equipe"
                                        value={member.roleInTeam}
                                        onChange={(e) => handleMemberChange(index, 'roleInTeam', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md"
                                    />
                                    <button type="button" onClick={() => removeMember(index)} className="text-red-500 hover:text-red-700 p-1">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addMember} className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1">
                            <PlusIcon className="w-4 h-4" />
                            <span>Adicionar Membro</span>
                        </button>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <div>
                            {teamToEdit && (
                                <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">
                                    Excluir Equipe
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-medium">
                                Cancelar
                            </button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                                {teamToEdit ? 'Salvar Alterações' : 'Salvar Equipe'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeamFormModal;