import React, { useState } from 'react';
import { ArrowLeftIcon, BellIcon, MailIcon, SmartphoneIcon } from './icons';

interface NotificationsProps {
    onClose: () => void;
}

const Toggle: React.FC<{ enabled: boolean; setEnabled: (enabled: boolean) => void }> = ({ enabled, setEnabled }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        onClick={() => setEnabled(!enabled)}
    >
        <span
            className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
        />
    </button>
);

const NotificationSettingRow: React.FC<{ title: string; description: string; channels: ('app' | 'email' | 'push')[]; settings: any; onSettingChange: any; }> = ({ title, description, channels, settings, onSettingChange }) => (
    <tr className="border-b border-slate-200 dark:border-slate-700">
        <td className="p-4">
            <p className="font-medium text-slate-800 dark:text-slate-200">{title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </td>
        <td className="p-4 text-center">
            {channels.includes('app') ? <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={settings.app} onChange={(e) => onSettingChange('app', e.target.checked)} /> : '—'}
        </td>
        <td className="p-4 text-center">
            {channels.includes('email') ? <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={settings.email} onChange={(e) => onSettingChange('email', e.target.checked)} /> : '—'}
        </td>
        <td className="p-4 text-center">
            {channels.includes('push') ? <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={settings.push} onChange={(e) => onSettingChange('push', e.target.checked)} /> : '—'}
        </td>
    </tr>
);

const Notifications: React.FC<NotificationsProps> = ({ onClose }) => {
    const [pauseAll, setPauseAll] = useState(false);
    const [dndEnabled, setDndEnabled] = useState(false);
    const [dndStart, setDndStart] = useState('22:00');
    const [dndEnd, setDndEnd] = useState('08:00');
    const [summaryFrequency, setSummaryFrequency] = useState('weekly');

    return (
        <div className="p-8 bg-slate-100 dark:bg-slate-900 min-h-screen">
            <div className="flex items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Configurações de Notificações</h1>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm space-y-8">
                {/* Controles Gerais */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 border dark:border-slate-700 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Pausar todas as notificações</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Silencie temporariamente todos os alertas.</p>
                        </div>
                        <Toggle enabled={pauseAll} setEnabled={setPauseAll} />
                    </div>
                    <div className="p-4 border dark:border-slate-700 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Não Incomodar</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Defina um horário para silenciar notificações automaticamente.</p>
                            </div>
                            <Toggle enabled={dndEnabled} setEnabled={setDndEnabled} />
                        </div>
                        {dndEnabled && (
                            <div className="mt-4 pt-4 border-t dark:border-slate-700 flex items-center space-x-4">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Silenciar de</p>
                                <input type="time" value={dndStart} onChange={e => setDndStart(e.target.value)} className="bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md p-1 text-sm" />
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">até</p>
                                <input type="time" value={dndEnd} onChange={e => setDndEnd(e.target.value)} className="bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md p-1 text-sm" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabela de Preferências */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="p-4 font-semibold text-slate-500 dark:text-slate-300 w-1/2">Atividade</th>
                                <th className="p-4 font-semibold text-slate-500 dark:text-slate-300 text-center w-24"><BellIcon className="w-5 h-5 inline-block" /> No App</th>
                                <th className="p-4 font-semibold text-slate-500 dark:text-slate-300 text-center w-24"><MailIcon className="w-5 h-5 inline-block" /> E-mail</th>
                                <th className="p-4 font-semibold text-slate-500 dark:text-slate-300 text-center w-24"><SmartphoneIcon className="w-5 h-5 inline-block" /> Push</th>
                            </tr>
                        </thead>
                        {/* Notificações de Tarefas */}
                        <tbody>
                            <tr><td colSpan={4} className="pt-4 pb-2"><h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Tarefas</h3></td></tr>
                            <NotificationSettingRow title="Nova tarefa atribuída a você" description="Quando alguém te designa como responsável por uma tarefa." channels={['app', 'email', 'push']} settings={{ app: true, email: true, push: true }} onSettingChange={() => { }} />
                            <NotificationSettingRow title="Tarefa atribuída a você está atrasada" description="Alerta quando uma tarefa sua ultrapassa a data de entrega." channels={['app', 'email', 'push']} settings={{ app: true, email: true, push: true }} onSettingChange={() => { }} />
                            <NotificationSettingRow title="Lembrete de tarefa que vence hoje" description="Lembrete no início do dia sobre tarefas a serem concluídas." channels={['app', 'email', 'push']} settings={{ app: true, email: true, push: false }} onSettingChange={() => { }} />
                            <NotificationSettingRow title="Status de tarefa que sigo for alterado" description="Quando o progresso de tarefas que você segue é atualizado." channels={['app', 'email']} settings={{ app: true, email: true }} onSettingChange={() => { }} />
                        </tbody>
                        {/* Notificações de Comunicação */}
                        <tbody>
                            <tr><td colSpan={4} className="pt-4 pb-2"><h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Comunicação</h3></td></tr>
                            <NotificationSettingRow title="Alguém @menciona você" description="Quando seu nome é citado em um comentário." channels={['app', 'email', 'push']} settings={{ app: true, email: true, push: true }} onSettingChange={() => { }} />
                            <NotificationSettingRow title="Novo comentário em tarefa que sigo" description="Notifica sobre novas mensagens em tarefas de seu interesse." channels={['app', 'email']} settings={{ app: true, email: false }} onSettingChange={() => { }} />
                        </tbody>
                        {/* Notificações de Projetos e Equipes */}
                        <tbody>
                            <tr><td colSpan={4} className="pt-4 pb-2"><h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Projetos e Equipes</h3></td></tr>
                            <NotificationSettingRow title="Adicionado a um projeto ou equipe" description="Informa sobre sua inclusão em novos projetos ou equipes." channels={['app', 'email']} settings={{ app: true, email: true }} onSettingChange={() => { }} />
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <td className="p-4">
                                    <p className="font-medium text-slate-800 dark:text-slate-200">Resumo de atividades</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Receba um resumo do que aconteceu nos seus projetos.</p>
                                </td>
                                <td className="p-4 text-center">—</td>
                                <td className="p-4 text-center">
                                    <select value={summaryFrequency} onChange={(e) => setSummaryFrequency(e.target.value)} className="bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md p-1 text-sm">
                                        <option value="off">Desativado</option>
                                        <option value="daily">Diário</option>
                                        <option value="weekly">Semanal</option>
                                    </select>
                                </td>
                                <td className="p-4 text-center">—</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="pt-6 flex justify-end">
                    <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
                        onClick={() => alert('Preferências salvas!')}
                    >
                        Salvar Preferências
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
