import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { getCookie, setCookie, clearCookie } from "./storage";
import { differenceInSeconds } from "date-fns";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_USERNAME = process.env.NEXT_PUBLIC_API_USERNAME;
const API_PASSWORD = process.env.NEXT_PUBLIC_API_PASSWORD;
const TOKEN_URL = process.env.NEXT_PUBLIC_TOKEN_URL;

const TOKEN_KEY = "auth_token";
const TOKEN_EXPIRY_KEY = "auth_token_expiry";
const USER_ROLE_KEY = "flowbank_user";

let currentToken: string | null = null;
let tokenRefreshPromise: Promise<void> | null = null;
let refreshInterval: ReturnType<typeof setInterval> | null = null;

const allowEmptyUserRolePaths = ["/v1/api/user/AuthenticateUser"];

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Token management functions using cookies
export const setToken = async (token: string | null, expiresInSec = 3600) => {
  if (!token) {
    clearCookie(TOKEN_KEY);
    clearCookie(TOKEN_EXPIRY_KEY);
    currentToken = null;
    return;
  }

  currentToken = token;
  const expiryDate = new Date(Date.now() + expiresInSec * 1000).toISOString();

  setCookie(TOKEN_KEY, token, 7); // 7 days
  setCookie(TOKEN_EXPIRY_KEY, expiryDate, 7);
};

export const getToken = (): string | null => {
  if (!currentToken) {
    currentToken = getCookie(TOKEN_KEY);
  }
  return currentToken;
};

// Check if token is expired
const isTokenExpired = (thresholdSeconds = 60): boolean => {
  const expiryString = getCookie(TOKEN_EXPIRY_KEY);
  if (!expiryString) return true;

  const expiry = new Date(expiryString);
  const now = new Date();
  const secondsLeft = differenceInSeconds(expiry, now);
  return secondsLeft < thresholdSeconds;
};

const getUserFromStore = (): string | null => {
  try {
    const userStr = getCookie(USER_ROLE_KEY);
    if (!userStr) return null;

    const decodedStr = decodeURIComponent(userStr);
    const parsed = JSON.parse(decodedStr);
    return parsed?.userRec?.userId || null;
  } catch (err) {
    console.error("Invalid user format:", err);
    return null;
  }
};

// Get API token
export const getApiToken = async (): Promise<string> => {
  try {
    const response = await axios.post(`${TOKEN_URL}/login`, {
      username: API_USERNAME,
      password: API_PASSWORD,
    });

    const token = response.data?.token;
    if (token) {
      await setToken(token, 4 * 3600); // 4 hours
      return token;
    } else {
      throw new Error("Token missing from API login response");
    }
  } catch (err) {
    console.error("Error getting API token:", err);
    throw err;
  }
};

// Refresh token
const refreshToken = async () => {
  try {
    const response = await axios.post<{ token: string }>(
      `${API_BASE_URL}/token-refresh`,
      {
        userName: API_USERNAME,
        password: API_PASSWORD,
      },
    );

    if (response.data?.token) {
      await setToken(response.data.token, 4 * 3600);
      console.log("Token refreshed");
    } else {
      throw new Error("Token missing from response");
    }
  } catch (err) {
    console.error("Token refresh failed:", err);
    await logout();
    throw err;
  }
};

// Auto-refresh mechanism
export const startTokenRefresh = (intervalMs = 5 * 60 * 1000) => {
  if (refreshInterval) clearInterval(refreshInterval);

  const refreshIfNeeded = async () => {
    try {
      const expired = isTokenExpired(60);
      if (expired) {
        await refreshToken();
      }
    } catch (err) {
      console.error("Auto-refresh error:", err);
    }
  };

  refreshIfNeeded();
  refreshInterval = setInterval(refreshIfNeeded, intervalMs);

  return () => {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = null;
  };
};

// Logout function - clear all cookies
export const logout = async () => {
  clearCookie(TOKEN_KEY);
  clearCookie(TOKEN_EXPIRY_KEY);
  clearCookie("flowbank_user");
  clearCookie("flowbank_app");
  clearCookie("flowbank_main");
  clearCookie("flowbank_access");
  currentToken = null;

  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }

  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const userRole = getUserFromStore();
    const requestPath = new URL(config.url!, config.baseURL).pathname;

    if (userRole || !allowEmptyUserRolePaths.includes(requestPath)) {
      config.headers["X-Rub-UsRole"] = userRole || "";
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log("API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log("API Response:", {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!tokenRefreshPromise) {
          tokenRefreshPromise = refreshToken();
        }

        await tokenRefreshPromise;
        tokenRefreshPromise = null;

        const token = getToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errorMessage?: string;
}

// Generic API request wrapper
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig,
): Promise<ApiResponse<T>> => {
  try {
    const response = await api(config);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      errorMessage:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong!",
    };
  }
};
