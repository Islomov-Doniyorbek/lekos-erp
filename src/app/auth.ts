import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";
import { refreshAccessToken } from "./api";

let isRefreshing = false;
let subscribers: ((token: string) => void)[] = [];

const api = axios.create({
  baseURL: "https://fast-simple-crm.onrender.com/api/v1",
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function subscribeTokenRefresh(cb: (token: string) => void) {
  subscribers.push(cb);
}

function onRefreshed(token: string) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

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

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalConfig = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalConfig._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            onRefreshed(newToken);
          }
        } catch (err) {
          console.error("Refresh token failed", err);
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          originalConfig._retry = true;
          originalConfig.headers = originalConfig.headers || {};
          originalConfig.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalConfig));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
