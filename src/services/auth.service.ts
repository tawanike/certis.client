import { api } from "@/lib/api";
import { UserLogin, Token, User } from "@/types";

export const authService = {
    async login(email: string, password: string): Promise<Token> {
        return api.post<Token>("/auth/login", { email, password });
    },

    async me(): Promise<User> {
        return api.get<User>("/auth/me");
    }
};
