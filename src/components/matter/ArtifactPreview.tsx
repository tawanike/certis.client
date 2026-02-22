'use client';

import React, { useState } from 'react';
import {
    PenTool,
    Shield,
    BookOpen,
    CheckCircle,
    UploadCloud,
    AlertTriangle,
    AlertCircle,
    FolderOpen,
    FileText,
    Pencil,
    Trash2,
    Plus,
    X,
    Save,
    Download,
    Loader2,
} from 'lucide-react';
import ClaimTree from '@/components/ClaimTree';
import RiskDashboard from '@/components/RiskDashboard';
import BriefUpload from '@/components/BriefUpload';
import BriefViewer from '@/components/BriefViewer';
import HoverableText from '@/components/HoverableText';
import FileWrapperViewer from './FileWrapperViewer';
import { type Claim, type SpecParagraph, DocumentResponse, BriefVersion, ClaimGraphVersion, QAReportVersion, RiskAnalysisVersion, SpecVersion } from '@/types';

type ArtifactTab = 'brief' | 'claims' | 'risk' | 'spec' | 'qa' | 'wrapper' | 'draft';

interface ArtifactPreviewProps {
    activeTab: ArtifactTab;
    onTabChange: (tab: ArtifactTab) => void;
    claims?: Claim[];
    onAddToChat?: (text: string) => void;
    fileWrapperDocs?: DocumentResponse[];
    // Brief approval flow
    matterId: string;
    briefVersion?: BriefVersion | null;
    onBriefUploadSuccess?: (data: any) => void;
    onApproveBrief?: () => void;
    isApprovingBrief?: boolean;
    // Claims flow
    claimVersion?: ClaimGraphVersion | null;
    onGenerateClaims?: () => void;
    isGeneratingClaims?: boolean;
    onCommitClaims?: () => void;
    isCommittingClaims?: boolean;
    briefApproved?: boolean;
    highlightedClaimId?: number | null;
    // Risk flow
    riskVersion?: RiskAnalysisVersion | null;
    onGenerateRisk?: () => void;
    isGeneratingRisk?: boolean;
    onCommitRisk?: () => void;
    isCommittingRisk?: boolean;
    onReEvaluateRisk?: () => void;
    isReEvaluatingRisk?: boolean;
    claimsApproved?: boolean;
    // Spec flow
    specVersion?: SpecVersion | null;
    onGenerateSpec?: () => void;
    isGeneratingSpec?: boolean;
    onCommitSpec?: () => void;
    isCommittingSpec?: boolean;
    riskApproved?: boolean;
    // QA flow
    qaVersion?: QAReportVersion | null;
    onRunQA?: () => void;
    isRunningQA?: boolean;
    onCommitQA?: () => void;
    isCommittingQA?: boolean;
    onOverrideQA?: (reason: string) => Promise<void>;
    specApproved?: boolean;
    // Lock & Export flow
    matterStatus?: string;
    onLockForExport?: () => void;
    isLocking?: boolean;
    onExportDocx?: () => void;
    isExporting?: boolean;
    onExportPdf?: () => void;
    isExportingPdf?: boolean;
    // Claims editing
    isClaimsEditable?: boolean;
    claimVersionId?: string;
    onEditClaim?: (nodeId: string, patch: { text?: string; type?: string; category?: string; dependencies?: string[] }) => Promise<void>;
    onAddClaim?: (body: { type: string; text: string; category?: string; dependencies?: string[] }) => Promise<void>;
    onDeleteClaim?: (nodeId: string) => Promise<void>;
    // Spec editing
    isSpecEditable?: boolean;
    specVersionId?: string;
    onEditSpecParagraph?: (paragraphId: string, patch: { text?: string; section?: string; claim_references?: string[] }) => Promise<void>;
    onAddSpecParagraph?: (body: { section: string; text: string; claim_references?: string[]; after_paragraph_id?: string }) => Promise<void>;
    onDeleteSpecParagraph?: (paragraphId: string) => Promise<void>;
}

const TABS: { id: ArtifactTab; label: string; icon: React.ElementType }[] = [
    { id: 'brief', label: 'Brief', icon: UploadCloud },
    { id: 'claims', label: 'Claims', icon: PenTool },
    { id: 'risk', label: 'Risk', icon: Shield },
    { id: 'spec', label: 'Spec', icon: BookOpen },
    { id: 'qa', label: 'QA', icon: CheckCircle },
    { id: 'wrapper', label: 'File Wrapper', icon: FolderOpen },
    { id: 'draft', label: 'Draft', icon: FileText },
];

// ---- Spec Viewer ----
const SECTION_LABELS: Record<string, string> = {
    technical_field: 'Technical Field',
    background: 'Background',
    summary: 'Summary',
    detailed_description: 'Detailed Description',
    definitions: 'Definitions',
    figure_descriptions: 'Figure Descriptions',
    abstract: 'Abstract',
};

function SpecViewer({ specVersion, onGenerateSpec, isGeneratingSpec, onCommitSpec, isCommittingSpec, riskApproved, onAddToChat, isEditable, onEditParagraph, onAddParagraph, onDeleteParagraph }: {
    specVersion?: SpecVersion | null;
    onGenerateSpec?: () => void;
    isGeneratingSpec?: boolean;
    onCommitSpec?: () => void;
    isCommittingSpec?: boolean;
    riskApproved?: boolean;
    onAddToChat?: (text: string) => void;
    isEditable?: boolean;
    onEditParagraph?: (paragraphId: string, patch: { text?: string; section?: string; claim_references?: string[] }) => Promise<void>;
    onAddParagraph?: (body: { section: string; text: string; claim_references?: string[]; after_paragraph_id?: string }) => Promise<void>;
    onDeleteParagraph?: (paragraphId: string) => Promise<void>;
}) {
    const [editingParaId, setEditingParaId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [editSection, setEditSection] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [addAfterSection, setAddAfterSection] = useState<string | null>(null);
    const [addText, setAddText] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Empty state
    if (!specVersion) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', padding: 40, gap: 16,
            }}>
                <BookOpen size={32} style={{ color: 'var(--color-content-text-muted)' }} />
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-content-text-secondary)', textAlign: 'center' }}>
                    No specification yet.
                    {!riskApproved && <><br />Risk analysis must be approved before generating the specification.</>}
                </p>
                {riskApproved && onGenerateSpec && (
                    <button
                        onClick={onGenerateSpec}
                        disabled={isGeneratingSpec}
                        style={{
                            padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                            border: 'none', background: 'var(--color-accent-500)',
                            color: 'white', fontSize: 13, fontWeight: 600,
                            cursor: isGeneratingSpec ? 'wait' : 'pointer',
                            opacity: isGeneratingSpec ? 0.7 : 1,
                        }}
                    >
                        {isGeneratingSpec ? 'Generating Specification...' : 'Generate Specification'}
                    </button>
                )}
            </div>
        );
    }

    const doc = specVersion.content_data;

    const groupedSections = doc.sections.reduce<Record<string, typeof doc.sections>>((acc, para) => {
        if (!acc[para.section]) acc[para.section] = [];
        acc[para.section].push(para);
        return acc;
    }, {});

    const sectionOrder = ['technical_field', 'background', 'summary', 'detailed_description', 'definitions', 'figure_descriptions', 'abstract'];
    const orderedKeys = sectionOrder.filter(k => groupedSections[k]);

    const handleStartEdit = (para: SpecParagraph) => {
        setEditingParaId(para.id);
        setEditText(para.text);
        setEditSection(para.section);
    };

    const handleSaveEdit = async () => {
        if (!editingParaId || !onEditParagraph) return;
        setIsSaving(true);
        try {
            const origPara = doc.sections.find(p => p.id === editingParaId);
            const patch: { text?: string; section?: string } = {};
            if (editText !== origPara?.text) patch.text = editText;
            if (editSection !== origPara?.section) patch.section = editSection;
            if (Object.keys(patch).length > 0) {
                await onEditParagraph(editingParaId, patch);
            }
            setEditingParaId(null);
        } catch (err) {
            console.error("Failed to edit paragraph", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteParagraph = async (paraId: string) => {
        if (!onDeleteParagraph) return;
        setIsSaving(true);
        try {
            await onDeleteParagraph(paraId);
            setConfirmDeleteId(null);
        } catch (err) {
            console.error("Failed to delete paragraph", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddParagraph = async (sectionKey: string, afterId?: string) => {
        if (!onAddParagraph || !addText.trim()) return;
        setIsAdding(true);
        try {
            await onAddParagraph({ section: sectionKey, text: addText, after_paragraph_id: afterId });
            setAddText('');
            setAddAfterSection(null);
        } catch (err) {
            console.error("Failed to add paragraph", err);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div style={{ padding: 28, maxWidth: 800 }}>
            {/* Header */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} style={{ color: 'var(--color-accent-500)' }} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-content-text)' }}>
                    {doc.title || 'Generated Specification'}
                </h3>
                {!specVersion.is_authoritative && riskApproved && onGenerateSpec && (
                    <button
                        onClick={onGenerateSpec}
                        disabled={isGeneratingSpec}
                        style={{
                            marginLeft: 'auto', padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-content-border)', background: 'var(--color-content-surface)',
                            color: 'var(--color-content-text)', fontSize: 12, fontWeight: 500,
                            cursor: isGeneratingSpec ? 'wait' : 'pointer',
                        }}
                    >
                        {isGeneratingSpec ? 'Re-generating...' : 'Re-generate'}
                    </button>
                )}
            </div>

            {/* Sections */}
            {orderedKeys.map((sectionKey) => (
                <div key={sectionKey} style={{ marginBottom: 24 }}>
                    <h4 style={{
                        fontSize: 12, fontWeight: 700, color: 'var(--color-content-text)',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        marginBottom: 8,
                        paddingBottom: 6,
                        borderBottom: '1px solid var(--color-content-border)',
                    }}>
                        {SECTION_LABELS[sectionKey] || sectionKey}
                    </h4>
                    {groupedSections[sectionKey].map((para) => (
                        <div key={para.id} style={{ marginBottom: 12, position: 'relative' }}>
                            {editingParaId === para.id ? (
                                <div style={{ border: '1px solid var(--color-accent-300)', borderRadius: 'var(--radius-sm)', padding: 10 }}>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                        <select
                                            value={editSection}
                                            onChange={e => setEditSection(e.target.value)}
                                            style={{ fontSize: 11, padding: '4px 6px', borderRadius: 2, border: '1px solid var(--color-content-border)' }}
                                        >
                                            {sectionOrder.map(s => (
                                                <option key={s} value={s}>{SECTION_LABELS[s] || s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <textarea
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        rows={6}
                                        style={{
                                            width: '100%', fontSize: 13, lineHeight: 1.8, padding: 8, marginBottom: 8,
                                            border: '1px solid var(--color-content-border)', borderRadius: 2,
                                            background: 'var(--color-content-bg)', color: 'var(--color-content-text)',
                                            resize: 'vertical', fontFamily: 'inherit',
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={isSaving}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 4,
                                                padding: '4px 12px', borderRadius: 2, border: 'none',
                                                background: 'var(--color-accent-500)', color: 'white',
                                                fontSize: 12, fontWeight: 600, cursor: isSaving ? 'wait' : 'pointer',
                                            }}
                                        >
                                            <Save size={12} />
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => setEditingParaId(null)}
                                            style={{
                                                padding: '4px 12px', borderRadius: 2,
                                                border: '1px solid var(--color-content-border)', background: 'var(--color-content-surface)',
                                                color: 'var(--color-content-text)', fontSize: 12, cursor: 'pointer',
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                        <div style={{ flex: 1 }}>
                                            <HoverableText text={para.text} onAddToChat={onAddToChat}>
                                                <p style={{
                                                    margin: 0, fontSize: 13, lineHeight: 1.8,
                                                    color: 'var(--color-content-text-secondary)',
                                                    whiteSpace: 'pre-wrap',
                                                }}>
                                                    {para.text}
                                                </p>
                                            </HoverableText>
                                        </div>
                                        {isEditable && (
                                            <div style={{ display: 'flex', gap: 2, flexShrink: 0, marginTop: 2 }}>
                                                <button
                                                    onClick={() => handleStartEdit(para)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-content-text-muted)' }}
                                                    title="Edit paragraph"
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(para.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-content-text-muted)' }}
                                                    title="Delete paragraph"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {confirmDeleteId === para.id && (
                                        <div style={{
                                            padding: '6px 10px', marginTop: 6, borderRadius: 2,
                                            background: 'var(--color-danger-bg, #fef2f2)', border: '1px solid var(--color-danger, #ef4444)',
                                            display: 'flex', alignItems: 'center', gap: 8,
                                        }}>
                                            <span style={{ fontSize: 12, color: 'var(--color-danger)', flex: 1 }}>Delete this paragraph?</span>
                                            <button
                                                onClick={() => handleDeleteParagraph(para.id)}
                                                disabled={isSaving}
                                                style={{
                                                    padding: '2px 10px', borderRadius: 2, border: 'none',
                                                    background: 'var(--color-danger, #ef4444)', color: 'white',
                                                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                                }}
                                            >
                                                {isSaving ? 'Deleting...' : 'Confirm'}
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteId(null)}
                                                style={{
                                                    padding: '2px 10px', borderRadius: 2,
                                                    border: '1px solid var(--color-content-border)', background: 'var(--color-content-surface)',
                                                    color: 'var(--color-content-text)', fontSize: 11, cursor: 'pointer',
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                            {para.claim_references.length > 0 && editingParaId !== para.id && (
                                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                                    {para.claim_references.map((ref, i) => (
                                        <span key={i} style={{
                                            fontSize: 10, fontWeight: 600,
                                            padding: '2px 6px', borderRadius: 'var(--radius-sm)',
                                            background: 'var(--color-accent-50)', color: 'var(--color-accent-700)',
                                        }}>
                                            Claim {ref}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Paragraph button at end of each section */}
                    {isEditable && onAddParagraph && (
                        <>
                            {addAfterSection === sectionKey ? (
                                <div style={{
                                    marginTop: 8, padding: 10, borderRadius: 2,
                                    border: '1px solid var(--color-content-border)',
                                    background: 'var(--color-content-surface)',
                                }}>
                                    <textarea
                                        placeholder="New paragraph text..."
                                        value={addText}
                                        onChange={e => setAddText(e.target.value)}
                                        rows={4}
                                        style={{
                                            width: '100%', fontSize: 13, lineHeight: 1.8, padding: 8, marginBottom: 8,
                                            border: '1px solid var(--color-content-border)', borderRadius: 2,
                                            background: 'var(--color-content-bg)', color: 'var(--color-content-text)',
                                            resize: 'vertical', fontFamily: 'inherit',
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                            onClick={() => {
                                                const lastPara = groupedSections[sectionKey]?.[groupedSections[sectionKey].length - 1];
                                                handleAddParagraph(sectionKey, lastPara?.id);
                                            }}
                                            disabled={isAdding || !addText.trim()}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 4,
                                                padding: '4px 12px', borderRadius: 2, border: 'none',
                                                background: 'var(--color-accent-500)', color: 'white',
                                                fontSize: 12, fontWeight: 600, cursor: isAdding ? 'wait' : 'pointer',
                                                opacity: (!addText.trim() || isAdding) ? 0.6 : 1,
                                            }}
                                        >
                                            <Plus size={12} />
                                            {isAdding ? 'Adding...' : 'Add'}
                                        </button>
                                        <button
                                            onClick={() => { setAddAfterSection(null); setAddText(''); }}
                                            style={{
                                                padding: '4px 12px', borderRadius: 2,
                                                border: '1px solid var(--color-content-border)', background: 'var(--color-content-surface)',
                                                color: 'var(--color-content-text)', fontSize: 12, cursor: 'pointer',
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAddAfterSection(sectionKey)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 4, marginTop: 6,
                                        padding: '4px 10px', borderRadius: 2,
                                        border: '1px dashed var(--color-content-border)',
                                        background: 'transparent', color: 'var(--color-content-text-muted)',
                                        fontSize: 11, cursor: 'pointer',
                                    }}
                                >
                                    <Plus size={12} />
                                    Add Paragraph
                                </button>
                            )}
                        </>
                    )}
                </div>
            ))}

            {/* Commit / Approved */}
            {!specVersion.is_authoritative && onCommitSpec && (
                <button
                    onClick={onCommitSpec}
                    disabled={isCommittingSpec}
                    style={{
                        padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                        border: 'none', background: 'var(--color-accent-500)',
                        color: 'white', fontSize: 13, fontWeight: 600,
                        cursor: isCommittingSpec ? 'wait' : 'pointer',
                        opacity: isCommittingSpec ? 0.7 : 1,
                    }}
                >
                    {isCommittingSpec ? 'Committing...' : 'Approve Specification'}
                </button>
            )}
            {specVersion.is_authoritative && (
                <div style={{
                    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-accent-50)', color: 'var(--color-accent-700)',
                    fontSize: 13, fontWeight: 600, display: 'inline-block',
                }}>
                    Specification Approved
                </div>
            )}
        </div>
    );
}

// ---- QA Viewer ----
function AttorneyOverridePanel({ onOverride, isCommitting }: { onOverride: (reason: string) => Promise<void>; isCommitting?: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) return;
        setSubmitting(true);
        try {
            await onOverride(reason.trim());
        } finally {
            setSubmitting(false);
            setExpanded(false);
            setReason('');
        }
    };

    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                disabled={isCommitting}
                style={{
                    marginTop: 8, padding: '6px 16px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-danger)', background: 'transparent',
                    color: 'var(--color-danger)', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', width: 'fit-content',
                }}
            >
                Attorney Override — Bypass Errors
            </button>
        );
    }

    return (
        <div style={{
            marginTop: 8, padding: 16, borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-danger)',
            background: 'var(--color-danger-bg, #fef2f2)',
        }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-danger)', marginBottom: 8 }}>
                <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Attorney Override
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-content-text-secondary)', margin: '0 0 8px', lineHeight: 1.5 }}>
                This will approve the QA report despite {' '}
                blocking errors. A reason is required for the audit trail.
            </p>
            <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for overriding QA errors (required)..."
                rows={3}
                style={{
                    width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-content-border)',
                    background: 'var(--color-content-surface)',
                    color: 'var(--color-content-text)',
                    fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                    onClick={handleSubmit}
                    disabled={!reason.trim() || submitting}
                    style={{
                        padding: '6px 16px', borderRadius: 'var(--radius-sm)',
                        border: 'none', background: 'var(--color-danger)',
                        color: 'white', fontSize: 12, fontWeight: 600,
                        cursor: (!reason.trim() || submitting) ? 'not-allowed' : 'pointer',
                        opacity: (!reason.trim() || submitting) ? 0.6 : 1,
                    }}
                >
                    {submitting ? 'Overriding...' : 'Override & Approve'}
                </button>
                <button
                    onClick={() => { setExpanded(false); setReason(''); }}
                    style={{
                        padding: '6px 16px', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-content-border)', background: 'var(--color-content-surface)',
                        color: 'var(--color-content-text)', fontSize: 12, fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

function QAViewer({ qaVersion, onRunQA, isRunningQA, onCommitQA, isCommittingQA, onOverrideQA, specApproved, matterStatus, onLockForExport, isLocking, onExportDocx, isExporting }: {
    qaVersion?: QAReportVersion | null;
    onRunQA?: () => void;
    isRunningQA?: boolean;
    onCommitQA?: () => void;
    isCommittingQA?: boolean;
    onOverrideQA?: (reason: string) => Promise<void>;
    specApproved?: boolean;
    matterStatus?: string;
    onLockForExport?: () => void;
    isLocking?: boolean;
    onExportDocx?: () => void;
    isExporting?: boolean;
}) {
    if (!qaVersion) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', padding: 40, gap: 16,
            }}>
                <CheckCircle size={32} style={{ color: 'var(--color-content-text-muted)' }} />
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-content-text-secondary)', textAlign: 'center' }}>
                    No QA validation has been run yet.
                    {!specApproved && <><br />The specification must be approved before running QA.</>}
                </p>
                {specApproved && onRunQA && (
                    <button
                        onClick={onRunQA}
                        disabled={isRunningQA}
                        style={{
                            padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                            border: 'none', background: 'var(--color-accent-500)',
                            color: 'white', fontSize: 13, fontWeight: 600,
                            cursor: isRunningQA ? 'wait' : 'pointer',
                            opacity: isRunningQA ? 0.7 : 1,
                        }}
                    >
                        {isRunningQA ? 'Running QA Validation...' : 'Run QA Validation'}
                    </button>
                )}
            </div>
        );
    }

    const report = qaVersion.report_data;

    return (
        <div style={{ padding: 28, maxWidth: 800 }}>
            {/* Header */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} style={{ color: 'var(--color-accent-500)' }} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-content-text)' }}>QA Validation</h3>
                {!qaVersion.is_authoritative && specApproved && onRunQA && (
                    <button
                        onClick={onRunQA}
                        disabled={isRunningQA}
                        style={{
                            marginLeft: 'auto', padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-content-border)', background: 'var(--color-content-surface)',
                            color: 'var(--color-content-text)', fontSize: 12, fontWeight: 500,
                            cursor: isRunningQA ? 'wait' : 'pointer',
                        }}
                    >
                        {isRunningQA ? 'Re-running...' : 'Re-run QA'}
                    </button>
                )}
            </div>

            {/* Support Coverage Banner */}
            <div style={{
                padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 16,
                background: report.support_coverage_score >= 80 ? 'var(--color-accent-50)' : 'var(--color-warning-bg, #fff8e1)',
                border: `1px solid ${report.support_coverage_score >= 80 ? 'var(--color-accent-200)' : 'var(--color-warning, #f59e0b)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-content-text)', marginBottom: 2 }}>
                        Support Coverage Score
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-content-text-secondary)' }}>
                        {report.total_errors} error{report.total_errors !== 1 ? 's' : ''} &middot; {report.total_warnings} warning{report.total_warnings !== 1 ? 's' : ''}
                    </div>
                </div>
                <div style={{
                    fontSize: 24, fontWeight: 700,
                    color: report.support_coverage_score >= 80 ? 'var(--color-accent-700)' : 'var(--color-warning, #f59e0b)',
                }}>
                    {report.support_coverage_score}%
                </div>
            </div>

            {/* Findings — grouped by severity */}
            {(() => {
                const errors = report.findings.filter(f => f.severity === 'error');
                const warnings = report.findings.filter(f => f.severity === 'warning');

                const renderFinding = (finding: typeof report.findings[0], borderColor: string) => (
                    <div key={finding.id} style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-content-border)',
                        borderLeft: `3px solid ${borderColor}`,
                        background: 'var(--color-content-surface)',
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                        {finding.severity === 'error' ? (
                            <AlertCircle size={16} style={{ color: 'var(--color-danger)', marginTop: 2, flexShrink: 0 }} />
                        ) : (
                            <AlertTriangle size={16} style={{ color: 'var(--color-warning)', marginTop: 2, flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: 11, fontWeight: 600,
                                color: finding.severity === 'error' ? 'var(--color-danger)' : 'var(--color-warning)',
                                textTransform: 'uppercase', letterSpacing: '0.03em',
                                marginBottom: 2,
                            }}>
                                {finding.location}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-content-text)', marginBottom: 2 }}>
                                {finding.title}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--color-content-text-secondary)', lineHeight: 1.5 }}>
                                {finding.description}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-accent-600)', marginTop: 4, fontStyle: 'italic' }}>
                                {finding.recommendation}
                            </div>
                        </div>
                    </div>
                );

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                        {errors.length > 0 && (
                            <div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
                                    fontSize: 12, fontWeight: 700, color: 'var(--color-danger)',
                                    textTransform: 'uppercase', letterSpacing: '0.04em',
                                }}>
                                    <AlertCircle size={14} />
                                    Errors — Must Resolve ({errors.length})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {errors.map(f => renderFinding(f, 'var(--color-danger)'))}
                                </div>
                            </div>
                        )}
                        {warnings.length > 0 && (
                            <div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
                                    fontSize: 12, fontWeight: 700, color: 'var(--color-warning, #f59e0b)',
                                    textTransform: 'uppercase', letterSpacing: '0.04em',
                                }}>
                                    <AlertTriangle size={14} />
                                    Warnings ({warnings.length})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {warnings.map(f => renderFinding(f, 'var(--color-warning, #f59e0b)'))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Summary */}
            {report.summary && (
                <div style={{
                    padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 16,
                    background: 'var(--color-content-surface)',
                    border: '1px solid var(--color-content-border)',
                }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-content-text)', marginBottom: 4 }}>Summary</div>
                    <div style={{ fontSize: 13, color: 'var(--color-content-text-secondary)', lineHeight: 1.6 }}>{report.summary}</div>
                </div>
            )}

            {/* Commit Button */}
            {!qaVersion.is_authoritative && onCommitQA && (
                <button
                    onClick={onCommitQA}
                    disabled={isCommittingQA || !report.can_export}
                    title={!report.can_export ? 'Resolve all blocking errors before committing' : 'Approve QA results'}
                    style={{
                        padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: report.can_export ? 'var(--color-accent-500)' : 'var(--color-content-text-muted)',
                        color: 'white', fontSize: 13, fontWeight: 600,
                        cursor: (isCommittingQA || !report.can_export) ? 'not-allowed' : 'pointer',
                        opacity: (isCommittingQA || !report.can_export) ? 0.6 : 1,
                    }}
                >
                    {isCommittingQA ? 'Committing...' : !report.can_export ? 'Blocking Errors — Cannot Commit' : 'Approve QA Results'}
                </button>
            )}

            {/* Attorney Override — shown when there are blocking errors */}
            {!qaVersion.is_authoritative && !report.can_export && onOverrideQA && (
                <AttorneyOverridePanel onOverride={onOverrideQA} isCommitting={isCommittingQA} />
            )}
            {qaVersion.is_authoritative && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{
                        padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-accent-50)', color: 'var(--color-accent-700)',
                        fontSize: 13, fontWeight: 600, display: 'inline-block',
                    }}>
                        QA Approved
                    </div>
                    {matterStatus === 'QA_COMPLETE' && onLockForExport && (
                        <button
                            onClick={onLockForExport}
                            disabled={isLocking}
                            style={{
                                padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                                border: 'none', background: 'var(--color-accent-500)',
                                color: 'white', fontSize: 13, fontWeight: 600,
                                cursor: isLocking ? 'wait' : 'pointer',
                                opacity: isLocking ? 0.7 : 1,
                                width: 'fit-content',
                            }}
                        >
                            {isLocking ? 'Locking...' : 'Lock for Export'}
                        </button>
                    )}
                    {matterStatus === 'LOCKED_FOR_EXPORT' && onExportDocx && (
                        <button
                            onClick={onExportDocx}
                            disabled={isExporting}
                            style={{
                                padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                                border: 'none', background: 'var(--color-accent-700)',
                                color: 'white', fontSize: 13, fontWeight: 600,
                                cursor: isExporting ? 'wait' : 'pointer',
                                opacity: isExporting ? 0.7 : 1,
                                width: 'fit-content',
                            }}
                        >
                            {isExporting ? 'Generating DOCX...' : 'Export DOCX'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ---- Draft Preview ----
function DraftPreview({ briefVersion, claimVersion, specVersion, matterStatus, matterTitle, onExportDocx, isExporting, onExportPdf, isExportingPdf }: {
    briefVersion?: BriefVersion | null;
    claimVersion?: ClaimGraphVersion | null;
    specVersion?: SpecVersion | null;
    matterStatus?: string;
    matterTitle?: string;
    onExportDocx?: () => void;
    isExporting?: boolean;
    onExportPdf?: () => void;
    isExportingPdf?: boolean;
}) {
    const isReady = matterStatus === 'QA_COMPLETE' || matterStatus === 'LOCKED_FOR_EXPORT';

    if (!isReady) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', padding: 40, gap: 16,
            }}>
                <FileText size={32} style={{ color: 'var(--color-content-text-muted)' }} />
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-content-text-secondary)', textAlign: 'center' }}>
                    Complete QA validation to preview the draft patent application.
                </p>
            </div>
        );
    }

    const brief = briefVersion?.structure_data;
    const claims = claimVersion?.graph_data?.nodes || [];
    const spec = specVersion?.content_data;

    // Group spec sections
    const specSections: Record<string, { id: string; text: string; claim_references: string[] }[]> = {};
    if (spec?.sections) {
        for (const para of spec.sections) {
            if (!specSections[para.section]) specSections[para.section] = [];
            specSections[para.section].push(para);
        }
    }

    const specSectionOrder = [
        ['technical_field', 'Technical Field'],
        ['background', 'Background of the Invention'],
        ['summary', 'Summary of the Invention'],
        ['detailed_description', 'Detailed Description of Preferred Embodiments'],
        ['definitions', 'Definitions'],
        ['figure_descriptions', 'Description of Figures'],
    ] as const;

    return (
        <div style={{ padding: 28, maxWidth: 800 }}>
            {/* Export buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {matterStatus === 'LOCKED_FOR_EXPORT' && onExportDocx && (
                    <button
                        onClick={onExportDocx}
                        disabled={isExporting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 16px', borderRadius: 'var(--radius-sm)',
                            border: 'none', background: 'var(--color-accent-500)',
                            color: 'white', fontSize: 12, fontWeight: 600,
                            cursor: isExporting ? 'wait' : 'pointer',
                            opacity: isExporting ? 0.7 : 1,
                        }}
                    >
                        <Download size={14} />
                        {isExporting ? 'Generating...' : 'Export DOCX'}
                    </button>
                )}
                {matterStatus === 'LOCKED_FOR_EXPORT' && onExportPdf && (
                    <button
                        onClick={onExportPdf}
                        disabled={isExportingPdf}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 16px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-content-border)', background: 'var(--color-content-surface)',
                            color: 'var(--color-content-text)', fontSize: 12, fontWeight: 600,
                            cursor: isExportingPdf ? 'wait' : 'pointer',
                            opacity: isExportingPdf ? 0.7 : 1,
                        }}
                    >
                        <Download size={14} />
                        {isExportingPdf ? 'Generating...' : 'Export PDF'}
                    </button>
                )}
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-content-text)', textAlign: 'center', marginBottom: 8 }}>
                {matterTitle || spec?.title || 'Patent Application'}
            </h1>

            {/* Brief info */}
            {brief && (
                <div style={{ textAlign: 'center', marginBottom: 24, fontSize: 13, color: 'var(--color-content-text-secondary)' }}>
                    {brief.technical_field && <div>Technical Field: {brief.technical_field}</div>}
                </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-content-border)', margin: '16px 0' }} />

            {/* Claims Section */}
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-content-text)', marginBottom: 12 }}>Claims</h2>
            {claims.length > 0 ? claims.map((node: any, i: number) => (
                <div key={node.id} style={{ marginBottom: 10 }}>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: 'var(--color-content-text-secondary)' }}>
                        <strong>{i + 1}.</strong> {node.text}
                    </p>
                </div>
            )) : (
                <p style={{ fontSize: 13, color: 'var(--color-content-text-muted)' }}>No claims available.</p>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-content-border)', margin: '16px 0' }} />

            {/* Specification Sections */}
            {specSectionOrder.map(([key, heading]) => {
                const paras = specSections[key];
                if (!paras || paras.length === 0) return null;
                return (
                    <div key={key} style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-content-text)', marginBottom: 10 }}>{heading}</h2>
                        {paras.map(para => (
                            <p key={para.id} style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.8, color: 'var(--color-content-text-secondary)' }}>
                                {para.text}
                            </p>
                        ))}
                    </div>
                );
            })}

            {/* Abstract */}
            {specSections['abstract'] && specSections['abstract'].length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--color-content-border)', margin: '16px 0' }} />
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-content-text)', marginBottom: 10 }}>Abstract</h2>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: 'var(--color-content-text-secondary)' }}>
                        {specSections['abstract'].map(p => p.text).join(' ')}
                    </p>
                </div>
            )}
        </div>
    );
}

// ---- Brief View ----
function BriefView({ matterId, briefVersion, onUploadSuccess, onApprove, isApproving }: {
    matterId: string;
    briefVersion?: BriefVersion | null;
    onUploadSuccess?: (data: any) => void;
    onApprove?: () => void;
    isApproving?: boolean;
}) {
    if (briefVersion?.structure_data) {
        return (
            <div style={{ padding: 28 }}>
                <BriefViewer
                    data={briefVersion.structure_data}
                    isAuthoritative={briefVersion.is_authoritative}
                    onApprove={onApprove}
                    isApproving={isApproving}
                />
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', padding: 40,
        }}>
            <BriefUpload
                matterId={matterId}
                onUploadSuccess={onUploadSuccess || (() => {})}
            />
        </div>
    );
}

// ---- Main Component ----
export default function ArtifactPreview({
    activeTab, onTabChange, claims = [], onAddToChat, fileWrapperDocs = [],
    matterId, briefVersion, onBriefUploadSuccess, onApproveBrief, isApprovingBrief,
    claimVersion, onGenerateClaims, isGeneratingClaims, onCommitClaims, isCommittingClaims, briefApproved,
    highlightedClaimId,
    riskVersion, onGenerateRisk, isGeneratingRisk, onCommitRisk, isCommittingRisk, onReEvaluateRisk, isReEvaluatingRisk, claimsApproved,
    specVersion, onGenerateSpec, isGeneratingSpec, onCommitSpec, isCommittingSpec, riskApproved,
    qaVersion, onRunQA, isRunningQA, onCommitQA, isCommittingQA, onOverrideQA, specApproved,
    matterStatus, onLockForExport, isLocking, onExportDocx, isExporting, onExportPdf, isExportingPdf,
    isClaimsEditable, claimVersionId, onEditClaim, onAddClaim, onDeleteClaim,
    isSpecEditable, specVersionId, onEditSpecParagraph, onAddSpecParagraph, onDeleteSpecParagraph,
}: ArtifactPreviewProps) {
    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'var(--color-content-bg)',
            minWidth: 0,
        }}>
            {/* Tab Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                height: 44,
                borderBottom: '1px solid var(--color-content-border)',
                background: 'var(--color-content-surface)',
                flexShrink: 0,
                gap: 2,
            }}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 14px',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: isActive ? 'var(--color-accent-50)' : 'transparent',
                                color: isActive ? 'var(--color-accent-700)' : 'var(--color-content-text-muted)',
                                fontSize: 12, fontWeight: isActive ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.12s ease',
                                position: 'relative',
                            }}
                        >
                            <Icon size={14} />
                            {tab.label}
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: -7,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '60%',
                                    height: 2,
                                    borderRadius: 1,
                                    background: 'var(--color-accent-500)',
                                }} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {activeTab === 'brief' && (
                    <BriefView
                        matterId={matterId}
                        briefVersion={briefVersion}
                        onUploadSuccess={onBriefUploadSuccess}
                        onApprove={onApproveBrief}
                        isApproving={isApprovingBrief}
                    />
                )}
                {activeTab === 'claims' && (
                    <ClaimTree
                        claims={claims}
                        onAddToChat={onAddToChat}
                        isAuthoritative={claimVersion?.is_authoritative}
                        onCommit={onCommitClaims}
                        isCommitting={isCommittingClaims}
                        onGenerate={onGenerateClaims}
                        isGenerating={isGeneratingClaims}
                        briefApproved={briefApproved}
                        highlightedClaimId={highlightedClaimId}
                        isEditable={isClaimsEditable}
                        onEditClaim={onEditClaim}
                        onAddClaim={onAddClaim}
                        onDeleteClaim={onDeleteClaim}
                    />
                )}
                {activeTab === 'risk' && (
                    <RiskDashboard
                        riskVersion={riskVersion}
                        onGenerateRisk={onGenerateRisk}
                        isGeneratingRisk={isGeneratingRisk}
                        onCommitRisk={onCommitRisk}
                        isCommittingRisk={isCommittingRisk}
                        onReEvaluateRisk={onReEvaluateRisk}
                        isReEvaluatingRisk={isReEvaluatingRisk}
                        claimsApproved={claimsApproved}
                        specApproved={specApproved}
                        onAddToChat={onAddToChat}
                    />
                )}
                {activeTab === 'spec' && (
                    <SpecViewer
                        specVersion={specVersion}
                        onGenerateSpec={onGenerateSpec}
                        isGeneratingSpec={isGeneratingSpec}
                        onCommitSpec={onCommitSpec}
                        isCommittingSpec={isCommittingSpec}
                        riskApproved={riskApproved}
                        onAddToChat={onAddToChat}
                        isEditable={isSpecEditable}
                        onEditParagraph={onEditSpecParagraph}
                        onAddParagraph={onAddSpecParagraph}
                        onDeleteParagraph={onDeleteSpecParagraph}
                    />
                )}
                {activeTab === 'qa' && (
                    <QAViewer
                        qaVersion={qaVersion}
                        onRunQA={onRunQA}
                        isRunningQA={isRunningQA}
                        onCommitQA={onCommitQA}
                        isCommittingQA={isCommittingQA}
                        onOverrideQA={onOverrideQA}
                        specApproved={specApproved}
                        matterStatus={matterStatus}
                        onLockForExport={onLockForExport}
                        isLocking={isLocking}
                        onExportDocx={onExportDocx}
                        isExporting={isExporting}
                    />
                )}
                {activeTab === 'draft' && (
                    <DraftPreview
                        briefVersion={briefVersion}
                        claimVersion={claimVersion}
                        specVersion={specVersion}
                        matterStatus={matterStatus}
                        onExportDocx={onExportDocx}
                        isExporting={isExporting}
                        onExportPdf={onExportPdf}
                        isExportingPdf={isExportingPdf}
                    />
                )}
                {activeTab === 'wrapper' && <FileWrapperViewer documents={fileWrapperDocs} onNavigate={(tab) => onTabChange(tab as ArtifactTab)} />}
            </div>
        </div>
    );
}
