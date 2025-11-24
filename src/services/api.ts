import axios from 'axios';

// Altere essa URL para apontar ao seu backend (ex: http://localhost:4000)
export const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL) || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
