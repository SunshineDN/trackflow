import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { MetricSummary } from '../types';

interface MetricCardProps {
  metric: MetricSummary;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  return (
    <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{metric.label}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-800">{metric.value}</h3>
        <div className={`flex items-center text-sm font-medium ${
          metric.trend === 'up' ? 'text-brand-500' : 
          metric.trend === 'down' ? 'text-red-400' : 'text-slate-400'
        }`}>
          {metric.trend === 'up' && <ArrowUpRight size={16} className="mr-1" />}
          {metric.trend === 'down' && <ArrowDownRight size={16} className="mr-1" />}
          {metric.trend === 'neutral' && <Minus size={16} className="mr-1" />}
          {metric.percentage}
        </div>
      </div>
    </div>
  );
};
