import React from 'react';
import { QualityCheck, QualityStatus } from '../types';

interface DashboardProps {
    qualityChecks: QualityCheck[];
    goBack: () => void;
    projectName: string;
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm text-slate-500 truncate">{title}</h3>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
);

const PieChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const colors: Record<string, string> = {
        'Conforme': '#22c55e', // green-500
        'Não Conforme': '#ef4444', // red-500
        'Pendente': '#f59e0b', // amber-500
    };
    const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
    let cumulative = 0;

    return (
        <div className="flex items-center gap-6">
            <div className="relative w-40 h-40">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                    {data.map((d, i) => {
                        const percentage = (d.value / total) * 100;
                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                        const strokeDashoffset = 25 - cumulative;
                        cumulative += percentage;
                        return (
                            <circle
                                key={i} cx="18" cy="18" r="15.915" fill="transparent"
                                stroke={colors[d.label] || '#9ca3af'} strokeWidth="4"
                                strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 18 18)"
                            />
                        );
                    })}
                </svg>
            </div>
            <div className="space-y-2">
                {data.map(d => (
                    <div key={d.label} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[d.label] || '#9ca3af' }}></span>
                        <span className="text-slate-700">{d.label}: {d.value} ({(d.value/total*100).toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0) || 1;
    return (
        <div className="w-full h-48 flex items-end space-x-2 px-4">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full">
                    <div className="absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.label}: {d.value}
                    </div>
                    <div className="w-full h-full flex items-end">
                        <div className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-sm" style={{ height: `${(d.value / maxValue) * 100}%` }}></div>
                    </div>
                    <div className="text-center text-xs text-slate-500 truncate w-full pt-1">{d.label}</div>
                </div>
            ))}
        </div>
    );
};


const DashboardAnaliticoQualidade: React.FC<DashboardProps> = ({ qualityChecks, goBack, projectName }) => {
    // Process data
    const totalChecks = qualityChecks.length;
    const conforme = qualityChecks.filter(r => r.status === 'Conforme').length;
    const naoConforme = qualityChecks.filter(r => r.status === 'Não Conforme').length;
    const pendente = qualityChecks.filter(r => r.status === 'Pendente').length;

    const checksByStatus = [
        { label: 'Conforme', value: conforme },
        { label: 'Não Conforme', value: naoConforme },
        { label: 'Pendente', value: pendente },
    ].filter(d => d.value > 0);

    const checksByCategory = qualityChecks.reduce((acc, qc) => {
        acc[qc.category] = (acc[qc.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const checksByCategoryData = Object.entries(checksByCategory).map(([label, value]) => ({ label, value }));

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard de Qualidade: {projectName}</h1>
        <button onClick={goBack} className="text-sm font-medium text-blue-600 hover:text-blue-800">
          &larr; Voltar para a Tabela
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total de Inspeções" value={totalChecks} />
        <StatCard title="Conformes" value={conforme} />
        <StatCard title="Não Conformes" value={naoConforme} />
        <StatCard title="Pendentes" value={pendente} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Inspeções por Status</h2>
            <PieChart data={checksByStatus} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Inspeções por Categoria</h2>
            <BarChart data={checksByCategoryData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardAnaliticoQualidade;
