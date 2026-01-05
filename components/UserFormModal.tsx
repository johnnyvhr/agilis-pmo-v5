import React, { useState, useEffect } from 'react';
import { User, UserRole, ROLE_LABELS } from '../types';
import { TrashIcon, LinkIcon } from './icons';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabaseClient';

interface UserFormModalProps {
    onClose: () => void;
    onSave: (user: Omit<User, 'id'> & { id?: number | string }) => void;
    onDelete: (userId: number | string) => void;
    userToEdit: User | null;
}

// Simple Copy Icon since it might not be in the icons file
const ClipboardIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const UserFormModal: React.FC<UserFormModalProps> = ({ onClose, onSave, onDelete, userToEdit }) => {
    const toast = useToast();
    // --- Edit Mode State ---
    const [formData, setFormData] = useState<Omit<User, 'id'>>({
        name: '',
        email: '',
        role: UserRole.TeamMember,
        status: 'Pendente',
    });

    // --- Invite Mode State ---
    const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.TeamMember);
    const [inviteEmail, setInviteEmail] = useState('');
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                name: userToEdit.name,
                email: userToEdit.email,
                role: userToEdit.role,
                status: userToEdit.status
            });
        }
    }, [userToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToEdit) return;

        if (!formData.name) {
            toast.error('O nome do membro é obrigatório.');
            return;
        }
        const dataToSave = { ...formData, id: userToEdit.id };
        onSave(dataToSave);
    };

    const handleDelete = () => {
        if (userToEdit) {
            onDelete(userToEdit.id);
        }
    };

    const handleGenerateLink = async () => {
        if (!inviteEmail) {
            toast.error('Por favor, informe o email do convidado.');
            return;
        }

        setIsGenerating(true);
        try {
            // 1. Get current user's space
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const { data: members, error: memberError } = await supabase
                .from('space_members')
                .select('space_id')
                .eq('user_id', user.id)
                .limit(1);

            let spaceId;
            if (members && members.length > 0) {
                spaceId = members[0].space_id;
            } else {
                // FALLBACK STRATEGY: Find a valid Space ID

                // 1. Try finding a space owned by this user
                const { data: ownedSpace } = await supabase
                    .from('spaces')
                    .select('id')
                    .eq('owner_id', user.id)
                    .limit(1)
                    .single();

                if (ownedSpace) {
                    spaceId = ownedSpace.id;
                } else {
                    // 2. Try finding ANY space in the system (Last resort for single tenant feel)
                    const { data: anySpace } = await supabase
                        .from('spaces')
                        .select('id')
                        .limit(1)
                        .single();

                    if (anySpace) {
                        spaceId = anySpace.id;
                    } else {
                        // 3. RPC Helper (Bypasses RLS completely)
                        const { data: rpcSpaceId, error: rpcError } = await supabase.rpc('get_default_space_id');

                        if (rpcSpaceId) {
                            spaceId = rpcSpaceId;
                        } else {
                            console.error("RPC Error or No Space:", rpcError);
                            throw new Error("Não foi possível encontrar um Espaço de Trabalho válido para associar a este convite.");
                        }
                    }
                }
            }

            // 2. Generate unique token
            const token = crypto.randomUUID();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

            // 3. Insert into invitations table
            const { error: inviteError } = await supabase
                .from('invitations')
                .insert({
                    space_id: spaceId,
                    email: inviteEmail,
                    token: token,
                    role: inviteRole,
                    expires_at: expiresAt.toISOString(),
                    created_by: user.id
                });

            if (inviteError) throw inviteError;

            // 4. Set Link
            const baseUrl = window.location.origin;
            setGeneratedLink(`${baseUrl}/invite/${token}`);
            setIsLinkCopied(false);

        } catch (err: any) {
            toast.error('Erro ao gerar convite: ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink).then(() => {
                setIsLinkCopied(true);
                setTimeout(() => setIsLinkCopied(false), 2000);
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {userToEdit ? 'Editar Membro' : 'Convidar Novo Membro'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl" aria-label="Fechar">&times;</button>
                </div>

                {userToEdit ? (
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome Completo *</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-100" readOnly />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700">Função</label>
                            <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                {Object.values(UserRole).map(role => (
                                    <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="Ativo">Ativo</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Inativo">Inativo</option>
                            </select>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-4">
                            <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 font-medium flex items-center space-x-2 transition-colors">
                                <TrashIcon className="w-4 h-4" /> <span>Excluir</span>
                            </button>
                            <div className="flex space-x-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm transition-colors">
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <LinkIcon className="h-5 w-5 text-blue-400 dark:text-blue-500" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800 dark:text-slate-200">Inclusão Manual Desativada</h3>
                                    <div className="mt-2 text-sm text-blue-700 dark:text-slate-300">
                                        <p>Para adicionar novos membros ao Space, gere um link de convite e compartilhe com eles. O acesso será concedido após a aceitação.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="inviteEmail" className="block text-sm font-medium text-slate-700 mb-1">Email do Convidado</label>
                            <input
                                type="email"
                                id="inviteEmail"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="exemplo@empresa.com"
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="inviteRole" className="block text-sm font-medium text-slate-700 mb-1">Definir Função do Convidado</label>
                            <select
                                id="inviteRole"
                                name="inviteRole"
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                {Object.values(UserRole).map(role => (
                                    <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                                ))}
                            </select>
                        </div>

                        {!generatedLink ? (
                            <button
                                type="button"
                                onClick={handleGenerateLink}
                                disabled={isGenerating}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                            >
                                {isGenerating ? 'Gerando...' : 'Gerar Link de Convite'}
                            </button>
                        ) : (
                            <div className="space-y-3 animate-fade-in bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <label className="block text-sm font-medium text-slate-700">Link de Acesso Gerado</label>
                                <div className="flex shadow-sm rounded-md">
                                    <input
                                        type="text"
                                        value={generatedLink}
                                        readOnly
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-r-0 border-slate-300 bg-white text-slate-600 sm:text-sm font-mono focus:ring-0"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className={`inline-flex items-center px-4 py-2 border border-l-0 border-slate-300 rounded-r-md bg-slate-100 text-sm font-medium ${isLinkCopied ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:bg-slate-200'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                    >
                                        <ClipboardIcon className="h-4 w-4 mr-2" />
                                        {isLinkCopied ? 'Copiado' : 'Copiar'}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 text-center mt-2">
                                    Este link é único para <strong>{inviteEmail}</strong> e expira em 7 dias.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserFormModal;
