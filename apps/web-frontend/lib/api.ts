// apps/web/lib/api.ts
import { config } from '@/config/config';
import axios from "axios";


const api = axios.create({
  baseURL: config.apiGatewayUrl,
  withCredentials: true,            // send cookies
});

export default api;