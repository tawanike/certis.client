'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import HoverableText from './HoverableText';
import { RiskAnalysisVersion } from '@/types';

function ScoreCircle({ score }: { score: number }) {
    const radius = 44;
    const stroke = 5;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const color = score >= 70 ? 'var(--color-accent-400)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-danger)';

    return (
        <div className="relative w-[110px] h-[110px]">
            <svg width={110} height={110} className="transform -rotate-90">
                <circle
                    cx={55}
                    cy={55}
                    r={radius}
                    fill="none"
                    stroke="var(--color-content-border)"
                    strokeWidth={stroke}
                />
                <circle
                    cx={55}
                    cy={55}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[var(--color-content-text)] leading-none">
                    {score}
                </span>
                <span className="text-[11px] font-medium text-[var(--color-content-text-muted)] mt-1">
                    /100
                </span>
            </div>
        </div>
    );
}

interface RiskDashboardProps {
    riskVersion?: RiskAnalysisVersion | null;
    onGenerateRisk?: () => void;
    isGeneratingRisk?: boolean;
    onCommitRisk?: () => void;
    isCommittingRisk?: boolean;
    claimsApproved?: boolean;
    onAddToChat?: (text: string) => void;
}

export default function RiskDashboard({
    riskVersion, onGenerateRisk, isGeneratingRisk, onCommitRisk, isCommittingRisk,
    claimsApproved, onAddToChat,
}: RiskDashboardProps) {
    // Empty state
    if (!riskVersion) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', padding: 40, gap: 16,
            }}>
                <Shield size={32} style={{ color: 'var(--color-content-text-muted)' }} />
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-content-text-secondary)', textAlign: 'center' }}>
                    No risk analysis yet.
                    {!claimsApproved && <><br />Claims must be approved before running risk analysis.</>}
                </p>
                {claimsApproved && onGenerateRisk && (
                    <button
                        onClick={onGenerateRisk}
                        disabled={isGeneratingRisk}
                        style={{
                            padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                            border: 'none', background: 'var(--color-accent-500)',
                            color: 'white', fontSize: 13, fontWeight: 600,
                            cursor: isGeneratingRisk ? 'wait' : 'pointer',
                            opacity: isGeneratingRisk ? 0.7 : 1,
                        }}
                    >
                        {isGeneratingRisk ? 'Running Risk Analysis...' : 'Run Risk Analysis'}
                    </button>
                )}
            </div>
        );
    }

    const analysis = riskVersion.analysis_data;
    const severityBadge = (severity: string) => {
        const map: Record<string, string> = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-info' };
        const label: Record<string, string> = { high: 'HIGH', medium: 'MEDIUM', low: 'LOW' };
        return <span className={`badge ${map[severity] || 'badge-info'}`}>{label[severity] || severity.toUpperCase()}</span>;
    };

    return (
        <div className="p-4">
            {/* Header */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} style={{ color: 'var(--color-accent-500)' }} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-content-text)' }}>Risk Analysis</h3>
                {!riskVersion.is_authoritative && claimsApproved && onGenerateRisk && (
                    <button
                        onClick={onGenerateRisk}
                        disabled={isGeneratingRisk}
                        style={{
                            marginLeft: 'auto', padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-content-border)', background: 'var(--color-content-surface)',
                            color: 'var(--color-content-text)', fontSize: 12, fontWeight: 500,
                            cursor: isGeneratingRisk ? 'wait' : 'pointer',
                        }}
                    >
                        {isGeneratingRisk ? 'Re-running...' : 'Re-run Analysis'}
                    </button>
                )}
            </div>

            {/* Score */}
            <div className="flex flex-col items-center mb-6 pb-6 border-b border-[var(--color-content-border)]">
                <ScoreCircle score={analysis.defensibility_score} />
                <p className="mt-3 text-[11px] text-[var(--color-content-text-muted)] text-center">
                    Defensibility Score
                </p>
            </div>

            {/* Detected Risks Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[var(--color-content-text)] uppercase tracking-wider">
                    Detected Risks ({analysis.findings.length})
                </span>
            </div>

            {/* Risk Cards */}
            <div className="space-y-2">
                {analysis.findings.map((finding) => (
                    <div
                        key={finding.id}
                        className="p-3.5 bg-[var(--color-content-surface)] border border-[var(--color-content-border)] rounded-[var(--radius-sm)] transition-shadow hover:shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-[var(--color-content-text-muted)] uppercase tracking-wider">
                                {finding.category}
                            </span>
                            {finding.claim_id && (
                                <>
                                    <span className="text-[10px] text-[var(--color-content-text-muted)]">·</span>
                                    <span className="text-[10px] font-medium text-[var(--color-content-text-muted)]">
                                        Claim {finding.claim_id}
                                    </span>
                                </>
                            )}
                            <span className="ml-auto">
                                {severityBadge(finding.severity)}
                            </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-content-text)', marginBottom: 2 }}>
                            {finding.title}
                        </div>
                        <HoverableText text={finding.description} onAddToChat={onAddToChat}>
                            <p className="m-0 text-[12px] leading-relaxed text-[var(--color-content-text-secondary)]">
                                {finding.description}
                            </p>
                        </HoverableText>
                        {finding.recommendation && (
                            <div style={{ fontSize: 12, color: 'var(--color-accent-600)', marginTop: 4, fontStyle: 'italic' }}>
                                {finding.recommendation}
                            </div>
                        )}

                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={() => onAddToChat?.(`Discuss the ${finding.severity} risk "${finding.title}": ${finding.description}`)}
                                className="
                                    text-[11px] font-medium text-[var(--color-accent-600)]
                                    bg-[var(--color-accent-100)] hover:bg-[var(--color-accent-200)]
                                    px-3 py-1.5 rounded-[var(--radius-sm)]
                                    transition-colors flex items-center gap-1.5
                                "
                            >
                                Discuss Risk
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            {analysis.summary && (
                <div style={{
                    padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginTop: 16, marginBottom: 16,
                    background: 'var(--color-content-surface)',
                    border: '1px solid var(--color-content-border)',
                }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-content-text)', marginBottom: 4 }}>Summary</div>
                    <div style={{ fontSize: 13, color: 'var(--color-content-text-secondary)', lineHeight: 1.6 }}>{analysis.summary}</div>
                </div>
            )}

            {/* Commit / Approved */}
            {!riskVersion.is_authoritative && onCommitRisk && (
                <button
                    onClick={onCommitRisk}
                    disabled={isCommittingRisk}
                    style={{
                        padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                        border: 'none', background: 'var(--color-accent-500)',
                        color: 'white', fontSize: 13, fontWeight: 600,
                        cursor: isCommittingRisk ? 'wait' : 'pointer',
                        opacity: isCommittingRisk ? 0.7 : 1,
                    }}
                >
                    {isCommittingRisk ? 'Committing...' : 'Approve Risk Analysis'}
                </button>
            )}
            {riskVersion.is_authoritative && (
                <div style={{
                    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-accent-50)', color: 'var(--color-accent-700)',
                    fontSize: 13, fontWeight: 600, display: 'inline-block',
                }}>
                    Risk Analysis Approved
                </div>
            )}
        </div>
    );
}
