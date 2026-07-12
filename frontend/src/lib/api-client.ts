const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export const apiClient = {
  get: async <T>(url: string, options?: RequestOptions): Promise<T> => {
    // Real implementation:
    // const queryString = options?.params ? '?' + new URLSearchParams(options.params).toString() : '';
    // const res = await fetch(`${API_BASE_URL}${url}${queryString}`, {
    //   headers: { 'Content-Type': 'application/json', ...options?.headers }
    // });
    // if (!res.ok) throw new Error(`GET ${url} failed with status ${res.status}`);
    // return res.json();
    throw new Error("apiClient not implemented: Running in mock data demo mode.");
  },

  post: async <T>(url: string, data: any, options?: RequestOptions): Promise<T> => {
    // Real implementation:
    // const res = await fetch(`${API_BASE_URL}${url}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', ...options?.headers },
    //   body: JSON.stringify(data)
    // });
    // if (!res.ok) throw new Error(`POST ${url} failed`);
    // return res.json();
    throw new Error("apiClient not implemented: Running in mock data demo mode.");
  },

  put: async <T>(url: string, data: any, options?: RequestOptions): Promise<T> => {
    // Real implementation:
    // const res = await fetch(`${API_BASE_URL}${url}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json', ...options?.headers },
    //   body: JSON.stringify(data)
    // });
    // if (!res.ok) throw new Error(`PUT ${url} failed`);
    // return res.json();
    throw new Error("apiClient not implemented: Running in mock data demo mode.");
  },

  patch: async <T>(url: string, data: any, options?: RequestOptions): Promise<T> => {
    // Real implementation:
    // const res = await fetch(`${API_BASE_URL}${url}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json', ...options?.headers },
    //   body: JSON.stringify(data)
    // });
    // if (!res.ok) throw new Error(`PATCH ${url} failed`);
    // return res.json();
    throw new Error("apiClient not implemented: Running in mock data demo mode.");
  },

  delete: async <T>(url: string, options?: RequestOptions): Promise<T> => {
    // Real implementation:
    // const res = await fetch(`${API_BASE_URL}${url}`, {
    //   method: 'DELETE',
    //   headers: { 'Content-Type': 'application/json', ...options?.headers }
    // });
    // if (!res.ok) throw new Error(`DELETE ${url} failed`);
    // return res.json();
    throw new Error("apiClient not implemented: Running in mock data demo mode.");
  }
};
