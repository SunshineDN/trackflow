export interface AdMetrics {
  impressions: number; // Stage I
  clicks: number; // Stage II
  leads: number; // Stage III
  checkout: number; // Stage IV
  purchase: number; // Stage V
  spend: number; // Financial data from Meta
}

export interface AdCampaign {
  id: string;
  name: string; // Ad Name
  adSetName: string; // Corresponds to AdSet
  campaignName: string; // Corresponds to Campaign
  status: 'active' | 'paused' | 'completed';
  metrics: AdMetrics;
}

export enum JourneyStage {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V'
}

export interface MetricSummary {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  percentage: string;
}
