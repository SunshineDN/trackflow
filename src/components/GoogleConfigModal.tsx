import React, { useEffect, useState } from 'react';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GoogleConfigModal({ isOpen, onClose, onSuccess }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ isConnected: boolean; account?: { customerId: string; name: string } } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/google/status');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error(error);
      showToast("Erro ao carregar status", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to Auth URL
    window.location.href = '/api/google/auth';
  };

  const handleDisconnect = async () => {
    if (!confirm("Tem certeza que deseja desconectar?")) return;

    setLoading(true);
    try {
      const res = await fetch('/api/google/status', { method: 'DELETE' });
      if (res.ok) {
        showToast("Desconectado com sucesso", "success");
        fetchStatus();
        onSuccess();
      } else {
        showToast("Erro ao desconectar", "error");
      }
    } catch (error) {
      showToast("Erro ao desconectar", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Configurar Google Ads</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading && !status ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-brand-500" size={32} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-secondary/20">
              {status?.isConnected ? (
                <>
                  <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                    <Check size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-green-500 mb-1">Conectado</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Conta: {status.account?.name} <br />
                    ID: {status.account?.customerId}
                  </p>
                  <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    {loading ? 'Processando...' : 'Desconectar'}
                  </button>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Não Conectado</h3>
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    Conecte sua conta do Google Ads para importar campanhas e métricas.
                  </p>
                  <button
                    onClick={handleConnect}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Conectar Google Ads
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
