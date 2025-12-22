
declare const XLSX: any;

import React, { useState, useRef, useEffect } from 'react';
import { Medicao, Project } from '../types';
import { ChartBarIcon, ImportIcon, ExportIcon, PlusIcon, PencilIcon, TrashIcon } from './icons';
import DashboardAnaliticoMedicoes from './DashboardAnaliticoMedicoes';
import MedicaoFormModal from './MedicaoFormModal';
import { supabase } from '../lib/supabaseClient';


interface GestaoMedicoesProps {
    projects: Project[];
    departments: string[];
}

const GestaoMedicoes: React.FC<GestaoMedicoesProps> = ({ projects, departments }) => {
    const [medicoes, setMedicoes] = useState<Medicao[]>([]);
    const [filteredMedicoes, setFilteredMedicoes] = useState<Medicao[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDashboard, setShowDashboard] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMedicao, setEditingMedicao] = useState<Medicao | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter States
    const [statusFilter, setStatusFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchMedicoes = async () => {
        setLoading(true);
        // Include profiles for created_by name
        const { data, error } = await supabase
            .from('project_measurements')
            .select(`
                *,
                projects (name),
                profiles (name) 
            `)
            .order('measurement_date', { ascending: false });

        if (error) {
            console.error('Error fetching measurements:', error);
            // alert('Erro ao carregar medições: ' + error.message);
        } else if (data) {
            const formattedMedicoes: Medicao[] = data.map((item: any) => ({
                id: item.id,
                projeto: item.projects?.name || 'Desconhecido',
                projectId: item.project_id,
                item: item.item_name,
                qtd: item.quantity,
                unidade: item.unit,
                valorUnitario: item.unit_price,
                data: item.measurement_date,
                departamento: item.department || '',
                status: item.status || 'Solicitada',
                createdByUsername: item.profiles?.name || 'Sistema'
            }));
            setMedicoes(formattedMedicoes);
            setFilteredMedicoes(formattedMedicoes);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMedicoes();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = medicoes;

        if (statusFilter) {
            result = result.filter(m => m.status === statusFilter);
        }

        if (deptFilter) {
            result = result.filter(m => m.departamento === deptFilter);
        }

        if (startDate) {
            result = result.filter(m => m.data >= startDate);
        }

        if (endDate) {
            result = result.filter(m => m.data <= endDate);
        }

        setFilteredMedicoes(result);
    }, [medicoes, statusFilter, deptFilter, startDate, endDate]);


    const handleOpenAddModal = () => {
        setEditingMedicao(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (medicao: Medicao) => {
        setEditingMedicao(medicao);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta medição?')) {
            const { error } = await supabase
                .from('project_measurements')
                .delete()
                .eq('id', id);

            if (error) {
                alert('Erro ao excluir medição: ' + error.message);
            } else {
                setMedicoes(medicoes.filter(m => m.id !== id));
            }
        }
    }

    const handleStatusChange = async (id: string, newStatus: string, oldStatus: string) => {
        const { error } = await supabase
            .from('project_measurements')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar status: ' + error.message);
        } else {
            // Update local state
            setMedicoes(medicoes.map(m => m.id === id ? { ...m, status: newStatus as any } : m));

            // Feedback Logic
            if (oldStatus === 'Faturada' && newStatus !== 'Faturada') {
                // Reversal scenario
                alert('Status atualizado e lançamento financeiro removido com sucesso.');
            } else if (newStatus === 'Faturada' && oldStatus !== 'Faturada') {
                // Creation scenario
                alert(`Status atualizado para 'Faturada' e receita lançada no financeiro.`);
            }
        }
    };

    const handleSave = async (medicao: Omit<Medicao, 'id'> & { id?: string }) => {
        try {
            let projectId = medicao.projectId;

            if (!projectId) {
                const proj = projects.find(p => p.name === medicao.projeto);
                if (proj) {
                    projectId = proj.id;
                } else {
                    alert("Erro: Projeto não encontrado.");
                    return;
                }
            }

            // Get Current User for Audit
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Erro: Usuário não autenticado. Faça login novamente.");
                return;
            }

            // Construct strict payload
            const payload: any = {
                project_id: projectId,
                item_name: medicao.item,
                quantity: medicao.qtd,
                unit: medicao.unidade,
                unit_price: medicao.valorUnitario,
                total_price: medicao.qtd * medicao.valorUnitario,
                measurement_date: medicao.data,
                department: medicao.departamento,
                status: medicao.status || 'Planejada',
                created_by: user.id
            };

            console.log("Saving Measurement Payload:", payload);

            if (medicao.id) {
                // Edit - Remove created_by to avoid overwriting original creator, and status if not provided
                delete payload.created_by;

                // Don't overwrite status if it's not in the edit payload (modal doesn't return it)
                if (!medicao.status) {
                    delete payload.status;
                }

                const { error } = await supabase
                    .from('project_measurements')
                    .update(payload)
                    .eq('id', medicao.id);

                if (error) {
                    console.error("Supabase Update Error:", error);
                    alert('Erro ao atualizar medição: ' + error.message);
                } else {
                    fetchMedicoes();
                    setIsModalOpen(false);
                }
            } else {
                // Insert
                const { error } = await supabase
                    .from('project_measurements')
                    .insert([payload]);

                if (error) {
                    console.error("Supabase Insert Error:", error);
                    alert('Erro ao salvar medição: ' + error.message);
                } else {
                    fetchMedicoes();
                    setIsModalOpen(false);
                }
            }
        } catch (err: any) {
            console.error("Unexpected error in handleSave:", err);
            alert("Erro inesperado ao salvar: " + err.message);
        }
    };

    const handleExportXLSX = () => {
        if (filteredMedicoes.length === 0) {
            alert("Não há medições para exportar.");
            return;
        }

        const dataToExport = filteredMedicoes.map(m => ({
            'Projeto': m.projeto,
            'Item Medido': m.item,
            'Qtd. Medida': m.qtd,
            'Unidade': m.unidade,
            'Valor Unitário (R$)': m.valorUnitario,
            'Valor Total (R$)': m.qtd * m.valorUnitario,
            'Data Medição': m.data,
            'Departamento': m.departamento,
            'Status': m.status,
            'Cadastrado Por': m.createdByUsername
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

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // Get Current User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Erro: Usuário não autenticado. Faça login para importar.");
                return;
            }

            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

            const formattedRows: any[] = [];
            let skippedCount = 0;

            console.log("Raw rows from Excel:", rows);

            const parseBrazilianNumber = (value: any) => {
                if (typeof value === 'number') return value;
                if (!value) return 0;

                const strValue = String(value);
                const cleaned = strValue
                    .replace(/R\$/g, '')
                    .replace(/\s/g, '')
                    .replace(/\./g, '')
                    .replace(',', '.');

                const parsed = parseFloat(cleaned);
                return isNaN(parsed) ? 0 : parsed;
            };

            for (const row of rows) {
                const projectNameRaw = row['Projeto'];
                const itemRaw = row['Item Medido'];
                const qtdRaw = row['Qtd. Medida'];
                const unitRaw = row['Unidade'];
                const unitPriceRaw = row['Valor Unitário (R$)'];
                const totalPriceRaw = row['Valor Total (R$)'];
                const dateRaw = row['Data Medição'];
                const deptRaw = row['Departamento'];
                const statusRaw = row['Status'];

                if (!projectNameRaw || !itemRaw) {
                    skippedCount++;
                    continue;
                }

                const project = projects.find(p => p.name?.trim().toLowerCase() === String(projectNameRaw).trim().toLowerCase());

                if (!project) {
                    console.warn(`Project not found: ${projectNameRaw}`);
                    skippedCount++;
                    continue;
                }

                const quantity = parseBrazilianNumber(qtdRaw);
                const unitPrice = parseBrazilianNumber(unitPriceRaw);
                const totalPrice = parseBrazilianNumber(totalPriceRaw);
                const unit = unitRaw ? String(unitRaw).trim() : '';

                let measurementDate = null;
                if (typeof dateRaw === 'number') {
                    const dateObj = new Date(Math.round((dateRaw - 25569) * 86400 * 1000));
                    measurementDate = dateObj.toISOString().split('T')[0];
                } else if (typeof dateRaw === 'string' && dateRaw.trim()) {
                    if (dateRaw.includes('/')) {
                        const parts = dateRaw.split('/');
                        if (parts.length === 3) {
                            measurementDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        }
                    } else {
                        const d = new Date(dateRaw);
                        if (!isNaN(d.getTime())) {
                            measurementDate = d.toISOString().split('T')[0];
                        }
                    }
                }

                if (project.id && measurementDate) {
                    formattedRows.push({
                        project_id: project.id,
                        item_name: String(itemRaw).trim(),
                        quantity: quantity,
                        unit: unit,
                        unit_price: unitPrice,
                        total_price: totalPrice || (quantity * unitPrice),
                        measurement_date: measurementDate,
                        department: deptRaw ? String(deptRaw).trim() : null,
                        status: statusRaw ? String(statusRaw).trim() : 'Planejada',
                        created_by: user.id
                    });
                } else {
                    console.warn("Invalid row data skipped:", row);
                    skippedCount++;
                }
            }

            if (formattedRows.length > 0) {
                setLoading(true);
                const { error } = await supabase
                    .from('project_measurements')
                    .insert(formattedRows);

                setLoading(false);

                if (error) {
                    console.error('Batch Insert error:', error);
                    alert('Erro ao salvar medições importadas: ' + error.message);
                } else {
                    const msg = `${formattedRows.length} medições importadas com sucesso!`;
                    alert(skippedCount > 0 ? `${msg} (${skippedCount} linhas ignoradas/inválidas)` : msg);
                    fetchMedicoes();
                }
            } else {
                alert('Nenhuma linha válida encontrada para importação.');
            }

        } catch (err: any) {
            console.error("Error parsing file:", err);
            alert("Erro ao ler o arquivo Excel: " + err.message);
        }

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

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5">
                            <option value="">Todos</option>
                            <option value="Planejada">Planejada</option>
                            <option value="Solicitada">Solicitada</option>
                            <option value="Faturada">Faturada</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Departamento</label>
                        <select
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5">
                            <option value="">Todos</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Data Início</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Data Fim</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        />
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                        {(statusFilter || deptFilter || startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setStatusFilter('');
                                    setDeptFilter('');
                                    setStartDate('');
                                    setEndDate('');
                                }}
                                className="text-sm text-red-500 hover:text-red-700 mr-2"
                            >
                                Limpar Filtros
                            </button>
                        )}
                    </div>
                </div>


                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Medições de Projetos</h2>
                        <div className="flex items-center space-x-2">
                            <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".csv, .xlsx" />
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

                    {loading ? (
                        <div className="text-center py-8">Carregando medições...</div>
                    ) : (
                        <div className="overflow-x-auto min-h-[400px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Projeto</th>
                                        <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Item Medido</th>
                                        <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Qtd.</th>
                                        <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Unidade</th>
                                        <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Valor Un. (R$)</th>
                                        <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Valor Total (R$)</th>
                                        <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                                        <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Depto</th>
                                        <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Cadastrado por</th>
                                        <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredMedicoes.length > 0 ? filteredMedicoes.map((medicao) => (
                                        <tr key={medicao.id} className="hover:bg-slate-50">
                                            <td className="p-3 text-slate-700 font-medium">{medicao.projeto}</td>
                                            <td className="p-3 text-slate-700">{medicao.item}</td>
                                            <td className="p-3 text-slate-700">{medicao.qtd}</td>
                                            <td className="p-3 text-slate-700">{medicao.unidade}</td>
                                            <td className="p-3 text-slate-700">{formatCurrency(medicao.valorUnitario)}</td>
                                            <td className="p-3 text-slate-700 font-semibold">{formatCurrency(medicao.qtd * medicao.valorUnitario)}</td>
                                            <td className="p-3 text-slate-700 truncate">{medicao.data}</td>
                                            <td className="p-3 text-slate-700">{medicao.departamento}</td>
                                            <td className="p-3">
                                                <select
                                                    value={medicao.status}
                                                    onChange={(e) => handleStatusChange(medicao.id, e.target.value, medicao.status)}
                                                    className={`px-2 py-1 rounded text-xs font-semibold border border-slate-300 focus:ring-1 focus:ring-offset-1 cursor-pointer bg-white
                                                        ${medicao.status === 'Faturada' ? 'text-green-700 border-green-300' :
                                                            medicao.status === 'Solicitada' ? 'text-blue-700 border-blue-300' :
                                                                'text-slate-700'}`}
                                                >
                                                    <option value="Planejada">Planejada</option>
                                                    <option value="Solicitada">Solicitada</option>
                                                    <option value="Faturada">Faturada</option>
                                                </select>
                                            </td>
                                            <td className="p-3 text-slate-500 text-xs">
                                                {medicao.createdByUsername || '-'}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center space-x-3">
                                                    <button onClick={() => handleOpenEditModal(medicao)} className="text-slate-500 hover:text-blue-600" title="Editar"><PencilIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(medicao.id)} className="text-slate-500 hover:text-red-600" title="Excluir"><TrashIcon className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={11} className="p-8 text-center text-slate-500">
                                                {medicoes.length === 0 ? "Nenhuma medição encontrada." : "Nenhuma medição corresponde aos filtros."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default GestaoMedicoes;