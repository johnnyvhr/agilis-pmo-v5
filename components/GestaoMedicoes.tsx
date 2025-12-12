
declare const XLSX: any;

import React, { useState, useRef } from 'react';
import { Medicao, Project } from '../types';
import { ChartBarIcon, ImportIcon, ExportIcon, PlusIcon, PencilIcon, TrashIcon } from './icons';
import DashboardAnaliticoMedicoes from './DashboardAnaliticoMedicoes';
import MedicaoFormModal from './MedicaoFormModal';


const initialMedicoes: Medicao[] = [];

interface GestaoMedicoesProps {
    projects: Project[];
    departments: string[];
}

const GestaoMedicoes: React.FC<GestaoMedicoesProps> = ({ projects, departments }) => {
    const [medicoes, setMedicoes] = useState<Medicao[]>(initialMedicoes);
    const [showDashboard, setShowDashboard] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMedicao, setEditingMedicao] = useState<Medicao | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenAddModal = () => {
        setEditingMedicao(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (medicao: Medicao) => {
        setEditingMedicao(medicao);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if(window.confirm('Tem certeza que deseja excluir esta medição?')) {
            setMedicoes(medicoes.filter(m => m.id !== id));
        }
    }

    const handleSave = (medicao: Omit<Medicao, 'id'> & { id?: number }) => {
        if (medicao.id) {
            // Edit
            setMedicoes(medicoes.map(m => m.id === medicao.id ? { ...m, ...medicao } : m));
        } else {
            // Add
            const newMedicao = { ...medicao, id: Date.now() };
            setMedicoes([...medicoes, newMedicao]);
        }
        setIsModalOpen(false);
    };

    const handleExportXLSX = () => {
        if (medicoes.length === 0) {
            alert("Não há medições para exportar.");
            return;
        }

        const dataToExport = medicoes.map(m => ({
            'Projeto': m.projeto,
            'Item Medido': m.item,
            'Qtd. Medida': m.qtd,
            'Unidade': m.unidade,
            'Valor Unitário (R$)': m.valorUnitario,
            'Valor Total (R$)': m.qtd * m.valorUnitario,
            'Data Medição': m.data,
            'Departamento': m.departamento
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Auto-fit columns
        const header = Object.keys(dataToExport[0]);
        const colWidths = header.map(h => ({
            wch: Math.max(
                h.length,
                ...dataToExport.map((row: any) => {
                    const cellValue = row[h];
                    if (cellValue === null || cellValue === undefined) {
                        return 0;
                    }
                    return cellValue.toString().length;
                })
            ) + 2 
        }));
        worksheet["!cols"] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Medições");

        XLSX.writeFile(workbook, "medicoes.xlsx");
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').slice(1);
            const newMedicoes = rows
                .map(row => {
                    const columns = row.split(',');
                    if (columns.length !== 7) return null;
                    return {
                        id: Date.now() + Math.random(),
                        projeto: columns[0]?.trim(),
                        item: columns[1]?.trim(),
                        qtd: parseFloat(columns[2]),
                        unidade: columns[3]?.trim(),
                        valorUnitario: parseFloat(columns[4]),
                        data: columns[5]?.trim(),
                        departamento: columns[6]?.trim(),
                    };
                })
                .filter((m): m is Medicao => m !== null && !isNaN(m.qtd) && !isNaN(m.valorUnitario));

            setMedicoes(prev => [...prev, ...newMedicoes]);
        };
        reader.readAsText(file);
        // Reset file input
        event.target.value = '';
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    if (showDashboard) {
        return <DashboardAnaliticoMedicoes medicoes={medicoes} goBack={() => setShowDashboard(false)} />;
    }

  return (
    <>
    {isModalOpen && (
        <MedicaoFormModal
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            medicaoToEdit={editingMedicao}
            projects={projects}
            departments={departments}
        />
    )}
    <div className="p-8 bg-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Gestão de Medições</h1>
        <button 
            onClick={() => setShowDashboard(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm font-medium">
          <ChartBarIcon className="w-5 h-5" />
          <span>Dashboard Analítico</span>
        </button>
      </div>

       <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Medições de Projetos</h2>
                <div className="flex items-center space-x-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".csv" />
                    <button onClick={handleImportClick} className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm">
                        <ImportIcon className="w-4 h-4" />
                        <span>Importar Excel</span>
                    </button>
                    <button onClick={handleExportXLSX} className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm">
                        <ExportIcon className="w-4 h-4" />
                        <span>Exportar Excel</span>
                    </button>
                    <button onClick={handleOpenAddModal} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-bold">
                        <PlusIcon className="w-4 h-4" />
                        <span>Adicionar</span>
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Projeto</th>
                            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Item Medido</th>
                            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Qtd. Medida</th>
                            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Unidade</th>
                            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Valor Unitário (R$)</th>
                            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Valor Total (R$)</th>
                            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Data Medição</th>
                            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Departamento</th>
                            <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                       {medicoes.map((medicao) => (
                           <tr key={medicao.id}>
                               <td className="p-3 text-slate-700 font-medium">{medicao.projeto}</td>
                               <td className="p-3 text-slate-700">{medicao.item}</td>
                               <td className="p-3 text-slate-700">{medicao.qtd}</td>
                               <td className="p-3 text-slate-700">{medicao.unidade}</td>
                               <td className="p-3 text-slate-700">{formatCurrency(medicao.valorUnitario)}</td>
                               <td className="p-3 text-slate-700 font-semibold">{formatCurrency(medicao.qtd * medicao.valorUnitario)}</td>
                               <td className="p-3 text-slate-700">{medicao.data}</td>
                               <td className="p-3 text-slate-700">{medicao.departamento}</td>
                               <td className="p-3">
                                   <div className="flex items-center space-x-3">
                                       <button onClick={() => handleOpenEditModal(medicao)} className="text-slate-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                       <button onClick={() => handleDelete(medicao.id)} className="text-slate-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                   </div>
                               </td>
                           </tr>
                       ))}
                    </tbody>
                </table>
            </div>
      </div>
    </div>
    </>
  );
};

export default GestaoMedicoes;