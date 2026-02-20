"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { invitationService } from "@/services/invitation.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { InvitationResponse, Token } from "@/types";

export default function InvitePage() {
    const params = useParams();
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    // params.code can be string or string[]
    const code = Array.isArray(params.code) ? params.code[0] : params.code;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [invitation, setInvitation] = useState<InvitationResponse | null>(null);

    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    useEffect(() => {
        if (!code) {
            setError("Invalid invitation link");
            setLoading(false);
            return;
        }

        invitationService.validate(code)
            .then((data) => {
                setInvitation(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || "Failed to validate invitation");
                setLoading(false);
            });
    }, [code]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;

        setSubmitting(true);
        setError(null);

        try {
            const data = await invitationService.register(code, password, fullName);

            // Auto login with returned token and user info from invitation
            const user = {
                id: "new-id", // Backend should return user object ideally, but for now we mimic
                email: invitation?.email || "",
                full_name: fullName,
                tenant_id: invitation?.tenant_id || ""
            };

            login(user, data.access_token);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p>Validating invitation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="text-red-600">Invitation Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Accept Invitation</CardTitle>
                    <CardDescription>
                        You have been invited to join <strong>Certis</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={invitation?.email || ""}
                                disabled
                                className="bg-gray-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullname">Full Name</Label>
                            <Input
                                id="fullname"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Set Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>

                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Registering..." : "Complete Registration"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
