import { api } from "@/lib/api";
import { InvitationResponse, Token } from "@/types";

export const invitationService = {
    async validate(code: string): Promise<InvitationResponse> {
        return api.get<InvitationResponse>(`/auth/invitations/${code}`);
    },

    async register(inviteCode: string, password: string, fullName: string): Promise<Token> {
        return api.post<Token>("/auth/register", {
            invite_code: inviteCode,
            password,
            full_name: fullName,
        });
    }
};
