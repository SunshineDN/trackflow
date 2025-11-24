import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdCampaign } from '../types';

interface FunnelChartProps {
  data: AdCampaign[];
  selectedId: string | null;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data, selectedId }) => {
  const activeCampaign = selectedId 
    ? data.find(c => c.id === selectedId) 
    : data[0];

  if (!activeCampaign) return null;

  const chartData = [
    { name: 'I', value: activeCampaign.metrics.impressions, label: 'Impress\u00f5es' },
    { name: 'II', value: activeCampaign.metrics.clicks, label: 'Cliques' },
    { name: 'III', value: activeCampaign.metrics.leads, label: 'Leads' },
    { name: 'IV', value: activeCampaign.metrics.checkout, label: 'Checkout' },
    { name: 'V', value: activeCampaign.metrics.purchase, label: 'Compras' },
  ];

  return (
    <div className="h-[300px] w-full bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Funil de Convers\u00e3o
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{activeCampaign.name}</p>
        </div>
        <span className="px-2 py-1 rounded-md bg-brand-50 text-brand-600 text-xs font-bold">
          ROAS: {(activeCampaign.metrics.purchase * 150 / activeCampaign.metrics.spend).toFixed(1)}x
        </span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#1e293b', fontWeight: 500 }}
            cursor={{ stroke: '#4ade80', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#4ade80" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
