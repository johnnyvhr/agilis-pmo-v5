
import React, { useState } from 'react';

interface DepartamentosProps {
  departments: string[];
  addDepartment: (name: string) => boolean;
  deleteDepartment: (name: string) => void;
}

const Departamentos: React.FC<DepartamentosProps> = ({ departments, addDepartment, deleteDepartment }) => {
  const [newDepartment, setNewDepartment] = useState('');

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const success = addDepartment(newDepartment);
    if (success) {
      setNewDepartment('');
    }
  };

  const handleDeleteDepartment = (departmentToDelete: string) => {
    deleteDepartment(departmentToDelete);
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
        <ul className="divide-y divide-slate-200">
          {departments.map((dep) => (
            <li key={dep} className="py-3 flex justify-between items-center">
              <span className="text-slate-700">{dep}</span>
              <button 
                onClick={() => handleDeleteDepartment(dep)}
                className="text-red-500 hover:text-red-700 text-sm font-semibold"
                aria-label={`Remover ${dep}`}
                >
                Remover
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Departamentos;