export interface Client {
  id: string;
  name: string;
  email: string;
  role?: 'ADMIN' | 'MEMBER' | string;
  createdAt?: string;
  updatedAt?: string;
  // when fetching client details, backend may include a single metaAdAccount
  metaAdAccount?: any | null;
}

interface AuthResponse {
  client?: Client;
  token?: string;
  error?: string;
}

const handleJson = async (res: Response) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw json;
  return json as AuthResponse;
};

import { api } from './api';

export async function register(name: string, email: string, password: string) {
  try {
  const res = await api.post('/api/auth/register', { name, email, password });
    return res.data as AuthResponse;
  } catch (err: any) {
    // axios error: err.response?.data
    throw err.response?.data || { error: String(err) };
  }
}

export async function login(email: string, password: string) {
  try {
  const res = await api.post('/api/auth/login', { email, password });
    return res.data as AuthResponse;
  } catch (err: any) {
    throw err.response?.data || { error: String(err) };
  }
}

import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

export function setAuthToken(token: string) {
  try { localStorage.setItem('tf_token', token); } catch (e) { /* ignore */ }
}

export function setAuthCookie(token: string, days: number) {
  try { setCookie('tf_token', token, days); } catch (e) { /* ignore */ }
}

export function getAuthCookie(): string | null {
  try { return getCookie('tf_token'); } catch (e) { return null; }
}

export function deleteAuthCookie() {
  try { deleteCookie('tf_token'); } catch (e) { /* ignore */ }
}

export function setClient(client: Client) {
  try { localStorage.setItem('tf_client', JSON.stringify(client)); } catch (e) { /* ignore */ }
}

export function getClient(): Client | null {
  try { const s = localStorage.getItem('tf_client'); return s ? JSON.parse(s) : null; } catch (e) { return null; }
}

export function getAuthToken(): string | null {
  try { return localStorage.getItem('tf_token'); } catch (e) { return null; }
}

export function clearAuth() {
  try { localStorage.removeItem('tf_token'); localStorage.removeItem('tf_client'); deleteAuthCookie(); } catch (e) { /* ignore */ }
}

// check basic validity of cookie presence (backend validation still required)
export function hasValidAuthCookie() {
  const c = getAuthCookie();
  return !!c;
}

export function isAuthenticated() {
  return !!getAuthToken();
}
