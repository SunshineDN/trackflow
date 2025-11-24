import { AdCampaign, MetricSummary } from './types';

export const STAGE_DESCRIPTIONS = {
  I: "Impressões",
  II: "Cliques",
  III: "Leads",
  IV: "Checkout",
  V: "Compras"
};

export const MOCK_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'act_101_ad_01',
    name: 'AD01 - Vídeo Lifestyle',
    campaignName: 'Campanha Verão 2025',
    adSetName: 'Aberto - Brasil',
    status: 'active',
    metrics: { 
      impressions: 45200, 
      clicks: 1250, 
      leads: 320, 
      checkout: 45, 
      purchase: 12,
      spend: 1240.50
    }
  },
  {
    id: 'act_101_ad_02',
    name: 'AD02 - Carrossel Benefícios',
    campaignName: 'Campanha Verão 2025',
    adSetName: 'Interesse: Tech',
    status: 'active',
    metrics: { 
      impressions: 32100, 
      clicks: 980, 
      leads: 210, 
      checkout: 28, 
      purchase: 8,
      spend: 890.20
    }
  },
  {
    id: 'act_101_ad_03',
    name: 'AD03 - Imagem Estática Oferta',
    campaignName: 'Remarketing Quente',
    adSetName: 'Visitantes 30D',
    status: 'paused',
    metrics: { 
      impressions: 15400, 
      clicks: 850, 
      leads: 120, 
      checkout: 15, 
      purchase: 5,
      spend: 450.00
    }
  },
  {
    id: 'act_101_ad_04',
    name: 'AD04 - UGC Testimonial',
    campaignName: 'Campanha Verão 2025',
    adSetName: 'Lookalike 1% Compradores',
    status: 'active',
    metrics: { 
      impressions: 68000, 
      clicks: 2100, 
      leads: 540, 
      checkout: 82, 
      purchase: 34,
      spend: 1850.75
    }
  },
  {
    id: 'act_101_ad_05',
    name: 'AD05 - Reels Trend',
    campaignName: 'Branding Awareness',
    adSetName: 'Broad Female 18-35',
    status: 'completed',
    metrics: { 
      impressions: 120500, 
      clicks: 4500, 
      leads: 890, 
      checkout: 120, 
      purchase: 45,
      spend: 3200.00
    }
  }
];

export const MOCK_METRICS: MetricSummary[] = [
  { label: 'Investimento Total', value: 'R$ 7.631,45', trend: 'up', percentage: '+12%' },
  { label: 'ROAS Médio', value: '4.2x', trend: 'up', percentage: '+5%' },
  { label: 'Custo por Lead (CPL)', value: 'R$ 3,66', trend: 'down', percentage: '-8%' },
  { label: 'Taxa de Conversão (LP)', value: '2.1%', trend: 'neutral', percentage: '0%' },
];
