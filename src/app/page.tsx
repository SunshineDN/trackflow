"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { sortAlphabetically } from '@/utils/campaignSorting';
import { LayoutDashboard, BarChart3, Target, Users, Settings, Bell, ChevronDown, LogOut, TrendingUp, Calendar, User, Search, RefreshCw, Layers, Menu, X, Moon, Sun, Filter } from "lucide-react";
import { MetricSummary } from '@/types';
import { usePersistentState } from '@/hooks/usePersistentState';
import { Sidebar } from "@/components/Sidebar";
import { Select } from "@/components/ui/Select";
import { ViewManager } from "@/components/ViewManager";

import { Header } from "@/components/Header";
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { format, subDays } from 'date-fns';
import { MetricCard } from '@/components/MetricCard';
import { FunnelChart } from '@/components/FunnelChart';
import { AiInsights } from '@/components/AiInsights';
import { TrackingTable } from '@/components/TrackingTable';

type DateRange = {
    from: Date;
    to: Date;
};



const dateRangeDeserializer = (stored: string) => {
    const parsed = JSON.parse(stored);
    return {
        from: new Date(parsed.from),
        to: new Date(parsed.to),
    };
};

const HomeContent = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const { theme, toggleTheme } = useTheme();

    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);

    const [integrationConfig, setIntegrationConfig] = useState<{ isActive: boolean, journeyMap: string[] } | null>(null);



    const [goals, setGoals] = useState<any[]>([]);
    const [selectedGoalType, setSelectedGoalType] = usePersistentState<'ROAS' | 'CPA' | 'REVENUE'>('dashboard_selectedGoalType', 'ROAS');

    const [currentColumns, setCurrentColumns] = usePersistentState<string[]>('dashboard_columns', [
        'name', 'evaluation', 'status', 'spend', 'stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'revenue', 'roas', 'results'
    ]);

    const [metaJourneyMap, setMetaJourneyMap] = useState<string[]>([]);

    // Fetch Goals
    useEffect(() => {
        const loadGoals = () => {
            if (status === "authenticated") {
                fetch('/api/goals')
                    .then(res => {
                        if (!res.ok) throw new Error("Falha ao buscar metas");
                        return res.json();
                    })
                    .then(data => {
                        if (Array.isArray(data)) {
                            setGoals(data);
                        } else {
                            console.error("Metas retornaram formato inválido:", data);
                            setGoals([]);
                        }
                    })
                    .catch(err => console.error("Erro ao buscar metas:", err));
            }
        };

        loadGoals();

        window.addEventListener('focus', loadGoals);
        return () => window.removeEventListener('focus', loadGoals);
    }, [status]);

    // Persist Data Source
    const [dataSource, setDataSource] = usePersistentState<'KOMMO' | 'META' | 'HYBRID'>('dashboard_dataSource', 'KOMMO');

    // Persist Date Range
    const [dateRange, setDateRange] = usePersistentState<DateRange>(
        'dashboard_dateRange',
        {
            from: subDays(new Date(), 30),
            to: new Date(),
        },
        dateRangeDeserializer
    );

    const toRoman = (num: number): string => {
        const map: { [key: number]: string } = {
            1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
            6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
            11: 'XI', 12: 'XII'
        };
        return map[num] || num.toString();
    };

    const fetchKommoDashboardData = async (journeyMap: string[]) => {
        if (!selectedAccount) return;
        setIsLoadingData(true);
        try {
            const since = dateRange.from.toISOString();
            const until = dateRange.to.toISOString();
            const sinceLocal = format(dateRange.from, 'yyyy-MM-dd');
            const untilLocal = format(dateRange.to, 'yyyy-MM-dd');

            const res = await fetch(`/api/integrations/kommo/data?since=${since}&until=${until}&sinceLocal=${sinceLocal}&untilLocal=${untilLocal}&targetAccountId=${selectedAccount.id}&source=${dataSource}`);
            if (res.ok) {
                const data = await res.json();
                const campaigns = data.campaigns;

                setCampaigns(campaigns);
                if (campaigns.length > 0 && !selectedCampaignId) {
                    setSelectedCampaignId(campaigns[0].id);
                }

                // Filter for "Integration Only" metrics (Stages & Revenue)
                const integratedCampaigns = campaigns.filter((c: any) => !c.isOrphan);

                // Investment includes ALL campaigns (Integrated + Orphans)
                const totalSpend = campaigns.reduce((acc: number, c: any) => acc + (c.spend || 0), 0);

                // Revenue comes ONLY from Integrated campaigns
                const totalRevenue = integratedCampaigns.reduce((acc: number, c: any) => acc + (c.revenue || 0), 0);

                const totalROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

                const stageTotals = [
                    integratedCampaigns.reduce((acc: number, c: any) => acc + c.data.stage1, 0),
                    integratedCampaigns.reduce((acc: number, c: any) => acc + c.data.stage2, 0),
                    integratedCampaigns.reduce((acc: number, c: any) => acc + c.data.stage3, 0),
                    integratedCampaigns.reduce((acc: number, c: any) => acc + c.data.stage4, 0),
                    integratedCampaigns.reduce((acc: number, c: any) => acc + c.data.stage5, 0),
                ];

                const baseMetrics: MetricSummary[] = journeyMap.map((label, index) => {
                    const value = stageTotals[index];
                    const stage1Value = stageTotals[0];
                    const percentage = stage1Value > 0 ? (value / stage1Value) * 100 : 0;

                    return {
                        label: label || `Etapa ${index + 1}`,
                        value: value.toLocaleString('pt-BR'),
                        percentage: `${percentage.toFixed(2)}%`,
                        trend: "neutral",
                        icon: ["Users", "Filter", "CheckCircle", "Target", "Award"][index] || "Activity"
                    };
                });

                baseMetrics.push({
                    label: "Receita Total",
                    value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    percentage: "",
                    trend: "neutral",
                    icon: "DollarSign"
                });

                if (dataSource === 'HYBRID') {
                    baseMetrics.push({
                        label: "Investimento Total",
                        value: `R$ ${totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        percentage: "",
                        trend: "neutral",
                        icon: "DollarSign"
                    });
                    baseMetrics.push({
                        label: "ROAS Geral",
                        value: `${totalROAS.toFixed(2)}x`,
                        percentage: "",
                        trend: "neutral",
                        icon: "TrendingUp"
                    });
                }

                setMetrics(baseMetrics);
            }
        } catch (error) {
            console.error("Erro ao buscar dados Kommo:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const fetchMetaDashboardData = async () => {
        const adAccount = selectedAccount?.metaAdAccounts?.[0];

        if (!adAccount?.adAccountId) {
            setIsLoadingData(false);
            return;
        }
        setIsLoadingData(true);
        try {
            const since = format(dateRange.from, 'yyyy-MM-dd');
            const until = format(dateRange.to, 'yyyy-MM-dd');

            const res = await fetch(`/api/meta/${adAccount.adAccountId}/report/campaigns?since=${since}&until=${until}`);
            if (res.ok) {
                const data = await res.json();
                // API now returns formatted campaigns from fetchMetaCampaigns service
                const formattedCampaigns = data.campaigns;

                setCampaigns(formattedCampaigns);
                if (formattedCampaigns.length > 0 && !selectedCampaignId) {
                    setSelectedCampaignId(formattedCampaigns[0].id);
                }

                const totalSpend = formattedCampaigns.reduce((acc: number, c: any) => acc + (c.spend || 0), 0);

                // Calculate totals for each stage dynamically
                const stageTotals = [
                    formattedCampaigns.reduce((acc: number, c: any) => acc + (c.data?.stage1 || 0), 0),
                    formattedCampaigns.reduce((acc: number, c: any) => acc + (c.data?.stage2 || 0), 0),
                    formattedCampaigns.reduce((acc: number, c: any) => acc + (c.data?.stage3 || 0), 0),
                    formattedCampaigns.reduce((acc: number, c: any) => acc + (c.data?.stage4 || 0), 0),
                    formattedCampaigns.reduce((acc: number, c: any) => acc + (c.data?.stage5 || 0), 0),
                ];

                const metricLabels: { [key: string]: string } = {
                    impressions: "Impressões",
                    clicks: "Cliques",
                    leads: "Leads",
                    reach: "Alcance",
                    results: "Resultados"
                };

                const baseMetrics: MetricSummary[] = metaJourneyMap.map((metricKey, index) => {
                    const value = stageTotals[index];
                    const firstStageValue = stageTotals[0];
                    // Calculate percentage relative to the first stage (Impressions/Reach usually)
                    const percentage = firstStageValue > 0 ? (value / firstStageValue) * 100 : 0;

                    return {
                        label: metricLabels[metricKey] || metricKey,
                        value: value.toLocaleString('pt-BR'),
                        percentage: index === 0 ? "100%" : `${percentage.toFixed(2)}%`,
                        trend: "neutral",
                        icon: ["Eye", "MousePointer", "Users", "Target", "Award"][index] || "Activity"
                    };
                });

                // Always add Total Spend at the end
                baseMetrics.push({
                    label: "Investimento Total",
                    value: `R$ ${totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    percentage: "",
                    trend: "neutral",
                    icon: "DollarSign"
                });

                setMetrics(baseMetrics);
            }
        } catch (error) {
            console.error("Erro ao buscar dados Meta:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const checkIntegrationAndFetch = async () => {
        if (!selectedAccount) return;
        setIsLoadingData(true);

        // 1. Verificar status da integração Kommo
        let isKommoActive = false;
        let journeyMap: string[] = [];

        try {
            const res = await fetch(`/api/integrations/kommo?targetAccountId=${selectedAccount.id}`);
            if (res.ok) {
                const config = await res.json();
                if (config.isActive) {
                    isKommoActive = true;
                    journeyMap = config.journeyMap;
                    setIntegrationConfig({ isActive: true, journeyMap: config.journeyMap });
                } else {
                    setIntegrationConfig(null);
                }
            }
        } catch (e) {
            console.error("Erro ao verificar integração:", e);
            setIntegrationConfig(null);
        }

        // 2. Decidir qual dado buscar
        if (dataSource === 'META' || dataSource === 'HYBRID') {
            // Fetch Meta Config for Labels (Needed for Hybrid too now)
            try {
                const res = await fetch(`/api/integrations/meta/config`);
                if (res.ok) {
                    const config = await res.json();
                    if (config.journeyMap) {
                        if (dataSource === 'META') {
                            setIntegrationConfig({ isActive: true, journeyMap: config.journeyMap });
                        }
                        setMetaJourneyMap(config.journeyMap);
                    }
                }
            } catch (e) {
                console.error("Erro ao buscar config Meta:", e);
            }

            if (dataSource === 'META') {
                fetchMetaDashboardData();
            } else if (isKommoActive) {
                fetchKommoDashboardData(journeyMap);
            } else {
                // Fallback if Hybrid but Kommo inactive
                setDataSource('META');
                setSelectedCampaignId(null);
                return;
            }
        } else if (isKommoActive) {
            fetchKommoDashboardData(journeyMap);
        } else {
            // Se Kommo inativo e selecionado Kommo -> Fallback para Meta
            setDataSource('META');
            setSelectedCampaignId(null);
            return; // O useEffect vai rodar novamente com dataSource='META'
        }
    };

    useEffect(() => {
        if (searchParams.get('integration_success') === 'true') {
            showToast("Integração concluída! Dados capturados com sucesso.", "success");
            router.replace('/');
        }
    }, [searchParams, router, showToast]);

    // Fetch Accounts
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        } else if (status === "authenticated") {
            // Client-side enforcement of profile completion
            if (session?.user && !session.user.isProfileComplete) {
                console.log("[DASHBOARD] Profile incomplete, forcing redirect...");
                window.location.href = "/auth/complete-profile";
                return;
            }

            fetch('/api/accounts')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setAvailableAccounts(data);
                        // Default to own account if not set or if current selection is invalid
                        if (!selectedAccount || !data.find(a => a.id === selectedAccount.id)) {
                            const ownAccount = data.find(a => a.id === session.user.clientId);
                            setSelectedAccount(ownAccount || data[0]);
                        }
                    }
                })
                .catch(err => console.error("Erro ao buscar contas:", err));
        }
    }, [status, session, router]);

    useEffect(() => {
        if (status === "authenticated" && selectedAccount) {
            checkIntegrationAndFetch();
        }
    }, [status, session, selectedAccount, dateRange, dataSource]);





    const filteredCampaigns = campaigns
        .filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
        .sort(sortAlphabetically);

    if (status === "loading") {
        return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
    }

    if (!session) {
        return null;
    }

    // Guard: Do not render dashboard if profile is incomplete
    if (session.user && !session.user.isProfileComplete) {
        return <div className="flex items-center justify-center min-h-screen">Redirecionando para completar perfil...</div>;
    }

    return (
        <div className="flex h-screen bg-background text-foreground font-sans transition-colors duration-300">
            {/* Sidebar Component */}
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                currentAccount={selectedAccount || { id: session.user.clientId, name: session.user.name, image: session.user.image }}
                availableAccounts={availableAccounts.length > 0 ? availableAccounts : [{ id: session.user.clientId, name: session.user.name, image: session.user.image }]}
                onAccountChange={(id) => {
                    const account = availableAccounts.find(a => a.id === id);
                    if (account) setSelectedAccount(account);
                }}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen relative overflow-x-hidden">
                {/* Header */}
                <Header
                    session={session}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onSyncSuccess={() => {
                        if (selectedAccount) checkIntegrationAndFetch();
                    }}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-background">
                    <section className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
                                <p className="text-sm text-muted-foreground">Visão geral do desempenho das suas campanhas.</p>
                            </div>

                            {/* Data Source Selector - Hero Position */}
                            {(() => {
                                const options = [];

                                // 1. Meta (Always first if available)
                                if (selectedAccount?.metaAdAccounts?.length > 0) {
                                    options.push({ value: 'META', label: 'Meta', icon: <LayoutDashboard size={16} /> });
                                }

                                // 2. Integrations (Kommo)
                                if (integrationConfig?.isActive) {
                                    options.push({ value: 'KOMMO', label: 'Kommo', icon: <Filter size={16} /> });
                                }

                                // 3. Hybrid (If both available)
                                if (selectedAccount?.metaAdAccounts?.length > 0 && integrationConfig?.isActive) {
                                    options.push({ value: 'HYBRID', label: 'Kommo + Meta', icon: <TrendingUp size={16} /> });
                                }

                                if (options.length === 0) return null;

                                return (
                                    <div className="w-48">
                                        <Select
                                            options={options}
                                            value={dataSource}
                                            onChange={(val) => {
                                                setDataSource(val as any);
                                                setSelectedCampaignId(null);
                                            }}
                                            placeholder="Fonte de Dados"
                                        />
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {isLoadingData ? (
                                [...Array(4)].map((_, i) => (
                                    <MetricCard key={i} metric={{ label: '', value: '', percentage: '', trend: 'neutral' }} loading={true} />
                                ))
                            ) : (
                                metrics.map((metric, index) => (
                                    <MetricCard key={index} metric={metric} />
                                ))
                            )}
                            {metrics.length === 0 && !isLoadingData && (
                                <div className="col-span-4 text-center py-8 text-muted-foreground">
                                    Nenhuma métrica disponível. Vincule uma conta de anúncios e sincronize os dados.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Middle Section: Chart & AI */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 min-w-0">
                            <FunnelChart
                                data={filteredCampaigns}
                                selectedId={selectedCampaignId}
                                journeyLabels={integrationConfig?.journeyMap}
                                loading={isLoadingData}
                            />
                        </div>
                        <div className="lg:col-span-1 min-w-0">
                            <AiInsights campaigns={filteredCampaigns} loading={isLoadingData} />
                        </div>
                    </section>





                    {/* Main Table */}
                    <section>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-bold text-foreground">Rastreamento de Campanhas</h2>

                                {/* Goal Selector for Evaluation */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Avaliar por:</span>
                                    <div className="w-32">
                                        <Select
                                            options={[
                                                { value: 'ROAS', label: 'ROAS' },
                                                { value: 'REVENUE', label: 'Receita' },
                                                ...(integrationConfig?.journeyMap || []).map((stage, index) => ({
                                                    value: `CPA_${index}`,
                                                    label: `CPA - ${stage}`
                                                }))
                                            ]}
                                            value={selectedGoalType}
                                            onChange={(val) => setSelectedGoalType(val as any)}
                                            placeholder="Meta"
                                        />
                                    </div>
                                </div>

                                {/* View Manager */}
                                <ViewManager
                                    dataSource={dataSource}
                                    availableColumns={[
                                        { key: 'name', label: 'Campanha' },
                                        { key: 'evaluation', label: 'Avaliação' },
                                        { key: 'status', label: 'Status' },
                                        { key: 'spend', label: 'Investimento' },
                                        { key: 'revenue', label: 'Receita' },
                                        { key: 'roas', label: 'ROAS' },
                                        { key: 'results', label: 'Resultados' },
                                        { key: 'results', label: 'Resultados' },
                                        ...(dataSource !== 'META' ? [{ key: 'ghostLeads', label: 'Leads Fantasmas' }] : []),
                                        ...((integrationConfig?.journeyMap || ['Etapa 1', 'Etapa 2', 'Etapa 3', 'Etapa 4', 'Etapa 5']).map((label, i) => ({
                                            key: `stage${i + 1}`,
                                            label: label
                                        })))
                                    ]}
                                    currentColumns={currentColumns}
                                    onColumnsChange={setCurrentColumns}
                                />
                            </div>

                            <div className="flex gap-2 flex-wrap justify-end">
                                {/* Legenda dinâmica */}
                                {(dataSource === 'META' ? (integrationConfig?.journeyMap || ["Impressões", "Cliques", "Leads", "-", "-"]) : (integrationConfig?.journeyMap || ["Impressões / Alcance", "Cliques / Interesse", "Leads / Cadastro", "Checkout Iniciado", "Compra Realizada"])).map((label, idx) => (
                                    <div
                                        key={idx}
                                        className={`hidden md:flex items-center px-3 py-1 rounded-lg border ${idx === 0 ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                            idx === 1 ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" :
                                                idx === 2 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                    idx === 3 ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                                        "bg-red-500/10 text-red-500 border-red-500/20"
                                            }`}
                                    >
                                        <span className="text-xs font-bold mr-2 opacity-75">{['I', 'II', 'III', 'IV', 'V'][idx]}</span>
                                        <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {dataSource === 'HYBRID' ? (
                            <>
                                <div className="mb-8">
                                    <h3 className="text-md font-semibold text-muted-foreground mb-2">Campanhas Integradas</h3>
                                    <TrackingTable
                                        data={filteredCampaigns.filter(c => !c.isOrphan)}
                                        onSelect={setSelectedCampaignId}
                                        selectedId={selectedCampaignId}
                                        journeyLabels={integrationConfig?.journeyMap}
                                        dataSource={dataSource}
                                        loading={isLoadingData}
                                        goals={goals}
                                        selectedGoalType={selectedGoalType}
                                        columns={currentColumns}
                                        onColumnsReorder={setCurrentColumns}
                                        metaResultLabel={metaJourneyMap[metaJourneyMap.length - 1]}
                                    />
                                </div>

                                {filteredCampaigns.some(c => c.isOrphan) && (
                                    <div>
                                        <h3 className="text-md font-semibold text-muted-foreground mb-2">Campanhas Adicionais (Apenas Meta)</h3>
                                        <TrackingTable
                                            data={filteredCampaigns.filter(c => c.isOrphan)}
                                            onSelect={setSelectedCampaignId}
                                            selectedId={selectedCampaignId}
                                            journeyLabels={undefined} // Meta orphans in hybrid mode don't have configured labels passed yet, or we could fetch them. For now leaving undefined to use defaults or we need to fetch Meta config separately for Hybrid.
                                            dataSource="META"
                                            loading={isLoadingData}
                                            goals={goals}
                                            selectedGoalType={selectedGoalType}
                                            columns={currentColumns}
                                            onColumnsReorder={setCurrentColumns}
                                            metaResultLabel={metaJourneyMap[metaJourneyMap.length - 1]}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <TrackingTable
                                data={filteredCampaigns}
                                onSelect={setSelectedCampaignId}
                                selectedId={selectedCampaignId}
                                journeyLabels={integrationConfig?.journeyMap}
                                dataSource={dataSource}
                                loading={isLoadingData}
                                goals={goals}
                                selectedGoalType={selectedGoalType}
                                columns={currentColumns}
                                onColumnsReorder={setCurrentColumns}
                                metaResultLabel={metaJourneyMap[metaJourneyMap.length - 1]}
                            />
                        )}
                    </section>

                </div>
            </main >
        </div >
    );
};

const Home = () => {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
            <HomeContent />
        </Suspense>
    );
};

export default Home;
