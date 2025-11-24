import React, { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Client } from '../services/authService';
import { Plus, Trash2, Edit2, Search as SearchIcon } from 'lucide-react';

const Modal: React.FC<{ title: string; open: boolean; onClose: () => void; children: React.ReactNode; initialFocusId?: string }> = ({ title, open, onClose, children, initialFocusId }) => {
  // accessibility: trap basic focus to first input and close on Esc
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // focus initial element
    if (initialFocusId) {
      const el = document.getElementById(initialFocusId) as HTMLElement | null;
      if (el) el.focus();
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 id="modal-title" className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">Fechar</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export const AdminClients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [announcement, setAnnouncement] = useState('')
  // campos de meta-account opcionais no create modal
  const [createMeta, setCreateMeta] = useState(false)
  const [createMetaForm, setCreateMetaForm] = useState({ adAccountId: '', name: '', accessToken: '', status: 'active' })
  // editar cliente
  const [editingClient, setEditingClient] = useState<any | null>(null)
  const [showEditClient, setShowEditClient] = useState(false)

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await adminService.listClients();
      setClients(res.clients || []);
    } catch (err: any) {
      setError(err?.error || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCreating(true);
    try {
      const res = await adminService.createClient({ name, email, role });
      const created = res.client || res;
      // if meta-account fields were filled, create meta account
      const shouldCreateMeta = createMeta && createMetaForm.adAccountId && createMetaForm.accessToken;
      if (shouldCreateMeta) {
        await adminService.addMetaAccount(created.id, createMetaForm);
      }
      setName(''); setEmail(''); setRole('MEMBER');
      setCreateMeta(false);
      setCreateMetaForm({ adAccountId: '', name: '', accessToken: '', status: 'active' });
      setShowCreate(false);
      fetchClients();
    } catch (err: any) {
      setError(err?.error || String(err));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover cliente?')) return;
    try {
      await adminService.deleteClient(id);
      fetchClients();
    } catch (err: any) {
      setError(err?.error || String(err));
    }
  };

  const handleEditClient = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingClient) return;
    try {
      await adminService.updateClient(editingClient.id, { name: editingClient.name, email: editingClient.email, role: editingClient.role });
      setShowEditClient(false);
      setEditingClient(null);
      setAnnouncement('Cliente atualizado com sucesso.');
      fetchClients();
    } catch (err: any) {
      const msg = err?.error || String(err);
      setError(msg);
      setAnnouncement(msg);
    }
  };

  // open edit client by fetching full details (including metaAdAccounts)
  const openEditClient = async (clientId: string) => {
    try {
      const res = await adminService.getClient(clientId);
      const client = res.client || res;
      setEditingClient(client);
      // se o cliente traz uma metaAdAccount, preencha o formulário inline
      if (client.metaAdAccount) {
        const acc = client.metaAdAccount;
        setInlineAccountForm({
          adAccountId: acc.adAccountId || '',
          name: acc.name || '',
          accessToken: acc.accessToken || '',
          status: acc.status || 'active',
          id: acc.id || '',
        });
        // abrir o editor inline já preenchido
        setEditingAccount({ ...acc });
        setEditingAccountInline(true);
      } else {
        setInlineAccountForm({ adAccountId: '', name: '', accessToken: '', status: 'active', id: '' });
        setEditingAccount(null);
        setEditingAccountInline(false);
      }
      setShowEditClient(true);
    } catch (err: any) {
      const msg = err?.error || String(err);
      setError(msg);
      setAnnouncement(msg);
    }
  };

  // details drawer
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({ adAccountId: '', name: '', accessToken: '', status: 'active' });
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  // inline add/edit dentro do modal de edição do cliente
  const [showAddAccountInline, setShowAddAccountInline] = useState(false);
  const [editingAccountInline, setEditingAccountInline] = useState(false);
  const [inlineAccountForm, setInlineAccountForm] = useState({ adAccountId: '', name: '', accessToken: '', status: 'active', id: '' });

  const openDetails = async (clientId: string) => {
    setDetailsLoading(true);
    try {
      const res = await adminService.getClient(clientId);
      setActiveClient(res.client || null);
    } catch (err: any) {
      const msg = err?.error || String(err);
      setError(msg);
      setAnnouncement(msg);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setActiveClient(null);
    setAnnouncement('')
  };

  const handleAddAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clientId = activeClient?.id || editingClient?.id || null;
    if (!clientId) {
      const msg = 'Client id not found';
      setError(msg);
      setAnnouncement(msg);
      return;
    }
    try {
      await adminService.addMetaAccount(clientId, accountForm);
      // refresh context where needed
      if (activeClient?.id === clientId) await openDetails(clientId);
      if (editingClient?.id === clientId) {
        const res = await adminService.getClient(clientId);
        setEditingClient(res.client || res);
      }
      setShowAddAccount(false);
      setAccountForm({ adAccountId: '', name: '', accessToken: '', status: 'active' });
      setAnnouncement('Conta adicionada com sucesso.');
    } catch (err: any) {
      const msg = err?.error || String(err);
      setError(msg);
      setAnnouncement(msg);
    }
  };

  const handleDeleteAccount = async (aid: string) => {
    const clientId = activeClient?.id || editingClient?.id || null;
    if (!clientId) return;
    if (!confirm('Remover conta de anúncios?')) return;
    try {
      await adminService.deleteMetaAccount(clientId, aid);
      // refresh context where needed
      if (activeClient?.id === clientId) await openDetails(clientId);
      if (editingClient?.id === clientId) {
        const res = await adminService.getClient(clientId);
        setEditingClient(res.client || res);
      }
      setAnnouncement('Conta removida com sucesso.');
    } catch (err: any) {
      const msg = err?.error || String(err);
      setError(msg);
      setAnnouncement(msg);
    }
  };

  const openEditAccount = (acc: any) => {
    setEditingAccount({ ...acc });
    // se estamos editando um cliente (modal aberto), usar editor inline
    if (editingClient) {
      setEditingAccountInline(true);
    } else {
      setShowEditAccount(true);
    }
  };

  const handleEditAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingAccount) return;
    const clientId = activeClient?.id || editingClient?.id || null;
    if (!clientId) return;
    try {
      await adminService.updateMetaAccount(clientId, editingAccount.id, editingAccount);
      if (activeClient?.id === clientId) await openDetails(clientId);
      if (editingClient?.id === clientId) {
        const res = await adminService.getClient(clientId);
        setEditingClient(res.client || res);
      }
      setShowEditAccount(false);
      setEditingAccount(null);
      setAnnouncement('Conta atualizada com sucesso.');
    } catch (err: any) {
      const msg = err?.error || String(err);
      setError(msg);
      setAnnouncement(msg);
    }
  };

  // inline handlers para o modal de edição (evitam forms aninhados)
  const handleInlineAddAccount = async () => {
    const clientId = editingClient?.id;
    if (!clientId) return;
    try {
      await adminService.addMetaAccount(clientId, inlineAccountForm);
      const res = await adminService.getClient(clientId);
      setEditingClient(res.client || res);
      setInlineAccountForm({ adAccountId: '', name: '', accessToken: '', status: 'active', id: '' });
      setShowAddAccountInline(false);
      setAnnouncement('Conta adicionada com sucesso.');
    } catch (err: any) {
      const msg = err?.error || String(err);
      setError(msg);
      setAnnouncement(msg);
    }
  };

  const handleInlineEditAccount = async () => {
    const clientId = editingClient?.id;
    if (!clientId || !inlineAccountForm.id) return;
    try {
      await adminService.updateMetaAccount(clientId, inlineAccountForm.id, inlineAccountForm);
      const res = await adminService.getClient(clientId);
      setEditingClient(res.client || res);
      setInlineAccountForm({ adAccountId: '', name: '', accessToken: '', status: 'active', id: '' });
      setEditingAccount(null);
      setEditingAccountInline(false);
      setAnnouncement('Conta atualizada com sucesso.');
    } catch (err: any) {
      const msg = err?.error || String(err);
      setError(msg);
      setAnnouncement(msg);
    }
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Clientes</h1>
          <p className="text-sm text-slate-500">Crie, edite e gerencie clientes e suas contas Meta Ads.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar clientes..." className="pl-10 pr-3 py-2 border rounded-lg w-72" />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg shadow">
            <Plus size={16} /> Novo Cliente
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 mb-3">{error}</div>}
  {/* live region for accessibility announcements */}
  <div aria-live="polite" className="sr-only" />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center">Nenhum cliente encontrado.</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} className="border-t hover:bg-slate-50 transition-colors">
                  <td className="p-3">{c.id}</td>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-slate-600">{c.email}</td>
                  <td className="p-3">{c.role || 'MEMBER'}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => openEditClient(c.id)} title="Editar Cliente" className="p-2 rounded-md hover:bg-slate-100"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(c.id)} title="Remover" className="p-2 rounded-md text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details drawer */}
      {activeClient && (
        <aside role="dialog" aria-labelledby="client-details-title" className="fixed right-0 top-0 h-full w-full md:w-1/3 bg-white shadow-lg z-50 p-6 overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 id="client-details-title" className="text-xl font-semibold">{activeClient.name}</h2>
              <p className="text-sm text-slate-500">{activeClient.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddAccount(true)} className="px-3 py-2 bg-brand-600 text-white rounded">Adicionar Conta</button>
              <button onClick={closeDetails} className="px-3 py-2 border rounded">Fechar</button>
            </div>
          </div>

          <section>
            <h3 className="font-semibold mb-2">Meta Ad Accounts</h3>
            {detailsLoading ? (
              <div>Carregando conta...</div>
            ) : (!activeClient.metaAdAccount) ? (
              <div className="text-sm text-slate-500">Nenhuma conta adicionada ainda.</div>
            ) : (
              <div className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">{activeClient.metaAdAccount.name || activeClient.metaAdAccount.adAccountId}</div>
                  <div className="text-sm text-slate-500">{activeClient.metaAdAccount.adAccountId} • {activeClient.metaAdAccount.status}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditAccount(activeClient.metaAdAccount)} title="Editar" className="p-2 rounded-md hover:bg-slate-100"><Edit2 size={16} /></button>
                  <button onClick={() => handleDeleteAccount(activeClient.metaAdAccount.id)} title="Remover" className="p-2 rounded-md text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              </div>
            )}
          </section>

          {/* add account modal */}
          <Modal title="Adicionar Meta Ad Account" open={showAddAccount} onClose={() => setShowAddAccount(false)} initialFocusId="adAccountId">
            <form onSubmit={handleAddAccount} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600">Ad Account ID</label>
                <input id="adAccountId" value={accountForm.adAccountId} onChange={e => setAccountForm(prev => ({ ...prev, adAccountId: e.target.value }))} className="w-full border p-2 rounded" required />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Nome (opcional)</label>
                <input value={accountForm.name} onChange={e => setAccountForm(prev => ({ ...prev, name: e.target.value }))} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Access Token</label>
                <input value={accountForm.accessToken} onChange={e => setAccountForm(prev => ({ ...prev, accessToken: e.target.value }))} className="w-full border p-2 rounded" required />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Status</label>
                <select value={accountForm.status} onChange={e => setAccountForm(prev => ({ ...prev, status: e.target.value }))} className="w-full border p-2 rounded">
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddAccount(false)} className="px-4 py-2 rounded border">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-brand-600 text-white">Adicionar</button>
              </div>
            </form>
          </Modal>

          {/* edit account modal */}
          <Modal title="Editar Meta Ad Account" open={showEditAccount} onClose={() => { setShowEditAccount(false); setEditingAccount(null); }} initialFocusId="editAdAccountId">
            <form onSubmit={handleEditAccount} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600">Ad Account ID</label>
                <input id="editAdAccountId" value={editingAccount?.adAccountId || ''} onChange={e => setEditingAccount((prev: any) => ({ ...prev, adAccountId: e.target.value }))} className="w-full border p-2 rounded" required />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Nome (opcional)</label>
                <input value={editingAccount?.name || ''} onChange={e => setEditingAccount((prev: any) => ({ ...prev, name: e.target.value }))} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Access Token</label>
                <input value={editingAccount?.accessToken || ''} onChange={e => setEditingAccount((prev: any) => ({ ...prev, accessToken: e.target.value }))} className="w-full border p-2 rounded" required />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Status</label>
                <select value={editingAccount?.status || 'active'} onChange={e => setEditingAccount((prev: any) => ({ ...prev, status: e.target.value }))} className="w-full border p-2 rounded">
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => { setShowEditAccount(false); setEditingAccount(null); }} className="px-4 py-2 rounded border">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-brand-600 text-white">Salvar</button>
              </div>
            </form>
          </Modal>
        </aside>
      )}

      <Modal title="Criar Cliente" open={showCreate} onClose={() => setShowCreate(false)}>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600">Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full border p-2 rounded">
              <option value="MEMBER">MEMBER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="pt-2 border-t">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={createMeta} onChange={e => setCreateMeta(e.target.checked)} />
              <span className="text-sm">Adicionar Meta Ad Account para este cliente</span>
            </label>
              {createMeta && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm text-slate-600">Ad Account ID</label>
                  <input value={createMetaForm.adAccountId} onChange={e => setCreateMetaForm(prev => ({ ...prev, adAccountId: e.target.value }))} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Nome (opcional)</label>
                  <input value={createMetaForm.name} onChange={e => setCreateMetaForm(prev => ({ ...prev, name: e.target.value }))} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Access Token</label>
                  <input value={createMetaForm.accessToken} onChange={e => setCreateMetaForm(prev => ({ ...prev, accessToken: e.target.value }))} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Status</label>
                  <select value={createMetaForm.status} onChange={e => setCreateMetaForm(prev => ({ ...prev, status: e.target.value }))} className="w-full border p-2 rounded">
                    <option value="active">active</option>
                    <option value="disabled">disabled</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded border">Cancelar</button>
            <button type="submit" disabled={creating} className="px-4 py-2 rounded bg-brand-600 text-white">{creating ? 'Criando...' : 'Criar'}</button>
          </div>
        </form>
      </Modal>
      {/* Campos opcionais para MetaAdAccount no modal de criação */}

      {/* Edit client modal */}
      <Modal title="Editar Cliente" open={showEditClient} onClose={() => { setShowEditClient(false); setEditingClient(null); }}>
        <form onSubmit={handleEditClient} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600">Nome</label>
            <input value={editingClient?.name || ''} onChange={e => setEditingClient((prev: any) => ({ ...prev, name: e.target.value }))} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Email</label>
            <input value={editingClient?.email || ''} onChange={e => setEditingClient((prev: any) => ({ ...prev, email: e.target.value }))} type="email" className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Role</label>
            <select value={editingClient?.role || 'MEMBER'} onChange={e => setEditingClient((prev: any) => ({ ...prev, role: e.target.value }))} className="w-full border p-2 rounded">
              <option value="MEMBER">MEMBER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => { setShowEditClient(false); setEditingClient(null); }} className="px-4 py-2 rounded border">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-brand-600 text-white">Salvar</button>
          </div>

          {/* MetaAdAccounts dentro do modal de edição */}
          {showEditClient && editingClient && (
            <div aria-live="polite" className="mt-3 space-y-3">
              <h4 className="font-semibold">Meta Ad Accounts</h4>
              <div>
                <button onClick={() => setShowAddAccountInline(true)} className="px-3 py-1 bg-brand-600 text-white rounded">Adicionar Conta</button>
              </div>

              {showAddAccountInline && (
                <div className="space-y-2 p-3 border rounded">
                  <div>
                    <label className="block text-sm text-slate-600">Ad Account ID</label>
                    <input value={inlineAccountForm.adAccountId} onChange={e => setInlineAccountForm(prev => ({ ...prev, adAccountId: e.target.value }))} className="w-full border p-2 rounded" required />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600">Nome (opcional)</label>
                    <input value={inlineAccountForm.name} onChange={e => setInlineAccountForm(prev => ({ ...prev, name: e.target.value }))} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600">Access Token</label>
                    <input value={inlineAccountForm.accessToken} onChange={e => setInlineAccountForm(prev => ({ ...prev, accessToken: e.target.value }))} className="w-full border p-2 rounded" required />
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { setShowAddAccountInline(false); setInlineAccountForm({ adAccountId: '', name: '', accessToken: '', status: 'active', id: '' }); }} className="px-3 py-1 border rounded">Cancelar</button>
                    <button type="button" onClick={handleInlineAddAccount} className="px-3 py-1 bg-brand-600 text-white rounded">Adicionar</button>
                  </div>
                </div>
              )}
              {(!editingClient.metaAdAccount) ? (
                <div className="text-sm text-slate-500">Nenhuma conta adicionada.</div>
              ) : (
                <div className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{editingClient.metaAdAccount.name || editingClient.metaAdAccount.adAccountId}</div>
                    <div className="text-sm text-slate-500">{editingClient.metaAdAccount.adAccountId} • {editingClient.metaAdAccount.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => {
                      // open inline editor for singular account
                      const acc = editingClient.metaAdAccount;
                      setEditingAccount({ ...acc });
                      setInlineAccountForm({ adAccountId: acc.adAccountId, name: acc.name || '', accessToken: acc.accessToken || '', status: acc.status || 'active', id: acc.id });
                      setEditingAccountInline(true);
                    }} className="p-2 rounded hover:bg-slate-100">Editar</button>
                    <button onClick={() => handleDeleteAccount(editingClient.metaAdAccount.id)} className="p-2 rounded text-red-600 hover:bg-red-50">Remover</button>
                  </div>
                </div>
              )}

              {editingAccountInline && (
                <div className="mt-3 space-y-2 p-3 border rounded">
                  <h5 className="font-medium">Editar Conta</h5>
                  <div>
                    <label className="block text-sm text-slate-600">Ad Account ID</label>
                    <input value={inlineAccountForm.adAccountId} onChange={e => setInlineAccountForm(prev => ({ ...prev, adAccountId: e.target.value }))} className="w-full border p-2 rounded" required />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600">Nome (opcional)</label>
                    <input value={inlineAccountForm.name} onChange={e => setInlineAccountForm(prev => ({ ...prev, name: e.target.value }))} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600">Access Token</label>
                    <input value={inlineAccountForm.accessToken} onChange={e => setInlineAccountForm(prev => ({ ...prev, accessToken: e.target.value }))} className="w-full border p-2 rounded" required />
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { setEditingAccountInline(false); setInlineAccountForm({ adAccountId: '', name: '', accessToken: '', status: 'active', id: '' }); setEditingAccount(null); }} className="px-3 py-1 border rounded">Cancelar</button>
                    <button type="button" onClick={handleInlineEditAccount} className="px-3 py-1 bg-brand-600 text-white rounded">Salvar</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default AdminClients;
