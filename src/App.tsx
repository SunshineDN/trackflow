import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminClients from './components/AdminClients';
import { LayoutGrid, BarChart3, Settings, Bell, Search, RefreshCw, Database, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from './services/authService';
import { useAuth } from './contexts/AuthContext';
import { MOCK_CAMPAIGNS, MOCK_METRICS, STAGE_DESCRIPTIONS } from './constants';
import { MetricCard } from './components/MetricCard';
import { TrackingTable } from './components/TrackingTable';
import { FunnelChart } from './components/FunnelChart';
import { AiInsights } from './components/AiInsights';

const App = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(MOCK_CAMPAIGNS[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('12 min atrás');

  const filteredCampaigns = MOCK_CAMPAIGNS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate API call to backend sync route
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced('Agora mesmo');
    }, 2000);
  };

  // on app mount, if token or cookie present, go to home, else go to login
  useEffect(() => {
    // token from context will be present if user logged in or cookie exists
    if (token) {
      navigate('/');
    } else {
      navigate('/login');
    }
    // only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function Dashboard() {
  const navigate = useNavigate();
  const { client, clearAuth: clearAuthCtx } = useAuth();
    return (
      <div className="min-h-screen bg-white flex text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-slate-100 flex flex-col sticky top-0 h-screen bg-white z-20 hidden md:flex">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-slate-100">
          <div className="w-8 h-8 bg-brand-400 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-200">
            T
          </div>
          <span className="ml-3 font-bold text-xl tracking-tight hidden lg:block">TrackFlow</span>
        </div>
        
        <div className="px-4 py-6 hidden lg:block">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Cliente Ativo</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">A</div>
              <span className="text-sm font-semibold text-slate-700">Acme Corp</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {/* Use Link for internal navigation */}
          {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
          <>
            <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 text-brand-600 font-medium">
              <LayoutGrid size={20} />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
            <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <BarChart3 size={20} />
              <span className="hidden lg:block">Relatórios</span>
            </Link>
            <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Layers size={20} />
              <span className="hidden lg:block">Integrações</span>
            </Link>
            <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Settings size={20} />
              <span className="hidden lg:block">Configurações</span>
            </Link>
            {client?.role === 'ADMIN' && (
              <Link to="/admin/clients" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <Database size={20} />
                <span className="hidden lg:block">Gerenciar Clientes</span>
              </Link>
            )}
          </>
        </nav>

        <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-xl hidden lg:block">
                <div className="flex items-center justify-between mb-2">
                   <p className="text-xs font-semibold text-slate-500">Meta Ads API</p>
                   <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                </div>
                <p className="text-[10px] text-slate-400">Sync automático ativo</p>
            </div>
        </div>
  </aside>

  {/* Main Content */}
  <main className="flex-1 flex flex-col max-w-full overflow-hidden">
        
        {/* Header */}
        <header className="h-20 border-b border-slate-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4 lg:hidden">
                 <div className="w-8 h-8 bg-brand-400 rounded-lg flex items-center justify-center text-white font-bold">T</div>
            </div>
            
            <div className="flex-1 max-w-md mx-4 hidden sm:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por campanha, adset ou anúncio..." 
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-50 border-none focus:ring-2 focus:ring-brand-200 text-sm placeholder-slate-400 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <Database size={12} className="mr-2" />
                  Último sync: {lastSynced}
                </div>
                
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all disabled:opacity-50 disabled:animate-spin"
                >
                    <RefreshCw size={20} />
                </button>
                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                {/* User / Logout */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-sm text-slate-700 font-medium">{/* client name */}
                    {client?.name ?? 'Usuário'}
                  </div>
                  <button onClick={() => { clearAuthCtx(); navigate('/login'); }} className="text-sm text-slate-500 hover:text-red-600">Sair</button>
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer">
                      <img src={"https://ui-avatars.com/api/?name=" + encodeURIComponent((localStorage.getItem('tf_client') ? JSON.parse(localStorage.getItem('tf_client') as string).name : 'Usuário')) + "&background=0D8ABC&color=fff"} alt="User" className="w-full h-full object-cover" />
                  </div>
                </div>
            </div>
        </header>

  {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            
            {/* Metrics Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_METRICS.map((metric, index) => (
                    <MetricCard key={index} metric={metric} />
                ))}
            </section>

            {/* Middle Section: Chart & AI */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <FunnelChart data={filteredCampaigns} selectedId={selectedCampaignId} />
                </div>
                <div className="lg:col-span-1">
                    <AiInsights campaigns={filteredCampaigns} />
                </div>
            </section>

            {/* Main Table */}
            <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Performance de Anúncios</h2>
                        <p className="text-sm text-slate-500 mt-1">Dados consolidados da Meta Marketing API</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {Object.entries(STAGE_DESCRIPTIONS).map(([key, label]) => (
                            <div key={key} className="flex-shrink-0 flex items-center px-3 py-1 rounded-lg bg-white border border-slate-100 shadow-sm">
                                <span className="text-xs font-bold text-brand-500 mr-2">{key}</span>
                                <span className="text-xs text-slate-600">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <TrackingTable 
                    data={filteredCampaigns} 
                    selectedId={selectedCampaignId}
                    onSelect={setSelectedCampaignId}
                />
            </section>

        </div>
      </main>
    </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/admin/clients" element={<AdminRoute><AdminClients /></AdminRoute>} />
    </Routes>
  );
};

export default App;
