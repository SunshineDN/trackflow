import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { analyzeCampaignData } from '../services/geminiService';
import { AdCampaign } from '../types';
import ReactMarkdown from 'react-markdown';

interface AiInsightsProps {
  campaigns: AdCampaign[];
}

export const AiInsights: React.FC<AiInsightsProps> = ({ campaigns }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeCampaignData(campaigns);
      setAnalysis(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
      {/* Abstract Background Glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-500 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-400" size={20} />
            <h3 className="font-bold text-lg">Gemini AI Insights</h3>
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={14} /> : 'Analisar Dados'}
          </button>
        </div>

        <div className="min-h-[100px] text-sm text-slate-300 leading-relaxed">
          {loading ? (
             <div className="animate-pulse space-y-2">
               <div className="h-2 bg-white/10 rounded w-3/4"></div>
               <div className="h-2 bg-white/10 rounded w-1/2"></div>
               <div className="h-2 bg-white/10 rounded w-5/6"></div>
             </div>
          ) : analysis ? (
            <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-white/50 italic">Clique em "Analisar Dados" para receber uma auditoria inteligente das suas campanhas baseada no funil de vendas I-V.</p>
          )}
        </div>
      </div>
    </div>
  );
};
