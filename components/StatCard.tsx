import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  color?: string; // Dashboard uses 'color', mapping it to text color classes or border
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color = 'blue' }) => {
  // Map simple color names to tailwind classes if needed, or just use as is if passed as class
  // Dashboard passes 'blue', 'yellow', 'green', 'red'.

  const getColorClass = (c: string) => {
    switch (c) {
      case 'blue': return 'text-blue-600 dark:text-blue-400';
      case 'green': return 'text-green-600 dark:text-green-400';
      case 'yellow': return 'text-yellow-600 dark:text-yellow-400';
      case 'red': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-800 dark:text-slate-100';
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</h3>
      <p className={`text-2xl font-bold ${getColorClass(color)}`}>{value}</p>
    </div>
  );
};

export default StatCard;
