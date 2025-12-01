import { AdCampaign } from "@/types";

interface KommoResponse {
  campaigns: {
    campaign: string;
    source?: string;
    totalLeads: number;
    totalRevenue: number;
    groups: {
      medium: string;
      totalLeads: number;
      totalRevenue: number;
      ads: {
        content: string;
        leadsCount: number;
        totalRevenue: number;
        journey?: Record<string, number>;
      }[];
    }[];
  }[];
}

export async function fetchKommoData(
  subdomain: string,
  journeyStages: string[],
  dateRange?: { from: Date; to: Date }
): Promise<AdCampaign[]> {
  // Construir URL com parâmetros
  const url = new URL("https://aiatende.dev.br/kommo/api/kommo-leads/aggregated-utm");
  url.searchParams.set("subdomain", subdomain);

  // Adicionar estágios da jornada como repeated params
  journeyStages.forEach(stage => {
    url.searchParams.append("lead_journey", stage);
  });

  if (dateRange) {
    const fromSeconds = Math.floor(dateRange.from.getTime() / 1000);
    // Ajustar 'to' para o final do dia se necessário, mas como vem do DateRangePicker geralmente já é tratado.
    // O DateRangePicker retorna 'to' como o dia selecionado. Se for o mesmo dia, pode ser 00:00.
    // Vamos garantir que 'to' cubra o dia inteiro se for apenas data, mas o backend que decida.
    // O user pediu apenas para passar os parametros.
    const toSeconds = Math.floor(dateRange.to.getTime() / 1000);

    url.searchParams.set("created_at_from", fromSeconds.toString());
    url.searchParams.set("created_at_to", toSeconds.toString());
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Erro ao buscar dados do Kommo: ${res.statusText}`);
  }

  const data: KommoResponse = await res.json();

  // Adaptar para AdCampaign
  const campaigns: AdCampaign[] = [];

  data.campaigns.forEach((camp, campIndex) => {
    // Inicializar acumuladores para a campanha
    const campaignTotals = {
      stage1: 0,
      stage2: 0,
      stage3: 0,
      stage4: 0,
      stage5: 0
    };

    // Iterar sobre grupos e anúncios para somar
    camp.groups.forEach((group) => {
      group.ads.forEach((ad) => {
        const journeyKeys = Object.keys(ad.journey || {});

        if (journeyKeys.length === 0 && ad.leadsCount > 0) {
          // Fallback: leadsCount vai para stage1
          campaignTotals.stage1 += ad.leadsCount;
        } else {
          // Mapeamento normal
          journeyStages.slice(0, 5).forEach((stageName, idx) => {
            const key = `stage${idx + 1}` as keyof typeof campaignTotals;
            campaignTotals[key] += ad.journey?.[stageName] || 0;
          });
        }
      });
    });

    // Adicionar a campanha agregada à lista
    campaigns.push({
      id: `kommo-camp-${campIndex}`,
      name: camp.campaign, // Nome limpo da campanha
      status: "active",
      data: {
        stage1: campaignTotals.stage1,
        stage2: campaignTotals.stage2,
        stage3: campaignTotals.stage3,
        stage4: campaignTotals.stage4,
        stage5: campaignTotals.stage5,
      },
      // Preservar estrutura original em uma propriedade extra se necessário no futuro
      // (Opcional, mas como a interface AdCampaign é estrita, não vamos adicionar agora para evitar erros de TS)
    });
  });

  return campaigns;
}

import { CampaignHierarchy } from "@/types";

export async function fetchKommoHierarchy(
  subdomain: string,
  journeyStages: string[],
  dateRange?: { from: Date; to: Date }
): Promise<CampaignHierarchy[]> {
  // Reutilizar a lógica de fetch (idealmente refatorar para uma função privada 'fetchRawKommoData')
  // Por brevidade, vou duplicar a chamada aqui ou chamar fetchKommoData se ela retornasse o raw.
  // Como fetchKommoData retorna AdCampaign, vou duplicar a chamada HTTP.

  const url = new URL("https://aiatende.dev.br/kommo/api/kommo-leads/aggregated-utm");
  url.searchParams.set("subdomain", subdomain);
  journeyStages.forEach(stage => url.searchParams.append("lead_journey", stage));

  if (dateRange) {
    const fromSeconds = Math.floor(dateRange.from.getTime() / 1000);
    const toSeconds = Math.floor(dateRange.to.getTime() / 1000);
    url.searchParams.set("created_at_from", fromSeconds.toString());
    url.searchParams.set("created_at_to", toSeconds.toString());
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(`Erro ao buscar dados do Kommo: ${res.statusText}`);

  const data: KommoResponse = await res.json();
  const hierarchy: CampaignHierarchy[] = [];

  data.campaigns.forEach((camp, campIndex) => {
    const campaignNode: CampaignHierarchy = {
      id: `kommo-camp-${campIndex}`,
      name: camp.campaign,
      type: 'campaign',
      status: 'active',
      data: { stage1: 0, stage2: 0, stage3: 0, stage4: 0, stage5: 0 },
      spend: 0,
      roas: 0,
      children: []
    };

    camp.groups.forEach((group, groupIndex) => {
      const adSetNode: CampaignHierarchy = {
        id: `kommo-adset-${campIndex}-${groupIndex}`,
        name: group.medium || "Sem Grupo",
        type: 'adset',
        status: 'active',
        data: { stage1: 0, stage2: 0, stage3: 0, stage4: 0, stage5: 0 },
        spend: 0,
        roas: 0,
        children: []
      };

      group.ads.forEach((ad, adIndex) => {
        const adNode: CampaignHierarchy = {
          id: `kommo-ad-${campIndex}-${groupIndex}-${adIndex}`,
          name: ad.content || "Anúncio Sem Nome",
          type: 'ad',
          status: 'active',
          data: { stage1: 0, stage2: 0, stage3: 0, stage4: 0, stage5: 0 },
          spend: 0,
          roas: 0
        };

        // Calcular métricas do anúncio
        const journeyKeys = Object.keys(ad.journey || {});
        if (journeyKeys.length === 0 && ad.leadsCount > 0) {
          adNode.data.stage1 = ad.leadsCount;
        } else {
          journeyStages.slice(0, 5).forEach((stageName, idx) => {
            const key = `stage${idx + 1}` as keyof typeof adNode.data;
            adNode.data[key] = ad.journey?.[stageName] || 0;
          });
        }
        // Receita do anúncio (stage5 * 100 ou totalRevenue se disponível)
        // O type diz totalRevenue, vamos usar.
        adNode.data.stage5 = ad.totalRevenue ? ad.totalRevenue / 100 : 0; // Se revenue for em centavos? Assumindo logica do frontend anterior (stage5 * 100 = revenue) -> stage5 = revenue / 100

        // Somar ao AdSet
        adSetNode.data.stage1 += adNode.data.stage1;
        adSetNode.data.stage2 += adNode.data.stage2;
        adSetNode.data.stage3 += adNode.data.stage3;
        adSetNode.data.stage4 += adNode.data.stage4;
        adSetNode.data.stage5 += adNode.data.stage5;

        adSetNode.children?.push(adNode);
      });

      // Somar à Campanha
      campaignNode.data.stage1 += adSetNode.data.stage1;
      campaignNode.data.stage2 += adSetNode.data.stage2;
      campaignNode.data.stage3 += adSetNode.data.stage3;
      campaignNode.data.stage4 += adSetNode.data.stage4;
      campaignNode.data.stage5 += adSetNode.data.stage5;

      campaignNode.children?.push(adSetNode);
    });

    hierarchy.push(campaignNode);
  });

  return hierarchy;
}
