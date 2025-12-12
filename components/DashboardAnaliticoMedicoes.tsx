import React from 'react';
import { Medicao } from '../types';

interface DashboardProps {
    medicoes: Medicao[];
    goBack: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm text-slate-500 truncate">{title}</h3>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
);

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const chartHeight = 200;

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-grow flex items-end space-x-2 px-4" style={{ height: `${chartHeight}px`}}>
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                        <div className="absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            {d.label}: {d.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <div 
                            className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-sm"
                            style={{ height: `${(d.value / maxValue) * 100}%` }}
                        ></div>
                    </div>
                ))}
            </div>
             <div className="flex space-x-2 px-4 border-t border-slate-200 pt-2 mt-2">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 text-center text-xs text-slate-500 truncate">{d.label}</div>
                ))}
            </div>
        </div>
    );
};


const DoughnutChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];
    const total = data.reduce((acc, d) => acc + d.value, 0);
    let cumulative = 0;

    return (
        <div className="relative w-48 h-48 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full">
                {data.map((d, i) => {
                    const percentage = (d.value / total) * 100;
                    const strokeDasharray = `${percentage} ${100 - percentage}`;
                    const strokeDashoffset = 25 - cumulative;
                    cumulative += percentage;
                    return (
                        <circle
                            key={i}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="transparent"
                            stroke={colors[i % colors.length]}
                            strokeWidth="4"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 18 18)"
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-center">
                    <span className="text-2xl font-bold text-slate-800">{total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                 </div>
            </div>
        </div>
    );
};


const LineChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const chartHeight = 200;
    const chartWidth = 500;
    const maxValue = Math.max(...data.map(d => d.value));
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * chartWidth;
        const y = chartHeight - (d.value / maxValue) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
                <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points={points}
                />
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * chartWidth;
                    const y = chartHeight - (d.value / maxValue) * chartHeight;
                    return <circle key={i} cx={x} cy={y} r="4" fill="#3b82f6" />;
                })}
            </svg>
             <div className="flex justify-between px-2 border-t border-slate-200 pt-2 mt-2">
                {data.map((d, i) => (
                    <div key={i} className="text-xs text-slate-500">{d.label}</div>
                ))}
            </div>
        </div>
    );
};


const DashboardAnaliticoMedicoes: React.FC<DashboardProps> = ({ medicoes, goBack }) => {

    // Process data
    const totalMedicoes = medicoes.length;
    const valorTotalMedido = medicoes.reduce((sum, m) => sum + Number(m.qtd) * Number(m.valorUnitario), 0);
    const projetosAtivos = new Set(medicoes.map(m => m.projeto)).size;
    const departamentosEnvolvidos = new Set(medicoes.map(m => m.departamento)).size;

    const valorPorProjeto = medicoes.reduce((acc: Record<string, number>, m) => {
        const total = Number(m.qtd) * Number(m.valorUnitario);
        acc[m.projeto] = (acc[m.projeto] || 0) + total;
        return acc;
    }, {} as Record<string, number>);

    const valorPorProjetoData = Object.entries(valorPorProjeto).map(([label, value]) => ({ label, value }));

    const valorPorDepartamento = medicoes.reduce((acc: Record<string, number>, m) => {
        const total = Number(m.qtd) * Number(m.valorUnitario);
        acc[m.departamento] = (acc[m.departamento] || 0) + total;
        return acc;
    }, {} as Record<string, number>);
    const valorPorDepartamentoData = Object.entries(valorPorDepartamento).map(([label, value]) => ({ label, value }));

    const evolucaoPorPeriodo = medicoes.reduce((acc: Record<string, number>, m) => {
        if (!m.data) return acc;
        const [year, month] = m.data.split('-');
        if(!year || !month) return acc;
        const monthYear = `${month}/${year}`;
        
        const total = Number(m.qtd) * Number(m.valorUnitario);
        acc[monthYear] = (acc[monthYear] || 0) + total;
        return acc;
    }, {} as Record<string, number>);
    
    const evolucaoPorPeriodoData = Object.entries(evolucaoPorPeriodo).sort((a, b) => {
        const partsA = a[0].split('/');
        const monthA = parseInt(partsA[0] || '0', 10);
        const yearA = parseInt(partsA[1] || '0', 10);
        const valA = yearA * 100 + monthA;

        const partsB = b[0].split('/');
        const monthB = parseInt(partsB[0] || '0', 10);
        const yearB = parseInt(partsB[1] || '0', 10);
        const valB = yearB * 100 + monthB;
        
        return valA - valB;
    }).map(([label, value]) => ({ label, value }));
    
    const topProjetos = [...valorPorProjetoData].sort((a,b) => Number(b.value) - Number(a.value)).slice(0, 5);


  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Analítico de Medições</h1>
        <button onClick={goBack} className="text-sm font-medium text-blue-600 hover:text-blue-800">
          &larr; Voltar para a Tabela
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="font-bold text-slate-800 mb-2">Filtros de Período</h2>
        <div className="w-1/4">
            <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-700">
                <option>Todos os períodos</option>
                <option>Últimos 30 dias</option>
                <option>Este mês</option>
                <option>Este ano</option>
            </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total de Medições" value={totalMedicoes} />
        <StatCard title="Valor Total Medido" value={valorTotalMedido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <StatCard title="Projetos Ativos" value={projetosAtivos} />
        <StatCard title="Departamentos Envolvidos" value={departamentosEnvolvidos} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Valor das Medições por Projeto</h2>
            <BarChart data={valorPorProjetoData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Distribuição por Departamento</h2>
            <DoughnutChart data={valorPorDepartamentoData} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Evolução das Medições por Período</h2>
        <LineChart data={evolucaoPorPeriodoData} />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Top 5 Projetos por Valor</h2>
                <ul className="divide-y divide-slate-200">
                    {topProjetos.map((p, i) => (
                        <li key={i} className="py-2 flex justify-between items-center">
                            <span className="text-slate-700">{i+1}. {p.label}</span>
                            <span className="font-bold text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value as number)}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Resumo por Departamento</h2>
                 <ul className="divide-y divide-slate-200">
                    {valorPorDepartamentoData.map((d, i) => (
                        <li key={i} className="py-2 flex justify-between items-center">
                            <span className="text-slate-700">{d.label}</span>
                            <span className="font-bold text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.value as number)}</span>
                        </li>
                    ))}
                </ul>
            </div>
       </div>

    </div>
  );
};

export default DashboardAnaliticoMedicoes;