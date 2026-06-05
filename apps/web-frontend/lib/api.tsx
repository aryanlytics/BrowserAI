// apps/web/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000", // always api-gateway
  withCredentials: true,            // send cookies
});

export default api;