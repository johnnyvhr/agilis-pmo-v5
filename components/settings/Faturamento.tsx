import React from 'react';
import SettingsPageLayout from './SettingsPageLayout';

interface FaturamentoProps {
  onBack: () => void;
}

import { useToast } from '../../context/ToastContext';

const Faturamento: React.FC<FaturamentoProps> = ({ onBack }) => {
  const toast = useToast();


  const invoices = [
    { id: 'INV-2024-003', date: '01/07/2024', amount: 'R$ 299,00', status: 'Paga', link: '#' },
    { id: 'INV-2024-002', date: '01/06/2024', amount: 'R$ 299,00', status: 'Paga', link: '#' },
    { id: 'INV-2024-001', date: '01/05/2024', amount: 'R$ 299,00', status: 'Paga', link: '#' },
  ];

  return (
    <SettingsPageLayout title="Faturamento e Assinatura" onBack={onBack}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plano Atual */}
        <div className="md:col-span-2 bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Seu Plano Atual</h3>
          <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 my-2">Plano Pro</p>
          <p className="text-slate-600 dark:text-slate-400">Sua próxima cobrança de R$ 299,00 será em <strong>01 de Agosto de 2024</strong>.</p>
          <div className="mt-4 flex space-x-3">
            <button onClick={() => toast.info('Funcionalidade indisponível.')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm">
              Alterar Plano
            </button>
            <button onClick={() => toast.info('Funcionalidade indisponível.')} className="px-4 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-500 font-medium text-sm">
              Cancelar Assinatura
            </button>
          </div>
        </div>

        {/* Forma de Pagamento */}
        <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Forma de Pagamento</h3>
          <div className="flex items-center my-3">
            <img src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c34072a1f28f6285a44a7bdb51.svg" alt="Visa" className="w-10 mr-3" />
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Visa terminando em 4242</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Expira em 12/2026</p>
            </div>
          </div>
          <button onClick={() => toast.info('Funcionalidade indisponível.')} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 font-medium text-sm">
            Atualizar Forma de Pagamento
          </button>
        </div>
      </div>

      {/* Histórico de Faturas */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Histórico de Faturas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="p-3 font-semibold text-slate-500 dark:text-slate-300">Fatura</th>
                <th className="p-3 font-semibold text-slate-500 dark:text-slate-300">Data</th>
                <th className="p-3 font-semibold text-slate-500 dark:text-slate-300">Valor</th>
                <th className="p-3 font-semibold text-slate-500 dark:text-slate-300">Status</th>
                <th className="p-3 font-semibold text-slate-500 dark:text-slate-300"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{invoice.id}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{invoice.date}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{invoice.amount}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <a href={invoice.link} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SettingsPageLayout>
  );
};

export default Faturamento;
