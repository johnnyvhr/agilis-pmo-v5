import React from 'react';
import { Risk, RiskImpact, RiskProbability } from '../types';

interface DashboardProps {
    risks: Risk[];
    goBack: () => void;
    projectName: string;
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm text-slate-500 truncate">{title}</h3>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
);

const BarChart: React.FC<{ data: { label: string; value: number }[], color: string }> = ({ data, color }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0) || 1;
    return (
        <div className="w-full h-48 flex items-end space-x-2 px-4">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full">
                    <div className="absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.label}: {d.value}
                    </div>
                    <div className="w-full h-full flex items-end">
                         <div 
                            className={`w-full ${color} hover:opacity-80 rounded-t-sm`}
                            style={{ height: `${(d.value / maxValue) * 100}%` }}
                        ></div>
                    </div>
                    <div className="text-center text-xs text-slate-500 truncate w-full pt-1">{d.label}</div>
                </div>
            ))}
        </div>
    );
};

const RiskMatrix: React.FC<{ risks: Risk[] }> = ({ risks }) => {
    const matrix: Record<RiskProbability, Record<RiskImpact, number>> = {
        'Alta': { 'Baixo': 0, 'Médio': 0, 'Alto': 0 },
        'Média': { 'Baixo': 0, 'Médio': 0, 'Alto': 0 },
        'Baixa': { 'Baixo': 0, 'Médio': 0, 'Alto': 0 },
    };

    risks.forEach(risk => {
        matrix[risk.probability][risk.impact]++;
    });
    
    const getColor = (prob: RiskProbability, imp: RiskImpact) => {
        if ((prob === 'Alta' && imp === 'Alto') || (prob === 'Alta' && imp === 'Médio') || (prob === 'Média' && imp === 'Alto')) return 'bg-red-500';
        if ((prob === 'Alta' && imp === 'Baixo') || (prob === 'Média' && imp === 'Médio') || (prob === 'Baixa' && imp === 'Alto')) return 'bg-yellow-400';
        return 'bg-green-400';
    }

    const probabilities: RiskProbability[] = ['Alta', 'Média', 'Baixa'];
    const impacts: RiskImpact[] = ['Baixo', 'Médio', 'Alto'];

    return (
         <div>
            <div className="flex">
                <div className="w-24"></div>
                {impacts.map(imp => <div key={imp} className="flex-1 text-center font-bold text-slate-600">{imp}</div>)}
            </div>
            {probabilities.map(prob => (
                <div key={prob} className="flex items-center">
                    <div className="w-24 text-right pr-4 font-bold text-slate-600">{prob}</div>
                    {impacts.map(imp => (
                        <div key={imp} className={`flex-1 m-1 h-20 flex items-center justify-center text-white font-bold text-2xl rounded-md ${getColor(prob, imp)}`}>
                            {matrix[prob][imp]}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

const DashboardAnaliticoRiscos: React.FC<DashboardProps> = ({ risks, goBack, projectName }) => {
    // Process data
    const totalRisks = risks.length;
    const openRisks = risks.filter(r => r.status === 'Aberto').length;
    const highImpactRisks = risks.filter(r => r.impact === 'Alto').length;
    const highProbabilityRisks = risks.filter(r => r.probability === 'Alta').length;

    const risksByStatus = risks.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const risksByStatusData = Object.entries(risksByStatus).map(([label, value]) => ({ label, value }));

    const risksByCategory = risks.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const risksByCategoryData = Object.entries(risksByCategory).map(([label, value]) => ({ label, value }));

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard de Riscos: {projectName}</h1>
        <button onClick={goBack} className="text-sm font-medium text-blue-600 hover:text-blue-800">
          &larr; Voltar para a Matriz
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total de Riscos" value={totalRisks} />
        <StatCard title="Riscos Abertos" value={openRisks} />
        <StatCard title="Riscos de Alto Impacto" value={highImpactRisks} />
        <StatCard title="Riscos de Alta Probabilidade" value={highProbabilityRisks} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Matriz de Probabilidade vs. Impacto</h2>
        <RiskMatrix risks={risks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Distribuição de Riscos por Status</h2>
            <BarChart data={risksByStatusData} color="bg-purple-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Distribuição de Riscos por Categoria</h2>
            <BarChart data={risksByCategoryData} color="bg-teal-500" />
        </div>
      </div>
    </div>
  );
};

export default DashboardAnaliticoRiscos;
