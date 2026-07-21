// apps/web/lib/api.ts
import { config } from '@/config/config';
import axios from "axios";


const api = axios.create({
  baseURL: config.apiGatewayUrl,
  withCredentials: true,            // send cookies
});

// ── Debug Interceptors ─────────────────────────────────────────────────────────
// These log every outbound request and every response/error to the browser
// console so you can instantly see what's happening in the network layer.
// Safe to leave in dev — they only run in the browser.

api.interceptors.request.use(
  (req) => {
    console.log(
      `🌐 [API] ${req.method?.toUpperCase()} ${req.baseURL}${req.url}`,
      req.data ? { body: req.data } : ''
    );
    return req;
  },
  (err) => {
    console.error('🌐 [API] Request setup error:', err.message);
    return Promise.reject(err);
  }
);

api.interceptors.response.use(
  (res) => {
    console.log(
      `✅ [API] ${res.status} ${res.config.method?.toUpperCase()} ${res.config.url}`,
      res.data
    );
    return res;
  },
  (err) => {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // Server responded with an error status
        console.error(
          `❌ [API] ${err.response.status} ${err.config?.method?.toUpperCase()} ${err.config?.url}`,
          err.response.data
        );
      } else if (err.request) {
        // Request was made but no response received (network error / CORS / Kong down)
        console.error(
          `🚫 [API] NO RESPONSE — ${err.config?.method?.toUpperCase()} ${err.config?.url}`,
          'Possible causes: Kong is down, CORS blocked, or network error.',
          err.message
        );
      }
    } else {
      console.error('❌ [API] Unexpected error:', err);
    }
    return Promise.reject(err);
  }
);

export default api;