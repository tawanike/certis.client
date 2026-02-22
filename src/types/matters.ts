export type MatterStatus =
    | 'CREATED'
    | 'BRIEF_ANALYZED'
    | 'CLAIMS_PROPOSED'
    | 'CLAIMS_APPROVED'
    | 'RISK_REVIEWED'
    | 'SPEC_GENERATED'
    | 'RISK_RE_REVIEWED'
    | 'QA_COMPLETE'
    | 'LOCKED_FOR_EXPORT';

export interface BriefUploadResponse {
    id: string;
    version_number: number;
    is_authoritative: boolean;
    structure_data: any;
    message: string;
}

export interface BriefVersion {
    id: string;
    matter_id: string;
    version_number: number;
    is_authoritative: boolean;
    structure_data: any;
    created_at: string;
}

export interface ClaimNode {
    id: string;
    type: 'independent' | 'dependent';
    text: string;
    dependencies: string[];
    category?: 'method' | 'system' | 'apparatus' | 'crm';
}

export interface ClaimGraph {
    nodes: ClaimNode[];
    risk_score?: number;
}

export interface ClaimGraphVersion {
    id: string;
    matter_id: string;
    version_number: number;
    description?: string;
    is_authoritative: boolean;
    graph_data: ClaimGraph;
    created_at: string;
}

export interface Matter {
    id: string;
    title: string;
    description?: string;
    reference_number?: string;
    status: MatterStatus;
    jurisdictions: string[];
    inventors?: string[];
    assignee?: string;
    tech_domain?: string;
    defensibility_score?: number;
    tenant_id: string;
    attorney_id: string;
    created_at: string;
    updated_at: string;
}

export interface MatterCreatePayload {
    title: string;
    description?: string;
    jurisdictions: string[];
    inventors?: string[];
    assignee?: string;
    tech_domain?: string;
}

export interface Suggestion {
    label: string;
    type: 'chat_prompt' | 'workflow_action';
    action_id?: string;
    prompt?: string;
}

export interface SuggestionsResponse {
    suggestions: Suggestion[];
    matter_status: string;
}

export interface DocumentResponse {
    id: string;
    matter_id: string;
    filename: string;
    content_type: string;
    total_pages: number;
    status: 'processing' | 'ready' | 'failed';
    created_at: string;
}

export interface QAFinding {
    id: string;
    category: 'antecedent_basis' | 'dependency_loop' | 'undefined_term' | 'claim_spec_consistency' | 'support_coverage';
    severity: 'error' | 'warning';
    claim_id?: string;
    location: string;
    title: string;
    description: string;
    recommendation: string;
}

export interface QAReport {
    support_coverage_score: number;
    total_errors: number;
    total_warnings: number;
    findings: QAFinding[];
    summary: string;
    can_export: boolean;
}

export interface QAReportVersion {
    id: string;
    matter_id: string;
    version_number: number;
    description?: string;
    is_authoritative: boolean;
    created_at: string;
    report_data: QAReport;
    claim_version_id?: string;
    spec_version_id?: string;
}

export interface AuditEvent {
    id: string;
    matter_id: string;
    event_type: string;
    actor_id?: string;
    artifact_version_id?: string;
    artifact_type?: string;
    detail?: Record<string, any>;
    created_at: string;
}
