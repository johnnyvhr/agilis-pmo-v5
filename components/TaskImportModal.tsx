
declare const XLSX: any;
import React, { useState, useRef } from 'react';
import { Task, TaskStatus } from '../types';
import { ImportIcon, UploadCloudIcon } from './icons';

interface TaskImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (tasks: Partial<Task>[], mode: 'append' | 'update') => void;
    projectName: string;
}

const TaskImportModal: React.FC<TaskImportModalProps> = ({ isOpen, onClose, onImport, projectName }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewCount, setPreviewCount] = useState<number>(0);
    const [importMode, setImportMode] = useState<'append' | 'update'>('append');
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    // Map Excel Headers to Internal Keys
    const headerMap: Record<string, keyof Task | 'id'> = {
        'ID Sistema': 'id',
        'Fase/Grupo': 'group',
        'Atividade/Marco': 'name',
        'Responsável': 'responsible',
        'Departamento': 'department',
        'Início Previsto': 'plannedStart',
        'Término Previsto': 'plannedEnd',
        '% Concluído': 'percentComplete',
        'Status': 'status',
        'Início Real': 'actualStart',
        'Término Real': 'actualEnd'
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
                const hasName = 'Atividade/Marco' in jsonData[0] || 'name' in jsonData[0];
                if (!hasName) {
                    setError('Coluna obrigatória "Atividade/Marco" não encontrada. Utilize o modelo padrão.');
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
                'ID Sistema': '(Opcional para novos)',
                'Fase/Grupo': 'Planejamento',
                'Atividade/Marco': 'Exemplo de Tarefa',
                'Responsável': 'Nome do Responsável',
                'Departamento': 'Engenharia',
                'Início Previsto': 'YYYY-MM-DD',
                'Término Previsto': 'YYYY-MM-DD',
                '% Concluído': 0,
                'Status': 'Não Iniciada',
                'Início Real': '',
                'Término Real': ''
            }
        ];
        
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        
        // Adjust column widths for better readability
        const wscols = [
            { wch: 20 }, // ID
            { wch: 15 }, // Fase/Grupo
            { wch: 30 }, // Atividade
            { wch: 20 }, // Responsável
            { wch: 15 }, // Departamento
            { wch: 15 }, // Início Prev
            { wch: 15 }, // Término Prev
            { wch: 12 }, // % Concluído
            { wch: 15 }, // Status
            { wch: 15 }, // Início Real
            { wch: 15 }  // Término Real
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo Importação");
        XLSX.writeFile(workbook, "Modelo_Importacao_Tarefas.xlsx");
    };

    const processData = () => {
        const mappedTasks: Partial<Task>[] = parsedData.map((row: any) => {
            const task: any = { projectName }; // Default to current project

            // Map standard headers
            Object.keys(headerMap).forEach(header => {
                if (row[header] !== undefined) {
                    task[headerMap[header]] = row[header];
                }
            });

            // Fallback for direct keys if header mapping didn't work (loose matching)
            if (!task.name && row['name']) task.name = row['name'];
            
            // Format Dates if they came in as Excel serial numbers
            ['plannedStart', 'plannedEnd', 'actualStart', 'actualEnd'].forEach(dateField => {
                 if (typeof task[dateField] === 'number') {
                     // Excel date serial to JS Date conversion rough approximation
                     const date = new Date(Math.round((task[dateField] - 25569) * 86400 * 1000));
                     task[dateField] = date.toISOString().split('T')[0];
                 }
            });

            // Ensure basics
            if (!task.status) task.status = 'Não Iniciada';
            if (!task.percentComplete) task.percentComplete = 0;
            
            return task;
        });

        onImport(mappedTasks, importMode);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Importar Tarefas (XLSX)</h2>
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
                                    accept=".xlsx, .xls" 
                                    onChange={handleFileChange}
                                    className="hidden" 
                                    id="file-upload-input"
                                />
                                <label 
                                    htmlFor="file-upload-input"
                                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer font-medium text-sm"
                                >
                                    Selecionar Arquivo
                                </label>
                            </div>
                        )}
                    </div>
                    
                    {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                    {/* Import Mode */}
                    {file && !error && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Opções de Processamento</label>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input 
                                        type="radio" 
                                        id="mode-append" 
                                        checked={importMode === 'append'} 
                                        onChange={() => setImportMode('append')}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <label htmlFor="mode-append" className="ml-3 block text-sm text-slate-700">
                                        <span className="font-medium">Adicionar como Novas</span> (Ignora IDs existentes)
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        type="radio" 
                                        id="mode-update" 
                                        checked={importMode === 'update'} 
                                        onChange={() => setImportMode('update')}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <label htmlFor="mode-update" className="ml-3 block text-sm text-slate-700">
                                        <span className="font-medium">Atualizar Existentes</span> (Usa a coluna ID para atualizar; adiciona se não encontrar)
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

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
                            Importar Dados
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskImportModal;
