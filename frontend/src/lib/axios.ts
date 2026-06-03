import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@WMS:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
