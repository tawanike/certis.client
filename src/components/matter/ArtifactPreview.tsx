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
import { type Claim, claimTree as defaultClaims, specSections, qaItems } from '@/data/mockData';
import { DocumentResponse, BriefVersion, ClaimGraphVersion } from '@/types';

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
function QAViewer() {
    return (
        <div style={{ padding: 28, maxWidth: 800 }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} style={{ color: 'var(--color-accent-500)' }} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-content-text)' }}>QA Validation</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {qaItems.map((item) => (
                    <div key={item.id} style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-content-border)',
                        background: 'var(--color-content-surface)',
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                        {item.type === 'error' ? (
                            <AlertCircle size={16} style={{ color: 'var(--color-danger)', marginTop: 2, flexShrink: 0 }} />
                        ) : (
                            <AlertTriangle size={16} style={{ color: 'var(--color-warning)', marginTop: 2, flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: 11, fontWeight: 600,
                                color: item.type === 'error' ? 'var(--color-danger)' : 'var(--color-warning)',
                                textTransform: 'uppercase', letterSpacing: '0.03em',
                                marginBottom: 2,
                            }}>
                                {item.location}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--color-content-text-secondary)', lineHeight: 1.5 }}>
                                {item.message}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
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
                    />
                )}
                {activeTab === 'risk' && <RiskDashboard onAddToChat={onAddToChat} />}
                {activeTab === 'spec' && <SpecViewer onAddToChat={onAddToChat} />}
                {activeTab === 'qa' && <QAViewer />}
                {activeTab === 'wrapper' && <FileWrapperViewer documents={fileWrapperDocs} onNavigate={(tab) => onTabChange(tab as ArtifactTab)} />}
            </div>
        </div>
    );
}
