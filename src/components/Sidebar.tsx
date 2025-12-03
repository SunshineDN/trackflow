"use client";

import { useSession } from "next-auth/react";
import { LayoutDashboard, BarChart3, Target, Users, Settings, TrendingUp, X, Share2, UserCircle } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: any; // Replace with proper type
  availableAccounts: any[]; // Replace with proper type
  onAccountChange: (accountId: string) => void;
}

export const Sidebar = ({ isOpen, onClose, currentAccount, availableAccounts, onAccountChange }: SidebarProps) => {
  const { data: session } = useSession();

  if (!session) return null;

  const accountOptions = availableAccounts.map(acc => ({
    value: acc.id,
    label: acc.name,
    icon: <UserCircle size={16} />
  }));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border text-card-foreground flex flex-col shadow-xl glass shrink-0 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">TrackFlow</span>
          </div>
          <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        {/* Account Selector */}
        <div className="px-4 pt-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
            Conta
          </div>
          <Select
            options={accountOptions}
            value={currentAccount?.id || ""}
            onChange={onAccountChange}
            placeholder="Selecione a conta"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 mt-4">
            Analytics
          </div>

          <a href="/" className="flex items-center gap-3 px-3 py-2.5 bg-brand-600/10 text-brand-400 rounded-lg border border-brand-600/20 transition-all group">
            <BarChart3 size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Dashboard Geral</span>
          </a>

          <a href="/campaigns" className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent hover:text-accent-foreground rounded-lg transition-all group">
            <Target size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Campanhas</span>
          </a>

          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent hover:text-accent-foreground rounded-lg transition-all group">
            <Users size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Públicos</span>
          </a>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 mt-8">
            Configurações
          </div>

          <a href="/integrations" className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent hover:text-accent-foreground rounded-lg transition-all group">
            <Settings size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Integrações</span>
          </a>

          <a href="/sharing" className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent hover:text-accent-foreground rounded-lg transition-all group">
            <Share2 size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Compartilhamento</span>
          </a>

          {session.user.role === "ADMIN" && (
            <a
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent hover:text-accent-foreground rounded-lg transition-all group mt-2"
            >
              <Users size={18} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Gestão de Usuários</span>
            </a>
          )}
        </nav>

        {/* Footer / Meta Card */}
        <div className="p-4 border-t border-border">
          <div className="bg-card/50 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-brand-500/20 rounded-lg">
                <TrendingUp size={16} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Meta Diária</p>
                <p className="text-sm font-bold text-foreground">85% Atingida</p>
              </div>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div className="bg-brand-500 h-1.5 rounded-full w-[85%] shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
