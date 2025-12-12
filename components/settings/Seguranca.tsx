import React, { useState } from 'react';
import SettingsPageLayout from './SettingsPageLayout';

const Toggle: React.FC<{ enabled: boolean; setEnabled: (enabled: boolean) => void }> = ({ enabled, setEnabled }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
        onClick={() => setEnabled(!enabled)}
    >
        <span
            className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
        />
    </button>
);

const Seguranca: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
  const [force2FA, setForce2FA] = useState(false);

  return (
    <SettingsPageLayout title="Segurança" onBack={onBack}>
        <div className="max-w-3xl space-y-8">
            {/* 2FA */}
            <div className="flex justify-between items-center p-4 border dark:border-slate-700 rounded-lg">
                <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Autenticação de Dois Fatores (2FA)</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Exigir que todos os membros do ambiente configurem a autenticação de dois fatores.</p>
                </div>
                <Toggle enabled={force2FA} setEnabled={setForce2FA} />
            </div>

            {/* SSO */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Logon Único (SSO) com SAML</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Permita que os usuários façam login usando o provedor de identidade da sua organização (como Okta, Azure AD, etc.).
                </p>
                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div>
                        <label htmlFor="idp-metadata" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Metadados do Provedor de Identidade (IdP)</label>
                        <textarea 
                            id="idp-metadata" 
                            rows={6}
                            placeholder='Cole o XML de metadados do seu IdP aqui...'
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm"
                        />
                    </div>
                     <div className="flex justify-end">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm">
                            Salvar Configuração SAML
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </SettingsPageLayout>
  );
};

export default Seguranca;
