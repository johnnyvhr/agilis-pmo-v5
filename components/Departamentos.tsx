
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PencilIcon, TrashIcon } from './icons';

interface DepartamentosProps {
  departments: string[];
  addDepartment: (name: string) => boolean;
  deleteDepartment: (name: string) => void;
}

const Departamentos: React.FC<DepartamentosProps> = ({ }) => {
  const [localDepartments, setLocalDepartments] = useState<{ id: string, name: string }[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments:', error);
      alert('Erro ao carregar departamentos: ' + error.message);
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
      alert('O nome do departamento não pode ser vazio.');
      return;
    }

    if (localDepartments.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      alert('Este departamento já existe.');
      return;
    }

    const { error } = await supabase
      .from('departments')
      .insert([{ name }]);

    if (error) {
      alert('Erro ao adicionar departamento: ' + error.message);
    } else {
      alert('Departamento adicionado com sucesso!');
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
        alert('Erro ao excluir departamento: ' + error.message);
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
      alert("O nome não pode ser vazio.");
      return;
    }

    const { error } = await supabase
      .from('departments')
      .update({ name: name })
      .eq('id', id);

    if (error) {
      alert("Erro ao atualizar departamento: " + error.message);
    } else {
      setLocalDepartments(prev => prev.map(dep => dep.id === id ? { ...dep, name: name } : dep));
      setEditingId(null);
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
        <h2 className="text-xl font-bold text-slate-800 mb-4">Departamentos Cadastrados</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {localDepartments.map((dep) => (
              <li key={dep.id} className="py-3 flex justify-between items-center group">
                {editingId === dep.id ? (
                  <div className="flex-grow flex items-center space-x-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-grow px-2 py-1 border border-blue-400 rounded-md focus:outline-none"
                    />
                    <button onClick={() => saveEditing(dep.id)} className="text-green-600 hover:text-green-800 font-medium text-sm">Salvar</button>
                    <button onClick={cancelEditing} className="text-slate-500 hover:text-slate-700 font-medium text-sm">Cancelar</button>
                  </div>
                ) : (
                  <>
                    <span className="text-slate-700 font-medium">{dep.name}</span>
                    <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  </>
                )}
              </li>
            ))}
            {localDepartments.length === 0 && (
              <li className="py-3 text-slate-500 italic">Nenhum departamento cadastrado.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Departamentos;