
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PencilIcon, TrashIcon } from './icons';

interface DepartamentosProps {
  departments: string[];
  addDepartment: (name: string) => boolean;
  deleteDepartment: (name: string) => void;
}

import { useToast } from '../context/ToastContext';

const Departamentos: React.FC<DepartamentosProps> = ({ }) => {
  const toast = useToast();

  const [localDepartments, setLocalDepartments] = useState<{ id: string, name: string }[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fetchDepartments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments:', error);
      toast.error('Erro ao carregar departamentos: ' + error.message);
    } else if (data) {
      setLocalDepartments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newDepartment.trim();

    if (!name) {
      toast.error('O nome do departamento não pode ser vazio.');
      return;
    }

    if (localDepartments.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Este departamento já existe.');
      return;
    }

    const { error } = await supabase
      .from('departments')
      .insert([{ name }]);

    if (error) {
      toast.error('Erro ao adicionar departamento: ' + error.message);
    } else {
      toast.success('Departamento adicionado com sucesso!');
      setNewDepartment('');
      fetchDepartments();
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o departamento "${name}"?`)) {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Erro ao excluir departamento: ' + error.message);
      } else {
        fetchDepartments();
      }
    }
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEditing = async (id: string) => {
    const name = editName.trim();
    if (!name) {
      toast.error("O nome não pode ser vazio.");
      return;
    }

    const { error } = await supabase
      .from('departments')
      .update({ name: name })
      .eq('id', id);

    if (error) {
      toast.error("Erro ao atualizar departamento: " + error.message);
    } else {
      setLocalDepartments(prev => prev.map(dep => dep.id === id ? { ...dep, name: name } : dep));
      setEditingId(null);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(localDepartments.map(d => d.id));
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

    if (window.confirm(`Tem certeza que deseja excluir ${selectedIds.length} departamentos?`)) {
      const { error } = await supabase
        .from('departments')
        .delete()
        .in('id', selectedIds);

      if (error) {
        toast.error('Erro ao excluir departamentos: ' + error.message);
      } else {
        fetchDepartments();
        setSelectedIds([]);
        toast.success(`${selectedIds.length} departamentos excluídos com sucesso!`);
      }
    }
  };

  return (
    <div className="p-8 bg-slate-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestão de Departamentos</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Adicionar Novo Departamento</h2>
        <form onSubmit={handleAddDepartment} className="flex items-center space-x-4">
          <input
            type="text"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            placeholder="Nome do departamento"
            className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Adicionar
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Departamentos Cadastrados</h2>
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

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      onChange={handleSelectAll}
                      checked={localDepartments.length > 0 && selectedIds.length === localDepartments.length}
                    />
                  </th>
                  <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider">Nome do Departamento</th>
                  <th className="p-3 font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {localDepartments.map((dep) => (
                  <tr key={dep.id} className={`hover:bg-slate-50 ${selectedIds.includes(dep.id) ? 'bg-blue-50' : ''}`}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedIds.includes(dep.id)}
                        onChange={() => handleSelectRow(dep.id)}
                      />
                    </td>
                    <td className="p-3">
                      {editingId === dep.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-grow px-2 py-1 border border-blue-400 rounded-md focus:outline-none"
                          />
                          <button onClick={() => saveEditing(dep.id)} className="text-green-600 hover:text-green-800 font-medium text-xs">Salvar</button>
                          <button onClick={cancelEditing} className="text-slate-500 hover:text-slate-700 font-medium text-xs">Cancelar</button>
                        </div>
                      ) : (
                        <span className="text-slate-700 font-medium">{dep.name}</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {!editingId && (
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => startEditing(dep.id, dep.name)}
                            className="text-blue-500 hover:text-blue-700"
                            aria-label={`Editar ${dep.name}`}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dep.id, dep.name)}
                            className="text-red-500 hover:text-red-700"
                            aria-label={`Remover ${dep.name}`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {localDepartments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500 italic">
                      Nenhum departamento cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Departamentos;