import { api } from "@/lib/api";
import { BriefUploadResponse, BriefVersion, ClaimGraphVersion, Matter, MatterCreatePayload, DocumentResponse, SuggestionsResponse, QAReport, QAReportVersion, AuditEvent, RiskAnalysisVersion, SpecVersion } from "@/types";

export const mattersService = {
    async uploadBrief(matterId: string, file: File): Promise<BriefUploadResponse> {
        const formData = new FormData();
        formData.append("file", file);

        return api.post<BriefUploadResponse>(`/matters/${matterId}/briefs/upload`, formData);
    },

    async create(payload: MatterCreatePayload): Promise<Matter> {
        return api.post<Matter>("/matters", payload);
    },

    async get(matterId: string): Promise<Matter> {
        return api.get<Matter>(`/matters/${matterId}`);
    },

    async list(): Promise<Matter[]> {
        return api.get<Matter[]>("/matters");
    },

    async uploadDocument(matterId: string, file: File): Promise<DocumentResponse> {
        const formData = new FormData();
        formData.append("file", file);
        return api.post<DocumentResponse>(`/matters/${matterId}/documents`, formData);
    },

    async listDocuments(matterId: string): Promise<DocumentResponse[]> {
        return api.get<DocumentResponse[]>(`/matters/${matterId}/documents`);
    },

    async listBriefVersions(matterId: string): Promise<BriefVersion[]> {
        return api.get<BriefVersion[]>(`/matters/${matterId}/briefs/versions`);
    },

    async approveBrief(matterId: string, versionId: string): Promise<BriefVersion> {
        return api.post<BriefVersion>(`/matters/${matterId}/briefs/${versionId}/approve`);
    },

    async generateClaims(matterId: string, briefVersionId?: string): Promise<ClaimGraphVersion> {
        const body = briefVersionId ? { brief_version_id: briefVersionId } : {};
        return api.post<ClaimGraphVersion>(`/matters/${matterId}/claims/generate`, body);
    },

    async listClaimVersions(matterId: string): Promise<ClaimGraphVersion[]> {
        return api.get<ClaimGraphVersion[]>(`/matters/${matterId}/claims/versions`);
    },

    async commitClaims(matterId: string, versionId: string): Promise<ClaimGraphVersion> {
        return api.post<ClaimGraphVersion>(`/matters/${matterId}/claims/${versionId}/commit`);
    },

    async getSuggestions(matterId: string): Promise<SuggestionsResponse> {
        return api.get<SuggestionsResponse>(`/matters/${matterId}/suggestions`);
    },

    async runQAValidation(matterId: string, claimVersionId?: string, specVersionId?: string): Promise<QAReport> {
        const body: Record<string, string> = {};
        if (claimVersionId) body.claim_version_id = claimVersionId;
        if (specVersionId) body.spec_version_id = specVersionId;
        return api.post<QAReport>(`/matters/${matterId}/qa/validate`, body);
    },

    async listQAVersions(matterId: string): Promise<QAReportVersion[]> {
        return api.get<QAReportVersion[]>(`/matters/${matterId}/qa/versions`);
    },

    async commitQA(matterId: string, versionId: string): Promise<QAReportVersion> {
        return api.post<QAReportVersion>(`/matters/${matterId}/qa/${versionId}/commit`);
    },

    async lockMatter(matterId: string): Promise<Matter> {
        return api.post<Matter>(`/matters/${matterId}/lock`);
    },

    async exportDocx(matterId: string): Promise<Blob> {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/v1";
        const { useAuthStore } = await import("@/stores/authStore");
        const token = useAuthStore.getState().token;
        const response = await fetch(`${baseUrl}/matters/${matterId}/export/docx`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
            throw new Error(`Export failed: ${response.statusText}`);
        }
        return response.blob();
    },

    async listAuditEvents(matterId: string): Promise<AuditEvent[]> {
        return api.get<AuditEvent[]>(`/matters/${matterId}/audit`);
    },

    async generateRiskAnalysis(matterId: string, claimVersionId?: string): Promise<RiskAnalysisVersion> {
        const body: Record<string, string> = {};
        if (claimVersionId) body.claim_version_id = claimVersionId;
        return api.post<RiskAnalysisVersion>(`/matters/${matterId}/risk/analyze`, body);
    },

    async listRiskVersions(matterId: string): Promise<RiskAnalysisVersion[]> {
        return api.get<RiskAnalysisVersion[]>(`/matters/${matterId}/risk/versions`);
    },

    async commitRisk(matterId: string, versionId: string): Promise<RiskAnalysisVersion> {
        return api.post<RiskAnalysisVersion>(`/matters/${matterId}/risk/${versionId}/commit`);
    },

    async reEvaluateRisk(matterId: string, specVersionId?: string): Promise<RiskAnalysisVersion> {
        const body: Record<string, string> = {};
        if (specVersionId) body.spec_version_id = specVersionId;
        return api.post<RiskAnalysisVersion>(`/matters/${matterId}/risk/re-evaluate`, body);
    },

    async generateSpecification(matterId: string, claimVersionId?: string, riskVersionId?: string): Promise<SpecVersion> {
        const body: Record<string, string> = {};
        if (claimVersionId) body.claim_version_id = claimVersionId;
        if (riskVersionId) body.risk_version_id = riskVersionId;
        return api.post<SpecVersion>(`/matters/${matterId}/specifications/generate`, body);
    },

    async listSpecVersions(matterId: string): Promise<SpecVersion[]> {
        return api.get<SpecVersion[]>(`/matters/${matterId}/specifications/versions`);
    },

    async commitSpec(matterId: string, versionId: string): Promise<SpecVersion> {
        return api.post<SpecVersion>(`/matters/${matterId}/specifications/${versionId}/commit`);
    },
};
