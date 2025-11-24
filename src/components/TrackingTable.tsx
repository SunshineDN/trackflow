import React from 'react';
import { AdCampaign } from '../types';
import { ChevronRight } from 'lucide-react';

interface TrackingTableProps {
  data: AdCampaign[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('pt-BR', { notation: "compact", compactDisplay: "short" }).format(num);
};

export const TrackingTable: React.FC<TrackingTableProps> = ({ data, onSelect, selectedId }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-5">An\u00fancio</th>
              <th scope="col" className="px-6 py-5 text-center text-brand-600 bg-brand-50/30 w-32">I</th>
              <th scope="col" className="px-6 py-5 text-center w-32">II</th>
              <th scope="col" className="px-6 py-5 text-center w-32">III</th>
              <th scope="col" className="px-6 py-5 text-center w-32">IV</th>
              <th scope="col" className="px-6 py-5 text-center w-32">V</th>
              <th scope="col" className="px-6 py-5 text-right w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((ad) => {
              const isSelected = selectedId === ad.id;
              return (
                <tr 
                  key={ad.id} 
                  onClick={() => onSelect(ad.id)}
                  className={`cursor-pointer transition-all duration-200 group ${isSelected ? 'bg-brand-50/20' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          ad.status === 'active' ? 'bg-brand-400 animate-pulse' : 
                          ad.status === 'paused' ? 'bg-amber-400' : 'bg-slate-300'
                        }`} />
                        <span className={`font-medium ${isSelected ? 'text-brand-700' : 'text-slate-800'}`}>{ad.name}</span>
                      </div>
                      <div className="ml-4 mt-1 text-xs text-slate-400 flex items-center gap-2">
                        <span>{ad.campaignName}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{ad.adSetName}</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Stage I: Impressions */}
                  <td className="px-6 py-4 text-center bg-brand-50/10 group-hover:bg-brand-50/30 transition-colors">
                    <span className="font-medium text-slate-700">{formatNumber(ad.metrics.impressions)}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Invest: R$ {formatNumber(ad.metrics.spend)}</p>
                  </td>

                  {/* Stage II: Clicks */}
                  <td className="px-6 py-4 text-center">
                    <span className="text-slate-600">{formatNumber(ad.metrics.clicks)}</span>
                    <div className="w-16 mx-auto bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                       <div className="bg-brand-300 h-1 rounded-full" style={{ width: `${(ad.metrics.clicks / ad.metrics.impressions) * 1000}%` }}></div>
                    </div>
                  </td>

                  {/* Stage III: Leads */}
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-slate-700">{formatNumber(ad.metrics.leads)}</span>
                  </td>

                  {/* Stage IV: Checkout */}
                  <td className="px-6 py-4 text-center">
                     <span className="text-slate-600">{formatNumber(ad.metrics.checkout)}</span>
                  </td>

                  {/* Stage V: Purchase */}
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-brand-600">{formatNumber(ad.metrics.purchase)}</span>
                  </td>

                   <td className="px-6 py-4 text-right">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-brand-100 text-brand-600' : 'text-slate-300 group-hover:text-brand-400 group-hover:bg-slate-100'}`}>
                      <ChevronRight size={16} />
                    </div>
                   </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
