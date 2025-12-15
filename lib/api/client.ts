// src/lib/api/client.ts

import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiResponse, ApiError } from "@/types/api.types";

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        // Only access localStorage on the client side
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("accessToken");
          console.log("Token", token);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Only access localStorage on client side
          if (typeof window !== "undefined") {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              try {
                const { data } = await axios.post(
                  `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/auth/refresh-token`,
                  { refreshToken }
                );

                localStorage.setItem("accessToken", data.data.accessToken);

                if (error.config) {
                  error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
                  return this.client.request(error.config);
                }
              } catch (refreshError) {
                localStorage.clear();
                window.location.href = "/login";
              }
            } else {
              localStorage.clear();
              window.location.href = "/login";
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: any
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

// Create instances
export const authApi = new ApiClient(
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:8001"
);
export const sessionApi = new ApiClient(
  process.env.NEXT_PUBLIC_SESSION_SERVICE_URL || "http://localhost:8002"
);
