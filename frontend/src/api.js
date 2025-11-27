import axios from 'axios';
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
const client = axios.create({ baseURL: API_BASE });
client.interceptors.request.use(cfg=>{
  const token = localStorage.getItem('token');
  if(token) cfg.headers['Authorization'] = 'Bearer ' + token;
  return cfg;
});
export default client;