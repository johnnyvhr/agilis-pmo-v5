import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const InvitePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAccept = async () => {
        setLoading(true);
        // Simulate joining process
        // In real app: validate token check auth, add user to team/org

        // For MVP/Demo: Just redirect to login/register if not auth, or dashboard if auth.
        // We'll trust the user accepts.

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // User needs to login/signup first
                alert("Por favor, faça login ou cadastre-se para aceitar o convite.");
                navigate('/login');
                return;
            }

            // User is logged in, "Add" them to the org/role
            // Here you would call your backend implementation
            alert(`Convite aceito com sucesso! Você entrou como ${role || 'Membro'}.`);
            navigate('/');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Convite para Agilis PMO</h2>
                <p className="text-slate-600 mb-6">
                    Você foi convidado para entrar na organização como <span className="font-semibold text-blue-600">{role || 'Membro'}</span>.
                </p>

                {id && (
                    <p className="text-xs text-slate-400 mb-6 font-mono">Token: {id}</p>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                >
                    {loading ? 'Processando...' : 'Aceitar Convite'}
                </button>
            </div>
        </div>
    );
};

export default InvitePage;
