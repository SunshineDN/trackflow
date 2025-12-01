"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Link, Facebook } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IntegrationCard } from '@/components/IntegrationCard';
import { KommoConfigModal } from '@/components/KommoConfigModal';
import { useToast } from '@/contexts/ToastContext';

export default function IntegrationsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isKommoModalOpen, setIsKommoModalOpen] = useState(false);
  const [kommoStatus, setKommoStatus] = useState(false);

  useEffect(() => {
    fetchKommoStatus();
  }, []);

  const fetchKommoStatus = async () => {
    try {
      const res = await fetch('/api/integrations/kommo');
      if (res.ok) {
        const data = await res.json();
        setKommoStatus(data.isActive);
      }
    } catch (error) {
      console.error("Erro ao verificar status Kommo:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Integrações</h1>
            <p className="text-muted-foreground">Gerencie suas conexões com plataformas externas.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Kommo CRM */}
          <IntegrationCard
            name="Kommo CRM"
            description="Sincronize leads e etapas do funil de vendas automaticamente."
            icon={<Link size={24} className="text-blue-500" />}
            isActive={kommoStatus}
            onConfigure={() => setIsKommoModalOpen(true)}
          />

          {/* Meta Ads (Placeholder for now, as it's handled via NextAuth/Env) */}
          <IntegrationCard
            name="Meta Ads"
            description="Conecte sua conta de anúncios para importar campanhas e custos."
            icon={<Facebook size={24} className="text-blue-600" />}
            isActive={true} // Assuming active if they are logged in, or we could check session
            onConfigure={() => showToast("A integração com Meta é gerenciada via Login.", "success")}
          />

          {/* Future Integrations... */}
        </div>

        {/* Modals */}
        <KommoConfigModal
          isOpen={isKommoModalOpen}
          onClose={() => setIsKommoModalOpen(false)}
          onSuccess={fetchKommoStatus}
        />
      </div>
    </div>
  );
}
