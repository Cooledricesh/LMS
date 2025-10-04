import axios, { isAxiosError } from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  headers: {
    "Content-Type": "application/json",
  },
});

type ErrorPayload = {
  error?: {
    message?: string;
  };
  message?: string;
};

export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage = "API request failed."
) => {
  if (isAxiosError(error)) {
    const payload = error.response?.data as ErrorPayload | undefined;

    if (typeof payload?.error?.message === "string") {
      return payload.error.message;
    }

    if (typeof payload?.message === "string") {
      return payload.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

// Fetch-based API client for new features
class FetchClient {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
  }

  private async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const fullURL = this.baseURL ? `${this.baseURL}${url}` : url;

    // Get Supabase auth token if available
    let authHeaders = {};
    if (typeof window !== 'undefined') {
      const { getSupabaseBrowserClient } = await import('@/lib/supabase/browser-client');
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        authHeaders = {
          'Authorization': `Bearer ${session.access_token}`
        };
      }
    }

    const response = await fetch(fullURL, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(options.headers || {}),
      },
    });

    return response;
  }

  async get<T = any>(url: string, options?: RequestInit): Promise<Response> {
    return this.request<T>(url, {
      ...options,
      method: "GET",
    });
  }

  async post<T = any>(
    url: string,
    options?: RequestInit & { json?: any }
  ): Promise<Response> {
    const { json, ...restOptions } = options || {};

    return this.request<T>(url, {
      ...restOptions,
      method: "POST",
      body: json ? JSON.stringify(json) : restOptions.body,
    });
  }

  async put<T = any>(
    url: string,
    options?: RequestInit & { json?: any }
  ): Promise<Response> {
    const { json, ...restOptions } = options || {};

    return this.request<T>(url, {
      ...restOptions,
      method: "PUT",
      body: json ? JSON.stringify(json) : restOptions.body,
    });
  }

  async delete<T = any>(url: string, options?: RequestInit): Promise<Response> {
    return this.request<T>(url, {
      ...options,
      method: "DELETE",
    });
  }
}

export const apiClient = new FetchClient();
export { axiosClient, isAxiosError };
