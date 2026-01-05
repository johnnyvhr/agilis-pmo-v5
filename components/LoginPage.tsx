import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
    onLogin: () => void;
}

import { useToast } from '../context/ToastContext';

const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
    const toast = useToast();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // For Sign Up
    const [loading, setLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name,
                        },
                    },
                });
                if (error) throw error;
                // If signup requires email confirmation, we can't accept invite yet.
                // Assuming auto-confirm or user manually confirms.
                toast.success('Cadastro realizado! Se o login for automático, o convite será processado.');

                // Try to sign in immediately (if auto-confirm is on) or wait.
                // If Supabase is set to require email confirm, this won't work immediately.
                // But for "Production Hardening" usually email confirm is on.
                // We'll proceed as if it might work or let them login manually.
                if (token) {
                    toast.info("Após confirmar seu email, faça login novamente para aceitar o convite.");
                }
                setIsSignUp(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Process Invite Token if present
                if (token) {
                    try {
                        const { data, error: rpcError } = await supabase.rpc('accept_invitation', { token_input: token });
                        if (rpcError) throw rpcError;
                        if (data && data.success) {
                            toast.success('Convite aceito com sucesso!');
                        } else {
                            // Don't block login if invite fails, just warn
                            console.warn('Invite failed:', data?.message);
                        }
                    } catch (inviteErr) {
                        console.error('Error accepting invite:', inviteErr);
                    }
                }

                onLogin(); // Call parent handler
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-500 dark:text-blue-400">Agilis PMO</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                        {isSignUp ? 'Crie sua conta para começar' : 'Bem-vindo de volta! Faça login para continuar.'}
                    </p>
                    {token && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-sm rounded border border-blue-100 dark:border-blue-800">
                            Você tem um convite pendente. Faça login ou cadastre-se para aceitar.
                        </div>
                    )}
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Nome
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                            Email
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                            Senha
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex justify-end mt-1">
                            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                Esqueceu sua senha?
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                {isSignUp ? 'Já tem uma conta? Faça Login' : 'Não tem conta? Cadastre-se'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Processando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
