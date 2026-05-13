import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export const ACCESS_TOKEN_KEY = "erp_access_token";
export const REFRESH_TOKEN_KEY = "erp_refresh_token";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) return null;
    refreshPromise = axios
      .post(`${API_BASE_URL}/token/refresh/`, { refresh })
      .then((response) => {
        const nextAccess = response.data?.access;
        if (nextAccess) {
          localStorage.setItem(ACCESS_TOKEN_KEY, nextAccess);
        }
        return nextAccess || null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const nextAccess = await refreshAccessToken();
    if (!nextAccess) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${nextAccess}`;
    return api(originalRequest);
  },
);

export function getApiError(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;

  const firstKey = Object.keys(data)[0];
  const firstValue = data[firstKey];
  if (Array.isArray(firstValue)) return `${firstKey}: ${firstValue[0]}`;
  return fallback;
}
