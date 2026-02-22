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

export interface RiskFinding {
    id: string;
    claim_id?: string;
    category: string;
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    recommendation: string;
}

export interface RiskAnalysis {
    defensibility_score: number;
    findings: RiskFinding[];
    summary: string;
}

export interface RiskAnalysisVersion {
    id: string;
    matter_id: string;
    version_number: number;
    is_authoritative: boolean;
    created_at: string;
    analysis_data: RiskAnalysis;
    claim_version_id?: string;
    spec_version_id?: string;
}

export interface SpecParagraph {
    id: string;
    section: 'technical_field' | 'background' | 'summary' | 'detailed_description' | 'definitions' | 'figure_descriptions' | 'abstract';
    text: string;
    claim_references: string[];
}

export interface SpecDocument {
    title: string;
    sections: SpecParagraph[];
    claim_coverage: Record<string, string[]>;
}

export interface SpecVersion {
    id: string;
    matter_id: string;
    version_number: number;
    is_authoritative: boolean;
    created_at: string;
    content_data: SpecDocument;
    claim_version_id?: string;
    risk_version_id?: string;
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

// ---- Chat Types ----

export interface DocumentReference {
    filename: string;
    page_number: number;
    content: string;
    document_id?: string;
    chunk_index?: number;
    content_type?: string;
    total_pages?: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    thinking?: string;
    timestamp: string;
    proposal?: {
        title: string;
        description: string;
        status: 'pending' | 'accepted' | 'rejected';
        diff?: string;
    };
    references?: DocumentReference[];
}

export interface Thread {
    id: string;
    title: string;
    category: 'drafting' | 'risk' | 'prosecution';
    lastActivity: string;
    badge?: string;
    type: 'authoritative' | 'exploratory' | 'analytical';
}

// ---- Claim Tree (frontend display format) ----

export interface Claim {
    id: number;
    type: 'independent' | 'dependent';
    category: 'system' | 'method' | 'apparatus';
    text: string;
    dependsOn?: number;
    riskFlags?: { type: string; severity: 'low' | 'medium' | 'high' }[];
    children?: Claim[];
}

// ---- Status Labels ----

export const STATUS_LABELS: Record<string, { label: string; variant: string }> = {
    CREATED: { label: 'Created', variant: 'info' },
    BRIEF_ANALYZED: { label: 'Brief Analyzed', variant: 'info' },
    CLAIMS_PROPOSED: { label: 'Claims Proposed', variant: 'warning' },
    CLAIMS_APPROVED: { label: 'Claims Approved', variant: 'warning' },
    RISK_REVIEWED: { label: 'Risk Reviewed', variant: 'accent' },
    SPEC_GENERATED: { label: 'Spec Generated', variant: 'accent' },
    RISK_RE_REVIEWED: { label: 'Risk Re-Reviewed', variant: 'accent' },
    QA_COMPLETE: { label: 'QA Complete', variant: 'success' },
    LOCKED_FOR_EXPORT: { label: 'Export Ready', variant: 'success' },
};

// ---- Threads (sidebar navigation) ----

export const threads: Thread[] = [
    { id: 'thread-1', title: 'Main Draft', category: 'drafting', lastActivity: '2 min ago', badge: 'Claims Updated', type: 'authoritative' },
    { id: 'thread-2', title: 'Claim Strategy', category: 'drafting', lastActivity: '15 min ago', type: 'exploratory' },
    { id: 'thread-3', title: 'Embodiment Expansion', category: 'drafting', lastActivity: '1 hr ago', badge: 'Spec Expanded', type: 'authoritative' },
    { id: 'thread-4', title: 'Variant Exploration', category: 'drafting', lastActivity: '3 hrs ago', type: 'exploratory' },
    { id: 'thread-5', title: 'Litigation Analysis', category: 'risk', lastActivity: '30 min ago', badge: 'Risk Flag Added', type: 'analytical' },
    { id: 'thread-6', title: '112 Review', category: 'risk', lastActivity: '2 hrs ago', badge: '2 Warnings', type: 'analytical' },
    { id: 'thread-7', title: 'QA Reports', category: 'risk', lastActivity: '1 hr ago', type: 'analytical' },
    { id: 'thread-8', title: 'Office Action', category: 'prosecution', lastActivity: '1 day ago', type: 'authoritative' },
    { id: 'thread-9', title: 'Amendment Plan', category: 'prosecution', lastActivity: '2 days ago', type: 'exploratory' },
];
