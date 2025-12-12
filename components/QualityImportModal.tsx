
declare const XLSX: any;
import React, { useState, useRef } from 'react';
import { QualityCheck, QualityStatus } from '../types';
import { ImportIcon, UploadCloudIcon } from './icons';

interface QualityImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (checks: Partial<QualityCheck>[]) => void;
    projectName: string;
}

const QualityImportModal: React.FC<QualityImportModalProps> = ({ isOpen, onClose, onImport, projectName }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewCount, setPreviewCount] = useState<number>(0);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

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
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    setError('Arquivo vazio.');
                    return;
                }
                if (!('Item de Inspeção' in jsonData[0])) {
                    setError('Coluna "Item de Inspeção" não encontrada.');
                    return;
                }
                setError('');
                setPreviewCount(jsonData.length);
            } catch (err) {
                console.error(err);
                setError('Erro ao ler arquivo.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        const templateData = [{
            'Item de Inspeção': 'Verificação Exemplo',
            'Categoria': 'Estrutura',
            'Responsável': 'Nome',
            'Status': 'Pendente', // Conforme, Não Conforme, Pendente
            'Detalhes': 'Observações...'
        }];
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const wscols = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 40 }];
        worksheet['!cols'] = wscols;
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo Qualidade");
        XLSX.writeFile(workbook, "Modelo_Importacao_Qualidade.xlsx");
    };

    const processData = () => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const mappedChecks: Partial<QualityCheck>[] = jsonData.map((row: any) => ({
                projectName,
                item: row['Item de Inspeção'] || 'Novo Item',
                category: row['Categoria'] || 'Geral',
                responsible: row['Responsável'] || '',
                status: (['Conforme', 'Não Conforme', 'Pendente'].includes(row['Status']) ? row['Status'] : 'Pendente') as QualityStatus,
                details: row['Detalhes'] || '',
                lastUpdate: new Date().toISOString().split('T')[0]
            }));

            onImport(mappedChecks);
            onClose();
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Importar Qualidade (XLSX)</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <button onClick={handleDownloadTemplate} className="text-sm font-bold text-blue-600 hover:underline flex items-center">
                            <ImportIcon className="w-4 h-4 mr-1" /> Baixar Modelo (.xlsx)
                        </button>
                    </div>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                        <UploadCloudIcon className="w-10 h-10 text-slate-400 mb-2" />
                        {file ? (
                             <div>
                                <p className="font-semibold text-slate-700">{file.name}</p>
                                <p className="text-sm text-slate-500">{previewCount} registros encontrados</p>
                                <button onClick={() => { setFile(null); setPreviewCount(0); }} className="text-xs text-red-500 hover:text-red-700 mt-2">Remover</button>
                            </div>
                        ) : (
                             <div>
                                <p className="text-slate-600 mb-2">Selecione o arquivo XLSX</p>
                                <input type="file" ref={fileInputRef} accept=".xlsx, .xls" onChange={handleFileChange} className="hidden" id="quality-upload" />
                                <label htmlFor="quality-upload" className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer font-medium text-sm">Selecionar Arquivo</label>
                            </div>
                        )}
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md font-medium">Cancelar</button>
                        <button onClick={processData} disabled={!file || !!error} className={`px-4 py-2 text-white rounded-md font-medium ${!file || !!error ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>Importar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QualityImportModal;
