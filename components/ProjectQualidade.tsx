
declare const XLSX: any;
import React, { useState } from 'react';
import { Project, QualityCheck, QualityStatus } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ChartBarIcon, ImportIcon, ExportIcon } from './icons';
import DashboardAnaliticoQualidade from './DashboardAnaliticoQualidade';
import QualityImportModal from './QualityImportModal';
import { supabase } from '../lib/supabaseClient';

interface ProjectQualidadeProps {
  project: Project | null;
  qualityChecks: QualityCheck[];
  onAddQualityCheck: () => void;
  onEditQualityCheck: (qc: QualityCheck) => void;
  setQualityChecks: React.Dispatch<React.SetStateAction<QualityCheck[]>>;
}

const ProjectQualidade: React.FC<ProjectQualidadeProps> = ({ project, qualityChecks, onAddQualityCheck, onEditQualityCheck, setQualityChecks }) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  if (!project) {
    return (
      <div className="p-8 bg-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Controle de Qualidade</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-slate-600">Selecione um projeto para ver os detalhes de qualidade.</p>
        </div>
      </div>
    );
  }

  const handleDelete = (qcId: number) => {
    // This is a placeholder. Deletion logic is in App.tsx
    console.log("Request to delete quality check:", qcId);
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(qualityChecks.map(q => q.id)); // Assuming id is number based on interface
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Tem certeza que deseja excluir ${selectedIds.length} itens de qualidade?`)) {
      const { error } = await supabase
        .from('quality_items')
        .delete()
        .in('id', selectedIds);

      if (error) {
        alert('Erro ao excluir itens: ' + error.message);
      } else {
        setQualityChecks(prev => prev.filter(q => !selectedIds.includes(q.id)));
        setSelectedIds([]);
        alert(`${selectedIds.length} itens excluídos com sucesso.`);
      }
    }
  };

  const getStatusColor = (status: QualityStatus) => {
    switch (status) {
      case 'Conforme': return 'bg-green-100 text-green-700';
      case 'Não Conforme': return 'bg-red-100 text-red-700';
      case 'Pendente': return 'bg-yellow-100 text-yellow-700';
    }
  };

  const handleExportXLSX = () => {
    if (qualityChecks.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const dataToExport = qualityChecks.map(q => ({
      'Item de Inspeção': q.item,
      'Categoria': q.category,
      'Responsável': q.responsible,
      'Status': q.status,
      'Detalhes': q.details,
      'Última Atualização': q.lastUpdate
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 15 }];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Qualidade");
    XLSX.writeFile(workbook, `Qualidade_${project.name}.xlsx`);
  };

  const handleImport = (importedChecks: Partial<QualityCheck>[]) => {
    const newChecks = importedChecks.map(c => ({
      ...c,
      id: Date.now() + Math.random(),
      projectName: project.name
    } as QualityCheck));

    setQualityChecks(prev => [...prev, ...newChecks]);
    alert(`${newChecks.length} itens importados com sucesso!`);
  };

  if (showDashboard) {
    return <DashboardAnaliticoQualidade qualityChecks={qualityChecks} goBack={() => setShowDashboard(false)} projectName={project.name} />;
  }

  return (
    <div className="p-8 bg-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Controle de Qualidade: {project.name}</h1>
        <button
          onClick={() => setShowDashboard(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm font-medium">
          <ChartBarIcon className="w-5 h-5" />
          <span>Dashboard Analítico</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-800">Itens de Inspeção de Qualidade</h2>
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
            <button onClick={onAddQualityCheck} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-bold">
              <PlusIcon className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={qualityChecks.length > 0 && selectedIds.length === qualityChecks.length}
                  />
                </th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Item de Inspeção</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Responsável</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Última Atualização</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {qualityChecks.length > 0 ? qualityChecks.map(check => (
                <tr key={check.id} className={`hover:bg-slate-50 ${selectedIds.includes(check.id) ? 'bg-blue-50' : ''}`}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.includes(check.id)}
                      onChange={() => handleSelectRow(check.id)}
                    />
                  </td>
                  <td className="p-3 font-medium text-slate-800">{check.item}</td>
                  <td className="p-3">{check.category}</td>
                  <td className="p-3">{check.responsible}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(check.status)}`}>
                      {check.status}
                    </span>
                  </td>
                  <td className="p-3">{check.lastUpdate}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => onEditQualityCheck(check)} className="text-slate-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                      {/* Delete button can be added if a delete handler is passed from App.tsx */}
                      {/* <button onClick={() => handleDelete(check.id)} className="text-slate-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button> */}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center p-6 text-slate-500">Nenhum dado disponível.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QualityImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        projectName={project.name}
      />
    </div>
  );
};

export default ProjectQualidade;
