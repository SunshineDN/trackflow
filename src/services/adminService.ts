import { api } from './api';
import { getAuthToken } from './authService';

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function listClients() {
  const res = await api.get('/api/admin/clients', { headers: authHeaders() });
  return res.data;
}

export async function getClient(id: string) {
  const res = await api.get(`/api/admin/clients/${id}`, { headers: authHeaders() });
  return res.data;
}

export async function createClient(payload: { name: string; email: string; role?: string }) {
  const res = await api.post('/api/admin/clients', payload, { headers: authHeaders() });
  return res.data;
}

export async function updateClient(id: string, payload: any) {
  const res = await api.patch(`/api/admin/clients/${id}`, payload, { headers: authHeaders() });
  return res.data;
}

export async function deleteClient(id: string) {
  const res = await api.delete(`/api/admin/clients/${id}`, { headers: authHeaders() });
  return res.data;
}

export async function addMetaAccount(clientId: string, payload: any) {
  const res = await api.post(`/api/admin/clients/${clientId}/meta-accounts`, payload, { headers: authHeaders() });
  return res.data;
}

export async function updateMetaAccount(clientId: string, aid: string, payload: any) {
  const res = await api.patch(`/api/admin/clients/${clientId}/meta-accounts/${aid}`, payload, { headers: authHeaders() });
  return res.data;
}

export async function deleteMetaAccount(clientId: string, aid: string) {
  const res = await api.delete(`/api/admin/clients/${clientId}/meta-accounts/${aid}`, { headers: authHeaders() });
  return res.data;
}

export default {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  addMetaAccount,
  updateMetaAccount,
  deleteMetaAccount,
};
