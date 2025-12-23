
declare const XLSX: any;
import React, { useState } from 'react';
import { Project, Risk, RiskImpact, RiskProbability, RiskStatus } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ChartBarIcon, ImportIcon, ExportIcon } from './icons';
import DashboardAnaliticoRiscos from './DashboardAnaliticoRiscos';
import RiskImportModal from './RiskImportModal';
import { supabase } from '../lib/supabaseClient';

interface ProjectRiscosProps {
  project: Project | null;
  risks: Risk[];
  onAddRisk: () => void;
  onEditRisk: (risk: Risk) => void;
  setRisks: React.Dispatch<React.SetStateAction<Risk[]>>;
}

const ProjectRiscos: React.FC<ProjectRiscosProps> = ({ project, risks, onAddRisk, onEditRisk, setRisks }) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  if (!project) {
    return (
      <div className="p-8 bg-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gerenciamento de Riscos</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-slate-600">Selecione um projeto para ver a análise de riscos.</p>
        </div>
      </div>
    );
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(risks.map(r => r.id));
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

    if (window.confirm(`Tem certeza que deseja excluir ${selectedIds.length} riscos?`)) {
      const { error } = await supabase
        .from('project_risks')
        .delete()
        .in('id', selectedIds);

      if (error) {
        alert('Erro ao excluir riscos: ' + error.message);
      } else {
        setRisks(prev => prev.filter(r => !selectedIds.includes(r.id)));
        setSelectedIds([]);
        alert(`${selectedIds.length} riscos excluídos com sucesso.`);
      }
    }
  };

  const getProbabilityColor = (level: RiskProbability) => {
    switch (level) {
      case 'Baixa': return 'bg-green-100 text-green-700';
      case 'Média': return 'bg-yellow-100 text-yellow-700';
      case 'Alta': return 'bg-red-100 text-red-700';
    }
  };

  const getImpactColor = (level: RiskImpact) => {
    switch (level) {
      case 'Baixo': return 'bg-green-100 text-green-700';
      case 'Médio': return 'bg-yellow-100 text-yellow-700';
      case 'Alto': return 'bg-red-100 text-red-700';
    }
  };

  const getStatusColor = (status: RiskStatus) => {
    switch (status) {
      case 'Aberto': return 'bg-red-100 text-red-700';
      case 'Em Tratamento': return 'bg-yellow-100 text-yellow-700';
      case 'Mitigado': return 'bg-blue-100 text-blue-700';
      case 'Fechado': return 'bg-green-100 text-green-700';
    }
  };

  const handleExportXLSX = () => {
    if (risks.length === 0) {
      alert("Não há riscos para exportar.");
      return;
    }

    const dataToExport = risks.map(r => ({
      'Descrição': r.description,
      'Categoria': r.category,
      'Probabilidade': r.probability,
      'Impacto': r.impact,
      'Responsável': r.responsible,
      'Status': r.status,
      'Plano de Mitigação': r.mitigationPlan,
      'Última Atualização': r.lastUpdate
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 15 }];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riscos");
    XLSX.writeFile(workbook, `Riscos_${project.name}.xlsx`);
  };

  const handleImport = (importedRisks: Partial<Risk>[]) => {
    const newRisks = importedRisks.map(r => ({
      ...r,
      id: Date.now() + Math.random(),
      projectName: project.name // Ensure alignment
    } as Risk));

    setRisks(prev => [...prev, ...newRisks]);
    alert(`${newRisks.length} riscos importados com sucesso!`);
  };

  if (showDashboard) {
    return <DashboardAnaliticoRiscos risks={risks} goBack={() => setShowDashboard(false)} projectName={project.name} />;
  }

  return (
    <div className="p-8 bg-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Gerenciamento de Riscos - {project.name}</h1>
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
            <h2 className="text-xl font-bold text-slate-800">Matriz de Riscos</h2>
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
            <button onClick={onAddRisk} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-bold">
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
                    checked={risks.length > 0 && selectedIds.length === risks.length}
                  />
                </th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Descrição do Risco</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Probabilidade</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Impacto</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Responsável</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Última Atualização</th>
                <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {risks.length > 0 ? risks.map(risk => (
                <tr key={risk.id} className={`hover:bg-slate-50 ${selectedIds.includes(risk.id) ? 'bg-blue-50' : ''}`}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.includes(risk.id)}
                      onChange={() => handleSelectRow(risk.id)}
                    />
                  </td>
                  <td className="p-3 font-medium text-slate-800">{risk.description}</td>
                  <td className="p-3">{risk.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getProbabilityColor(risk.probability)}`}>
                      {risk.probability}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getImpactColor(risk.impact)}`}>
                      {risk.impact}
                    </span>
                  </td>
                  <td className="p-3">{risk.responsible}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(risk.status)}`}>
                      {risk.status}
                    </span>
                  </td>
                  <td className="p-3">{risk.lastUpdate}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => onEditRisk(risk)} className="text-slate-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="text-center p-6 text-slate-500">Nenhum dado disponível.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RiskImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        projectName={project.name}
      />
    </div>
  );
};

export default ProjectRiscos;
