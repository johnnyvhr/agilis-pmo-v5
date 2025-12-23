declare const XLSX: any;
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { ImportIcon, ExportIcon } from './icons';
import FinancialImportModal from './FinancialImportModal';
import { supabase } from '../lib/supabaseClient';

interface FinancialEntry {
  id: string; // Changed to string (UUID)
  description: string;
  type: 'Custo' | 'Receita';
  value: number; // mapped from amount
  date: string;
  measurement_id?: string;
  project_id?: number;
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
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch entries from Supabase
  const fetchFinancialRecords = async () => {
    if (!project) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .eq('project_id', project.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching financial records:', error);
      // alert('Erro ao carregar financeiro: ' + error.message);
    } else if (data) {
      const formattedData: FinancialEntry[] = data.map((item: any) => ({
        id: item.id,
        description: item.description,
        type: item.type,
        value: item.amount,
        date: item.date,
        measurement_id: item.measurement_id,
        project_id: item.project_id
      }));
      setEntries(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFinancialRecords();
  }, [project]); // Re-fetch when project changes

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const val = parseFloat(value);
    if (isNaN(val)) {
      alert("Valor inválido");
      return;
    }

    const payload = {
      project_id: project.id,
      description: description,
      type: type,
      amount: val, // DB column is amount
      date: date,
    };

    const { error } = await supabase
      .from('financial_records')
      .insert([payload]);

    if (error) {
      alert("Erro ao adicionar lançamento: " + error.message);
    } else {
      // Reset form and refresh
      setDescription('');
      setType('Custo');
      setValue('');
      setDate('');
      fetchFinancialRecords();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este lançamento?")) {
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Erro ao excluir: " + error.message);
      } else {
        fetchFinancialRecords();
      }
    }
  }

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



  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(entries.map(e => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Tem certeza que deseja excluir ${selectedIds.length} lançamentos financeiros?`)) {
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .in('id', selectedIds);

      if (error) {
        alert('Erro ao excluir lançamentos: ' + error.message);
      } else {
        alert(`${selectedIds.length} lançamentos excluídos com sucesso.`);
        setSelectedIds([]);
        fetchFinancialRecords();
      }
    }
  };

  const handleImport = async (importedEntries: Partial<FinancialEntry>[]) => {
    // Prepare payloads for bulk insert
    const payloads = importedEntries.map(e => ({
      project_id: project.id,
      description: e.description || 'Importado',
      type: e.type || 'Custo',
      amount: e.value || 0,
      date: e.date || new Date().toISOString().split('T')[0]
    }));

    const { error } = await supabase
      .from('financial_records')
      .insert(payloads);

    if (error) {
      alert('Erro ao importar: ' + error.message);
    } else {
      alert(`${payloads.length} lançamentos importados com sucesso!`);
      fetchFinancialRecords();
    }
  };

  const totalReceitas = entries.filter(e => e.type === 'Receita').reduce((acc, curr) => acc + curr.value, 0);
  const totalCustos = entries.filter(e => e.type === 'Custo').reduce((acc, curr) => acc + curr.value, 0);
  const saldo = totalReceitas - totalCustos;


  return (
    <div className="p-8 bg-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Controle Financeiro: {project.name}</h1>
        <button onClick={fetchFinancialRecords} className="text-sm text-blue-600 hover:underline">Atualizar</button>
      </div>

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
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-800">Histórico de Lançamentos</h2>
            {selectedIds.length > 0 && (
              <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-1 rounded-md border border-red-200 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="font-semibold">{selectedIds.length} selecionados</span>
                <button
                  onClick={handleBulkDelete}
                  className="text-red-700 hover:text-red-900 hover:underline font-bold ml-2"
                >
                  Excluir Selecionados
                </button>
              </div>
            )}
          </div>
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

        {loading ? <p className="text-center py-4">Carregando...</p> : (
          <table className="w-full text-left text-sm">
            {/* Table */}
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={entries.length > 0 && selectedIds.length === entries.length}
                  />
                </th>
                <th className="p-3 font-semibold text-slate-500">Descrição</th>
                <th className="p-3 font-semibold text-slate-500">Tipo</th>
                <th className="p-3 font-semibold text-slate-500">Valor</th>
                <th className="p-3 font-semibold text-slate-500">Data</th>
                <th className="p-3 font-semibold text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} className={`border-b ${selectedIds.includes(entry.id) ? 'bg-blue-50' : ''}`}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.includes(entry.id)}
                      onChange={() => handleSelectRow(entry.id)}
                    />
                  </td>
                  <td className="p-3">
                    {entry.description}
                    {entry.measurement_id && <span className="ml-2 text-xs text-blue-500 bg-blue-50 px-1 rounded">Vinculado</span>}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${entry.type === 'Custo' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{entry.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="p-3 text-slate-500">{entry.date || '-'}</td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(entry.id)} className="text-red-500 hover:text-red-700 font-bold" title="Excluir">X</button>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">Nenhum lançamento registrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
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
