
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { Project, Task, TaskStatus } from '../types';
import StatCard from './StatCard';
import GanttChart from './GanttChart';

interface GestaoVistaProps {
  // Props removed
}

const GestaoVista: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, tasks } = useProjectContext();

  const project = projects.find(p => p.id === Number(id));
  const filteredTasks = tasks.filter(t => t.projectName === project?.name);

  if (!project) {
    return (
      <div className="p-8 bg-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestão à Vista</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-slate-600">Por favor, selecione um projeto para visualizar.</p>
        </div>
        <button onClick={() => project && navigate(`/projeto/${project.id}/cronograma`)} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800">
          &larr; Voltar
        </button>
      </div>
    );
  }

  // KPI Calculation using filteredTasks (renamed from tasks prop)
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'Concluída').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'Em Andamento').length;
  const delayedTasks = filteredTasks.filter(t => t.status === 'Atrasada').length;

  const ganttTasks = filteredTasks.map(t => ({
    name: t.name,
    startDate: new Date(t.plannedStart),
    endDate: new Date(t.plannedEnd),
    status: t.status,
  }));


  const allDates = ganttTasks.length > 0 ? ganttTasks.flatMap(t => [t.startDate, t.endDate]) : [new Date(project.startDate), new Date(project.endDate)];
  const overallStartDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const overallEndDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  overallStartDate.setDate(overallStartDate.getDate() - 5);
  overallEndDate.setDate(overallEndDate.getDate() + 10);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Não Iniciada': return 'bg-gray-200 text-gray-800';
      case 'Em Andamento': return 'bg-blue-200 text-blue-800';
      case 'Concluída': return 'bg-green-200 text-green-800';
      case 'Atrasada': return 'bg-red-200 text-red-800';
      case 'Travado': return 'bg-slate-700 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };


  return (
    <div className="p-8 bg-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Gestão à Vista: {project.name}</h1>
        <button onClick={() => project && navigate(`/projeto/${project.id}/cronograma`)} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
          <span className="mr-1">&larr;</span> Voltar ao Cronograma
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Tarefas" value={String(totalTasks)} />
        <StatCard title="Tarefas Concluídas" value={String(completedTasks)} valueColor="text-green-500" />
        <StatCard title="Tarefas em Andamento" value={String(inProgressTasks)} valueColor="text-blue-500" />
        <StatCard title="Tarefas Atrasadas" value={String(delayedTasks)} valueColor="text-red-500" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Gráfico de Gantt - Visão Geral</h2>
        <div className="overflow-x-auto">
          {ganttTasks.length > 0 ? (
            <GanttChart
              projects={ganttTasks}
              startDate={overallStartDate}
              endDate={overallEndDate}
              viewMode="day"
            />
          ) : (
            <p className="text-center p-6 text-slate-500">Nenhuma tarefa para exibir.</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Resumo das Atividades</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['ATIVIDADE/MARCO', 'RESPONSÁVEL', 'DEPARTAMENTO', 'TÉRMINO PREVISTO', 'STATUS'].map(header => (
                  <th key={header} className="p-3 font-semibold text-slate-500 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTasks.length > 0 ? filteredTasks.map(task => (
                <tr key={task.id}>
                  <td className="p-3 font-medium text-slate-800">{task.name}</td>
                  <td className="p-3">{task.responsible}</td>
                  <td className="p-3">{task.department || '-'}</td>
                  <td className="p-3">{task.plannedEnd}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-slate-500">Nenhuma tarefa cadastrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestaoVista;
