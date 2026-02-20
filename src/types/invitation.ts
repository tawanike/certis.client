export interface InvitationResponse {
    code: string;
    email: string;
    expires_at: string;
    status: string;
    tenant_id: string;
}

export interface UserRegister {
    invite_code: string;
    password: string;
    full_name: string;
}
