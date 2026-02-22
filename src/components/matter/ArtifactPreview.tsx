'use client';

import React from 'react';
import {
    PenTool,
    Shield,
    BookOpen,
    CheckCircle,
    UploadCloud,
    AlertTriangle,
    AlertCircle,
    FolderOpen,
} from 'lucide-react';
import ClaimTree from '@/components/ClaimTree';
import RiskDashboard from '@/components/RiskDashboard';
import BriefUpload from '@/components/BriefUpload';
import BriefViewer from '@/components/BriefViewer';
import HoverableText from '@/components/HoverableText';
import FileWrapperViewer from './FileWrapperViewer';
import { type Claim, claimTree as defaultClaims, specSections } from '@/data/mockData';
import { DocumentResponse, BriefVersion, ClaimGraphVersion, QAReportVersion } from '@/types';

type ArtifactTab = 'brief' | 'claims' | 'risk' | 'spec' | 'qa' | 'wrapper';

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
    // QA flow
    qaVersion?: QAReportVersion | null;
    onRunQA?: () => void;
    isRunningQA?: boolean;
    onCommitQA?: () => void;
    isCommittingQA?: boolean;
    specApproved?: boolean;
    // Lock & Export flow
    matterStatus?: string;
    onLockForExport?: () => void;
    isLocking?: boolean;
    onExportDocx?: () => void;
    isExporting?: boolean;
}

const TABS: { id: ArtifactTab; label: string; icon: React.ElementType }[] = [
    { id: 'brief', label: 'Brief', icon: UploadCloud },
    { id: 'claims', label: 'Claims', icon: PenTool },
    { id: 'risk', label: 'Risk', icon: Shield },
    { id: 'spec', label: 'Spec', icon: BookOpen },
    { id: 'qa', label: 'QA', icon: CheckCircle },
    { id: 'wrapper', label: 'File Wrapper', icon: FolderOpen },
];

// ---- Spec Viewer ----
function SpecViewer({ onAddToChat }: { onAddToChat?: (text: string) => void }) {
    const sections = [
        { title: 'Background', content: specSections.background },
        { title: 'Summary', content: specSections.summary },
        { title: 'Detailed Description', content: specSections.detailedDescription },
        { title: 'Abstract', content: specSections.abstract },
    ];
    return (
        <div style={{ padding: 28, maxWidth: 800 }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} style={{ color: 'var(--color-accent-500)' }} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-content-text)' }}>Generated Specification</h3>
            </div>
            {sections.map((section, i) => (
                <div key={i} style={{ marginBottom: 24 }}>
                    <h4 style={{
                        fontSize: 12, fontWeight: 700, color: 'var(--color-content-text)',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        marginBottom: 8,
                        paddingBottom: 6,
                        borderBottom: '1px solid var(--color-content-border)',
                    }}>
                        {section.title}
                    </h4>
                    <HoverableText text={section.content} onAddToChat={onAddToChat}>
                        <p style={{
                            margin: 0, fontSize: 13, lineHeight: 1.8,
                            color: 'var(--color-content-text-secondary)',
                            whiteSpace: 'pre-wrap',
                        }}>
                            {section.content}
                        </p>
                    </HoverableText>
                </div>
            ))}
        </div>
    );
}

// ---- QA Viewer ----
function QAViewer({ qaVersion, onRunQA, isRunningQA, onCommitQA, isCommittingQA, specApproved, matterStatus, onLockForExport, isLocking, onExportDocx, isExporting }: {
    qaVersion?: QAReportVersion | null;
    onRunQA?: () => void;
    isRunningQA?: boolean;
    onCommitQA?: () => void;
    isCommittingQA?: boolean;
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

            {/* Findings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {report.findings.map((finding) => (
                    <div key={finding.id} style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-content-border)',
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
                ))}
            </div>

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
    activeTab, onTabChange, claims = defaultClaims, onAddToChat, fileWrapperDocs = [],
    matterId, briefVersion, onBriefUploadSuccess, onApproveBrief, isApprovingBrief,
    claimVersion, onGenerateClaims, isGeneratingClaims, onCommitClaims, isCommittingClaims, briefApproved,
    highlightedClaimId,
    qaVersion, onRunQA, isRunningQA, onCommitQA, isCommittingQA, specApproved,
    matterStatus, onLockForExport, isLocking, onExportDocx, isExporting,
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
                    />
                )}
                {activeTab === 'risk' && <RiskDashboard onAddToChat={onAddToChat} />}
                {activeTab === 'spec' && <SpecViewer onAddToChat={onAddToChat} />}
                {activeTab === 'qa' && (
                    <QAViewer
                        qaVersion={qaVersion}
                        onRunQA={onRunQA}
                        isRunningQA={isRunningQA}
                        onCommitQA={onCommitQA}
                        isCommittingQA={isCommittingQA}
                        specApproved={specApproved}
                        matterStatus={matterStatus}
                        onLockForExport={onLockForExport}
                        isLocking={isLocking}
                        onExportDocx={onExportDocx}
                        isExporting={isExporting}
                    />
                )}
                {activeTab === 'wrapper' && <FileWrapperViewer documents={fileWrapperDocs} onNavigate={(tab) => onTabChange(tab as ArtifactTab)} />}
            </div>
        </div>
    );
}
