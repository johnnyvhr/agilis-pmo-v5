
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  valueColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, valueColor = 'text-slate-800' }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-sm text-slate-500">{title}</h3>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
};

export default StatCard;
