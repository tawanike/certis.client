import { useAuthStore } from "@/stores/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";

// Generic fetch wrapper to handle auth
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { token, logout } = useAuthStore.getState();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };

    // Remove Content-Type for FormData (browser sets it with boundary)
    if (options.body instanceof FormData) {
        delete headers["Content-Type"];
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        logout();
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || `Request failed: ${response.statusText}`);
    }

    if (response.status === 204) {
        return null as T;
    }

    return response.json();
}

export const api = {
    get: <T>(url: string, options?: RequestInit) =>
        apiFetch<T>(url, { ...options, method: "GET" }),

    post: <T>(url: string, data?: any, options?: RequestInit) =>
        apiFetch<T>(url, {
            ...options,
            method: "POST",
            body: data instanceof FormData ? data : JSON.stringify(data)
        }),

    put: <T>(url: string, data?: any, options?: RequestInit) =>
        apiFetch<T>(url, {
            ...options,
            method: "PUT",
            body: data instanceof FormData ? data : JSON.stringify(data)
        }),

    patch: <T>(url: string, data?: any, options?: RequestInit) =>
        apiFetch<T>(url, {
            ...options,
            method: "PATCH",
            body: data instanceof FormData ? data : JSON.stringify(data)
        }),

    delete: <T>(url: string, options?: RequestInit) =>
        apiFetch<T>(url, { ...options, method: "DELETE" }),
};
