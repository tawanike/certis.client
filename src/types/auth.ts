export interface User {
    id: string;
    email: string;
    full_name: string | null;
    tenant_id: string;
}

export interface Token {
    access_token: string;
    token_type: string;
}

export interface UserLogin {
    email: string;
    password: string;
}
