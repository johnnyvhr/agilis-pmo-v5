import React, { useState, useEffect } from 'react';
import SettingsPageLayout from './SettingsPageLayout';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { User } from '@supabase/supabase-js';

interface DadosPessoaisProps {
    onBack: () => void;
}

const DadosPessoais: React.FC<DadosPessoaisProps> = ({ onBack }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [fullName, setFullName] = useState('');

    // UseEffect to fetch user and profile
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setUser(user);

                // Fetch Profile Data
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('name')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setFullName(profile.name || user.user_metadata?.full_name || '');
                } else {
                    // Fallback to metadata if no profile row exists yet
                    setFullName(user.user_metadata?.full_name || '');
                }

            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);


    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const updates = {
                id: user.id,
                name: fullName,
                email: user.email, // Ensure email is kept/synced
                // avatar_url: ... (Future implementation)
                updated_at: new Date().toISOString(),
            };

            // UPSERT: Creates row if missing, updates if exists.
            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            toast.success('Perfil atualizado com sucesso!');

        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(`Erro ao atualizar perfil: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SettingsPageLayout title="Dados Pessoais" onBack={onBack}>
            <div className="max-w-2xl divide-y divide-slate-200 dark:divide-slate-700">
                {/* Nome e Foto */}
                <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-1">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Nome e Foto</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Suas informações básicas de perfil.</p>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                                placeholder="Seu nome completo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Foto de Perfil</label>
                            <div className="mt-1 flex items-center space-x-4">
                                <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-600">
                                    <svg className="h-full w-full text-slate-300 dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </span>
                                <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                    {/* Visual only for now, can implement Upload logic later */}
                                    <label className="relative cursor-not-allowed opacity-50 bg-white dark:bg-slate-700 rounded-md font-medium text-blue-600 dark:text-blue-400 p-2 border dark:border-slate-600">
                                        <span>Alterar Foto (Em Breve)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alterar Senha - Placeholder for later logic (Supabase Auth Reset) */}
                <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start opacity-50">
                    <div className="md:col-span-1">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Alterar Senha</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gerenciado via Login/Email.</p>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <p className="text-sm text-slate-500">Para alterar sua senha, utilize a opção "Esqueci minha senha" na tela de login.</p>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </SettingsPageLayout>
    );
};

export default DadosPessoais;
