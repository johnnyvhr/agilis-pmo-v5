
declare const XLSX: any;
import React, { useState } from 'react';
import { Project } from '../types';
import { ImportIcon, ExportIcon } from './icons';
import FinancialImportModal from './FinancialImportModal';

interface FinancialEntry {
  id: number;
  description: string;
  type: 'Custo' | 'Receita';
  value: number;
  date: string;
}

interface ProjectFinanceiroProps {
  project: Project | null;
}

const ProjectFinanceiro: React.FC<ProjectFinanceiroProps> = ({ project }) => {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'Custo' | 'Receita'>('Custo');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  if (!project) {
    return (
      <div className="p-8 bg-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Financeiro do Projeto</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-slate-600">Selecione um projeto para ver seu financeiro.</p>
        </div>
      </div>
    );
  }
  
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newEntry: FinancialEntry = {
          id: Date.now(),
          description,
          type,
          value: parseFloat(value),
          date,
      };
      setEntries([...entries, newEntry]);
      // Reset form
      setDescription('');
      setType('Custo');
      setValue('');
      setDate('');
  };

  const handleExportXLSX = () => {
    if (entries.length === 0) {
      alert("Não há lançamentos para exportar.");
      return;
    }

    const dataToExport = entries.map(e => ({
        'Descrição': e.description,
        'Tipo': e.type,
        'Valor': e.value,
        'Data': e.date
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financeiro");

    const fileName = `Financeiro_${project.name}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleImport = (importedEntries: Partial<FinancialEntry>[]) => {
      const newEntries = importedEntries.map(e => ({
          id: Date.now() + Math.random(),
          description: e.description || '',
          type: e.type || 'Custo',
          value: e.value || 0,
          date: e.date || ''
      } as FinancialEntry));
      
      setEntries(prev => [...prev, ...newEntries]);
      alert(`${newEntries.length} lançamentos importados com sucesso!`);
  };
  
  const totalReceitas = entries.filter(e => e.type === 'Receita').reduce((acc, curr) => acc + curr.value, 0);
  const totalCustos = entries.filter(e => e.type === 'Custo').reduce((acc, curr) => acc + curr.value, 0);
  const saldo = totalReceitas - totalCustos;


  return (
    <div className="p-8 bg-slate-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Controle Financeiro: {project.name}</h1>
      
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-sm text-slate-500">Total de Receitas</h3>
                <p className="text-2xl font-bold text-green-500">{totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-sm text-slate-500">Total de Custos</h3>
                <p className="text-2xl font-bold text-red-500">{totalCustos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-sm text-slate-500">Saldo</h3>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>{saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
        </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Adicionar Lançamento</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-8">
            {/* Form fields */}
            <div>
                <label htmlFor="desc" className="block text-sm font-medium text-slate-700">Descrição</label>
                <input id="desc" type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" required />
            </div>
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-slate-700">Tipo</label>
                <select id="type" value={type} onChange={e => setType(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 rounded-md">
                    <option>Custo</option>
                    <option>Receita</option>
                </select>
            </div>
            <div>
                <label htmlFor="value" className="block text-sm font-medium text-slate-700">Valor (R$)</label>
                <input id="value" type="number" value={value} onChange={e => setValue(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" required />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 h-10">Adicionar</button>
        </form>

        <div className="flex justify-between items-center mb-4 border-t pt-4">
            <h2 className="text-xl font-bold text-slate-800">Histórico de Lançamentos</h2>
            <div className="flex items-center space-x-2">
                <button onClick={() => setIsImportModalOpen(true)} className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm">
                    <ImportIcon className="w-4 h-4" />
                    <span>Importar (XLSX)</span>
                </button>
                <button onClick={handleExportXLSX} className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm">
                    <ExportIcon className="w-4 h-4" />
                    <span>Exportar (XLSX)</span>
                </button>
            </div>
        </div>
        
        <table className="w-full text-left text-sm">
          {/* Table */}
           <thead className="bg-slate-50">
                <tr>
                    <th className="p-3 font-semibold text-slate-500">Descrição</th>
                    <th className="p-3 font-semibold text-slate-500">Tipo</th>
                    <th className="p-3 font-semibold text-slate-500">Valor</th>
                    <th className="p-3 font-semibold text-slate-500">Data</th>
                </tr>
            </thead>
            <tbody>
                {entries.map(entry => (
                    <tr key={entry.id} className="border-b">
                        <td className="p-3">{entry.description}</td>
                        <td className="p-3">
                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${entry.type === 'Custo' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {entry.type}
                            </span>
                        </td>
                        <td className="p-3 font-medium">{entry.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="p-3 text-slate-500">{entry.date || '-'}</td>
                    </tr>
                ))}
                {entries.length === 0 && (
                    <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500">Nenhum lançamento registrado.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      <FinancialImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={handleImport} 
      />
    </div>
  );
};

export default ProjectFinanceiro;
