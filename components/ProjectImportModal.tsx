
declare const XLSX: any;
import React, { useState, useRef } from 'react';
import { Project, ProjectStatus } from '../types';
import { ImportIcon, UploadCloudIcon } from './icons';

interface ProjectImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (projects: Partial<Project>[]) => void;
}

const ProjectImportModal: React.FC<ProjectImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewCount, setPreviewCount] = useState<number>(0);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    // Map Excel Headers to Internal Keys
    const headerMap: Record<string, keyof Project> = {
        'ID (Código)': 'code',
        'Nome do Projeto': 'name',
        'Cliente': 'client',
        'Data Início': 'startDate',
        'Previsão Término': 'endDate',
        'Status': 'status',
        'Descrição': 'description',
        'Gerente': 'manager' // Optional but good to have
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const parseFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    setError('O arquivo parece estar vazio.');
                    setParsedData([]);
                    return;
                }

                // Validate mandatory field
                const hasName = 'Nome do Projeto' in jsonData[0] || 'name' in jsonData[0];
                if (!hasName) {
                    setError('Coluna obrigatória "Nome do Projeto" não encontrada. Utilize o modelo padrão.');
                    setParsedData([]);
                    return;
                }

                setError('');
                setParsedData(jsonData);
                setPreviewCount(jsonData.length);
            } catch (err) {
                console.error(err);
                setError('Erro ao ler o arquivo. Certifique-se que é um formato XLSX válido.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                'ID (Código)': 'ABC-001',
                'Nome do Projeto': 'Exemplo de Projeto',
                'Cliente': 'Nome do Cliente',
                'Data Início': 'YYYY-MM-DD',
                'Previsão Término': 'YYYY-MM-DD',
                'Status': 'Em Planejamento',
                'Descrição': 'Descrição do projeto...',
                'Gerente': 'Nome do Gerente'
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);

        // Adjust column widths for better readability
        const wscols = [
            { wch: 15 }, // ID
            { wch: 30 }, // Nome
            { wch: 20 }, // Cliente
            { wch: 15 }, // Início
            { wch: 15 }, // Término
            { wch: 20 }, // Status
            { wch: 40 }, // Descrição
            { wch: 20 }  // Gerente
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo Projetos");
        XLSX.writeFile(workbook, "Modelo_Importacao_Projetos.xlsx");
    };

    const parseDate = (value: any): string | undefined => {
        if (value === undefined || value === null) return undefined;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '' || trimmed === '-') return undefined;

            // Try formatting if it looks like a date string
            const date = new Date(trimmed);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
            return undefined;
        }

        // Excel Serial Number
        if (typeof value === 'number') {
            const date = new Date(Math.round((value - 25569) * 86400 * 1000));
            return isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
        }

        return undefined;
    };

    const processData = () => {
        const mappedProjects: Partial<Project>[] = parsedData.map((row: any) => {
            const project: any = {};

            // Normalize row keys (trim whitespace) for robust matching
            const normalizedRow: any = {};
            Object.keys(row).forEach(k => {
                normalizedRow[k.trim()] = row[k];
            });

            // Map standard headers
            Object.keys(headerMap).forEach(header => {
                if (normalizedRow[header] !== undefined) {
                    project[headerMap[header]] = normalizedRow[header];
                }
            });

            // Fallback for direct keys & English variants
            if (!project.name && (normalizedRow['name'] || normalizedRow['Name'])) project.name = normalizedRow['name'] || normalizedRow['Name'];
            if (!project.code && (normalizedRow['code'] || normalizedRow['Code'])) project.code = normalizedRow['code'] || normalizedRow['Code'];
            if (!project.client && (normalizedRow['client'] || normalizedRow['Client'])) project.client = normalizedRow['client'] || normalizedRow['Client'];

            // Format Dates
            project.startDate = parseDate(project.startDate || normalizedRow['Data Início']);
            project.endDate = parseDate(project.endDate || normalizedRow['Previsão Término']);

            // Ensure defaults
            if (!project.status) project.status = ProjectStatus.EmPlanejamento;

            // Map text status to Enum if needed (simple check)
            const validStatus = Object.values(ProjectStatus).includes(project.status);
            if (!validStatus) project.status = ProjectStatus.EmPlanejamento;

            return project;
        });

        onImport(mappedProjects);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Importar Projetos (XLSX)</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>

                <div className="space-y-6">

                    {/* Template Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p className="text-sm text-blue-800 mb-2">Para garantir a importação correta, utilize o modelo padrão.</p>
                        <button
                            onClick={handleDownloadTemplate}
                            className="text-sm font-bold text-blue-600 hover:underline flex items-center"
                        >
                            <ImportIcon className="w-4 h-4 mr-1" /> Baixar Modelo de Planilha (.xlsx)
                        </button>
                    </div>

                    {/* File Upload */}
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                        <UploadCloudIcon className="w-10 h-10 text-slate-400 mb-2" />
                        {file ? (
                            <div>
                                <p className="font-semibold text-slate-700">{file.name}</p>
                                <p className="text-sm text-slate-500">{previewCount} registros encontrados</p>
                                <button
                                    onClick={() => { setFile(null); setParsedData([]); setPreviewCount(0); }}
                                    className="text-xs text-red-500 hover:text-red-700 mt-2"
                                >
                                    Remover arquivo
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-slate-600 mb-2">Arraste seu arquivo ou clique para selecionar</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload-projects"
                                />
                                <label
                                    htmlFor="file-upload-projects"
                                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer font-medium text-sm"
                                >
                                    Selecionar Arquivo
                                </label>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={processData}
                            disabled={!file || !!error}
                            className={`px-4 py-2 text-white rounded-md font-medium ${!file || !!error ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            Importar Projetos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectImportModal;
