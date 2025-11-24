import { GoogleGenAI } from "@google/genai";
import { AdCampaign } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API_KEY is missing. AI features will be disabled.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const analyzeCampaignData = async (campaigns: AdCampaign[]): Promise<string> => {
  const client = getClient();
  if (!client) return "API Key n\u00e3o configurada. Adicione sua chave para insights de IA.";

  const prompt = `
    Atue como um Gerente de Performance de M\u00eddia Paga (Meta Ads).
    Voc\u00ea est\u00e1 analisando dados reais importados via API de uma conta de an\u00fancios.
    
    O funil de convers\u00e3o \u00e9 mapeado como:
    I: Impress\u00f5es
    II: Cliques
    III: Leads
    IV: Checkout Iniciado
    V: Compras

    Dados dos An\u00fancios (JSON):
    ${JSON.stringify(campaigns.map(c => ({
      name: c.name,
      adSet: c.adSetName,
      spend: c.metrics.spend,
      impressions: c.metrics.impressions,
      clicks: c.metrics.clicks,
      leads: c.metrics.leads,
      purchases: c.metrics.purchase
    })))}

    Sua tarefa:
    1. Calcule mentalmente o CPA (Custo por Aquisi\u00e7\u00e3o) e CPL (Custo por Lead) dos top 3 an\u00fancios.
    2. Identifique o "Campe\u00e3o" (Melhor ROAS/Efici\u00eancia).
    3. Identifique um an\u00fancio que est\u00e1 "Queimando Verba" (Alto Gasto, Pouco Resultado).
    4. D\u00ea 3 recomenda\u00e7\u00f5es pr\u00e1ticas (ex: "Pausar AD03", "Escalar AD05").

    Formato: Markdown. Use negrito para m\u00e9tricas chave. Seja direto e anal\u00edtico.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    // response.text may be undefined depending on library; fallback to JSON/string
    // @ts-ignore
    return response.text || String(response);
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Erro ao conectar com a intelig\u00eancia artificial. Verifique sua conex\u00e3o ou chave de API.";
  }
};
