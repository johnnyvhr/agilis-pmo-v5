import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

import { useToast } from '../context/ToastContext';

const InvitePage: React.FC = () => {
    const toast = useToast();

    const { id: token } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If unauthenticated, redirect to login preserving the token
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session && token) {
                // Redirect to login/signup page with token param
                navigate(`/login?token=${token}`);
            }
        });
    }, [navigate, token]);

    const handleAccept = async () => {
        if (!token) return;
        setLoading(true);

        try {
            // STEP A: Force Logout to ensure clean state (removes "Carlos Ferreira" or previous sessions)
            await supabase.auth.signOut();

            // STEP B: Redirect to Login/Signup flow
            // The LoginPage will handle the 'token' param after successful auth.
            // Using window.location.href to ensure a hard refresh might be safer to clear app state, 
            // but navigate should suffice if signOut worked.
            navigate(`/login?token=${token}`);

        } catch (err: any) {
            console.error("Redirection error:", err);
            // Even if logout fails, force redirect
            navigate(`/login?token=${token}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                <div className="mb-6">
                    <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Convite para Agilis PMO</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Você foi convidado para colaborar em um espaço de trabalho. Clique abaixo para aceitar e entrar.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 focus:ring-4 focus:ring-blue-500/50"
                >
                    {loading ? 'Processando...' : 'Aceitar Convite'}
                </button>
            </div>
        </div>
    );
};

export default InvitePage;
