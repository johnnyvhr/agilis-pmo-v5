
declare const XLSX: any;
import React, { useState, useRef } from 'react';
import { ImportIcon, UploadCloudIcon } from './icons';

interface FinancialEntry {
    id: string; // Updated to match ProjectFinanceiro

    description: string;
    type: 'Custo' | 'Receita';
    value: number;
    date: string;
}

interface FinancialImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (entries: Partial<FinancialEntry>[]) => void;
}

const FinancialImportModal: React.FC<FinancialImportModalProps> = ({ isOpen, onClose, onImport }) => {
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
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    setError('O arquivo parece estar vazio.');
                    return;
                }

                // Basic validation
                const firstRow = jsonData[0];
                if (!('Descrição' in firstRow) && !('Valor' in firstRow)) {
                    setError('Colunas obrigatórias "Descrição" ou "Valor" não encontradas. Utilize o modelo.');
                    return;
                }

                setError('');
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
                'Descrição': 'Exemplo de Custo',
                'Tipo': 'Custo', // or Receita
                'Valor': 1500.00,
                'Data': 'YYYY-MM-DD'
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const wscols = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo Financeiro");
        XLSX.writeFile(workbook, "Modelo_Importacao_Financeiro.xlsx");
    };

    const processData = () => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const mappedEntries: Partial<FinancialEntry>[] = jsonData.map((row: any) => {
                let dateStr = row['Data'];
                if (typeof dateStr === 'number') {
                    const date = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
                    dateStr = date.toISOString().split('T')[0];
                }

                return {
                    description: row['Descrição'] || 'Sem descrição',
                    type: (row['Tipo'] === 'Receita' || row['Tipo'] === 'receita') ? 'Receita' : 'Custo',
                    value: parseFloat(row['Valor']) || 0,
                    date: dateStr || new Date().toISOString().split('T')[0]
                };
            });

            onImport(mappedEntries);
            onClose();
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Importar Financeiro (XLSX)</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p className="text-sm text-blue-800 mb-2">Utilize o modelo padrão para importar lançamentos.</p>
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
                                <button onClick={() => { setFile(null); setPreviewCount(0); }} className="text-xs text-red-500 hover:text-red-700 mt-2">Remover arquivo</button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-slate-600 mb-2">Clique para selecionar</p>
                                <input type="file" ref={fileInputRef} accept=".xlsx, .xls" onChange={handleFileChange} className="hidden" id="financial-upload" />
                                <label htmlFor="financial-upload" className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer font-medium text-sm">Selecionar Arquivo</label>
                            </div>
                        )}
                    </div>
                    {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium">Cancelar</button>
                        <button onClick={processData} disabled={!file || !!error} className={`px-4 py-2 text-white rounded-md font-medium ${!file || !!error ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>Importar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialImportModal;
