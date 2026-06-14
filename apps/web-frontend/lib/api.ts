// apps/web/lib/api.ts
import { config } from '@/config/config';
import axios from "axios";


const api = axios.create({
  baseURL: config.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:4000",
  withCredentials: true,            // send cookies
});

export default api;