import { api } from '@/lib/api';

export interface ClientResponse {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    tenant_id: string;
    created_at: string;
    updated_at: string;
}

export interface ClientCreate {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
}

export interface ClientUpdate {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
}

const BASE_URL = '/clients';

export const clientsService = {
    async create(data: ClientCreate): Promise<ClientResponse> {
        return api.post<ClientResponse>(BASE_URL, data);
    },

    async list(skip: number = 0, limit: number = 100): Promise<ClientResponse[]> {
        return api.get<ClientResponse[]>(`${BASE_URL}?skip=${skip}&limit=${limit}`);
    },

    async get(clientId: string): Promise<ClientResponse> {
        return api.get<ClientResponse>(`${BASE_URL}/${clientId}`);
    },

    async update(clientId: string, data: ClientUpdate): Promise<ClientResponse> {
        return api.patch<ClientResponse>(`${BASE_URL}/${clientId}`, data);
    }
};
