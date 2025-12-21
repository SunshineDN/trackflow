import { prisma } from "@/lib/prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/google/callback`;

// Scopes for Google Ads
const SCOPES = [
  'https://www.googleapis.com/auth/adwords'
];

export function getGoogleAuthUrl(state?: string) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline', // Important for refresh token
    prompt: 'consent',      // Force consent to ensure refresh token is returned
    state: state || '',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Google OAuth Error: ${error.error_description || error.error}`);
  }

  return res.json();
}

export async function refreshGoogleToken(refreshToken: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to refresh Google token');
  }

  return res.json();
}

// --- Google Ads API Helpers ---

const GOOGLE_ADS_API_VERSION = 'v16';
const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

async function googleAdsRequest(customerId: string, query: string, accessToken: string, developerToken: string = 'INSERT_DEVELOPER_TOKEN_HERE') {
  // NOTE: Developer Token is required. Usually stored in env.
  // Assuming user has one.
  const DEV_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;

  const res = await fetch(`${GOOGLE_ADS_BASE_URL}/customers/${customerId}/googleAds:search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': DEV_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Google Ads API Error:", JSON.stringify(err, null, 2));
    throw new Error(`Google Ads API Request Failed: ${res.statusText}`);
  }

  return res.json();
}

export async function listAccessibleCustomers(accessToken: string) {
  const DEV_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
  const res = await fetch(`https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': DEV_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Google Ads List Customers Error:", JSON.stringify(err, null, 2));
    throw new Error(`Failed to list customers: ${res.statusText}`);
  }

  const data = await res.json();
  return data.resourceNames; // ["customers/123", "customers/456"]
}

// --- Data Fetching ---

export async function fetchGoogleHierarchy(googleAdAccountId: string, since: string, until: string) {
  const account = await prisma.googleAdAccount.findUnique({
    where: { id: googleAdAccountId },
  });

  if (!account) throw new Error("Google Ad Account not found");

  // Refresh token if needed (simplified logic: always refresh or check expiry)
  // For robustness, let's refresh if we suspect it's old, or just try/catch.
  // Better: Check expiry. If < 5 mins remaining, refresh.
  let accessToken = account.accessToken;
  if (!accessToken || (account.tokenExpiresAt && new Date() > new Date(account.tokenExpiresAt.getTime() - 5 * 60000))) {
    const tokens = await refreshGoogleToken(account.refreshToken);
    accessToken = tokens.access_token;
    await prisma.googleAdAccount.update({
      where: { id: account.id },
      data: {
        accessToken: tokens.access_token,
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      }
    });
  }

  const customerId = account.customerId.replace(/-/g, '');

  // GAQL Queries
  // 1. Campaigns
  const campaignQuery = `
    SELECT 
      campaign.id, 
      campaign.name, 
      campaign.status,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.all_conversions_value
    FROM campaign 
    WHERE segments.date BETWEEN '${since}' AND '${until}'
  `;

  // 2. Ad Groups
  const adGroupQuery = `
    SELECT 
      ad_group.id, 
      ad_group.name, 
      ad_group.status,
      campaign.id,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions
    FROM ad_group 
    WHERE segments.date BETWEEN '${since}' AND '${until}'
  `;

  // 3. Ads
  const adQuery = `
    SELECT 
      ad_group_ad.ad.id, 
      ad_group_ad.ad.name, 
      ad_group_ad.status,
      ad_group.id,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions
    FROM ad_group_ad 
    WHERE segments.date BETWEEN '${since}' AND '${until}'
  `;

  const [campaignsRes, adGroupsRes, adsRes] = await Promise.all([
    googleAdsRequest(customerId, campaignQuery, accessToken!),
    googleAdsRequest(customerId, adGroupQuery, accessToken!),
    googleAdsRequest(customerId, adQuery, accessToken!)
  ]);

  // Transform to Hierarchy
  // ... (Implementation of mapping similar to metaService)
  // This needs to return CampaignHierarchy[]

  // Placeholder for full mapping logic
  return mapGoogleDataToHierarchy(campaignsRes, adGroupsRes, adsRes);
}

function mapGoogleDataToHierarchy(campaignsData: any, adGroupsData: any, adsData: any): any[] {
  // Helper to parse Google Rows
  const campaigns = campaignsData.results || [];
  const adGroups = adGroupsData.results || [];
  const ads = adsData.results || [];

  const hierarchy: any[] = [];
  const campaignMap = new Map<string, any>();
  const adGroupMap = new Map<string, any>();

  // Process Campaigns
  for (const row of campaigns) {
    const c = row.campaign;
    const m = row.metrics;
    const node = {
      id: String(c.id),
      name: c.name,
      type: 'campaign',
      status: c.status.toLowerCase(), // ENABLED, PAUSED, REMOVED -> active, paused, completed
      data: { stage1: 0, stage2: 0, stage3: 0, stage4: 0, stage5: 0 },
      spend: (Number(m.costMicros) || 0) / 1000000,
      roas: 0,
      revenue: 0,
      metaLeads: Number(m.conversions) || 0,
      children: []
    };
    campaignMap.set(node.id, node);
    hierarchy.push(node);
  }

  // Process Ad Groups
  for (const row of adGroups) {
    const ag = row.adGroup;
    const m = row.metrics;
    const campId = String(row.campaign.id);
    const parent = campaignMap.get(campId);

    if (parent) {
      const node = {
        id: String(ag.id),
        name: ag.name,
        type: 'adset', // Mapping AdGroup to AdSet for consistency
        status: ag.status.toLowerCase(),
        data: { stage1: 0, stage2: 0, stage3: 0, stage4: 0, stage5: 0 },
        spend: (Number(m.costMicros) || 0) / 1000000,
        roas: 0,
        revenue: 0,
        metaLeads: Number(m.conversions) || 0,
        children: []
      };
      adGroupMap.set(node.id, node);
      parent.children.push(node);
    }
  }

  // Process Ads
  for (const row of ads) {
    const ad = row.adGroupAd.ad;
    const status = row.adGroupAd.status;
    const m = row.metrics;
    const agId = String(row.adGroup.id);
    const parent = adGroupMap.get(agId);

    if (parent) {
      const node = {
        id: String(ad.id),
        name: ad.name || `Ad ${ad.id}`,
        type: 'ad',
        status: status.toLowerCase(),
        data: { stage1: 0, stage2: 0, stage3: 0, stage4: 0, stage5: 0 },
        spend: (Number(m.costMicros) || 0) / 1000000,
        roas: 0,
        revenue: 0,
        metaLeads: Number(m.conversions) || 0,
      };
      parent.children.push(node);
    }
  }

  return hierarchy;
}
