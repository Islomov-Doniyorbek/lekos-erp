import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";

const api = axios.create({
  baseURL: "https://fast-simple-crm.onrender.com/api/v1",
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 🔹 REQUEST INTERCEPTOR — har bir so‘rovga access tokenni qo‘shadi
api.interceptors.request.use((config: CustomAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 🔹 RESPONSE INTERCEPTOR — agar token muddati tugagan bo‘lsa (401), login sahifasiga yo‘naltiradi
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalConfig = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalConfig._retry) {
      // 🔸 Token yaroqsiz yoki muddati tugagan
      localStorage.removeItem("accessToken");

      // Faqat client tarafda redirect qilamiz
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
