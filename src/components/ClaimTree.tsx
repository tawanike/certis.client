'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronRightSquare, CheckCircle, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { type Claim, claimTree as defaultTree } from '@/data/mockData';
import HoverableText from './HoverableText';

interface ClaimTreeProps {
    claims?: Claim[];
    onAddToChat?: (text: string) => void;
    isSandbox?: boolean;
    isAuthoritative?: boolean;
    onCommit?: () => void;
    isCommitting?: boolean;
    onGenerate?: () => void;
    isGenerating?: boolean;
    briefApproved?: boolean;
}

function ClaimNode({ claim, depth, onAddToChat, isLastChild = false }: {
    claim: Claim;
    depth: number;
    onAddToChat?: (text: string) => void;
    isLastChild?: boolean;
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const isIndependent = claim.type === 'independent';
    const hasChildren = claim.children && claim.children.length > 0;
    const categoryLabel = claim.category.charAt(0).toUpperCase() + claim.category.slice(1);

    // Connector dimensions
    const connectorHeight = 26; // Vertical distance to the horizontal branch
    const indent = 28;

    return (
        <div style={{ position: 'relative' }} className="animate-fade-in-up">
            {/* Connector Lines (only for depth > 0) */}
            {depth > 0 && (
                <>
                    {isLastChild ? (
                        // L-shaped connector for last child
                        <div style={{
                            position: 'absolute',
                            left: -indent + 10, // Adjust based on parent padding alignment
                            top: 0,
                            width: indent - 10,
                            height: connectorHeight,
                            borderLeft: '2px solid var(--color-content-border-strong)',
                            borderBottom: '2px solid var(--color-content-border-strong)',
                            borderBottomLeftRadius: 0, // Flat UI: Square corners
                            zIndex: 0,
                        }} />
                    ) : (
                        // T-shaped connector (vertical + horizontal branch)
                        <>
                            <div style={{
                                position: 'absolute',
                                left: -indent + 10,
                                top: 0,
                                bottom: 0,
                                width: 2,
                                background: 'var(--color-content-border-strong)',
                                zIndex: 0,
                            }} />
                            <div style={{
                                position: 'absolute',
                                left: -indent + 10,
                                top: connectorHeight,
                                width: indent - 10,
                                height: 2,
                                background: 'var(--color-content-border-strong)',
                                zIndex: 0,
                            }} />
                        </>
                    )}
                </>
            )}

            <div style={{
                marginBottom: 12,
                position: 'relative',
                zIndex: 1,
            }}>
                <div style={{
                    padding: '12px 14px',
                    background: 'var(--color-content-surface)',
                    border: '1px solid var(--color-content-border)',
                    // Removed colored borderLeft
                    borderRadius: '2px', // Flat UI: Sharper corners
                    transition: 'all 0.15s ease',
                    boxShadow: 'none', // Flat UI: No shadow
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        {/* Expand/Collapse Toggle */}
                        {hasChildren ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                    width: 16, height: 16,
                                    marginRight: 0, marginLeft: -4,
                                    color: 'var(--color-content-text-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '2px',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-content-bg-hover)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                            >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        ) : (
                            <div style={{ width: 12 }} /> // Spacer for alignment
                        )}

                        <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: 'var(--color-content-text)',
                            marginLeft: hasChildren ? 0 : 4,
                        }}>
                            Claim {claim.id}.
                        </span>
                        <span className={`badge ${isIndependent ? 'badge-accent' : 'badge-info'}`}>
                            {isIndependent ? 'INDEPENDENT' : `DEP. ON ${claim.dependsOn}`}
                        </span>
                        <span style={{
                            fontSize: 10, fontWeight: 500,
                            color: 'var(--color-content-text-muted)',
                            textTransform: 'uppercase',
                        }}>
                            {categoryLabel}
                        </span>

                        {/* Risk flags */}
                        {claim.riskFlags && claim.riskFlags.length > 0 && (
                            <span className={`badge ${claim.riskFlags[0].severity === 'high' ? 'badge-danger' :
                                claim.riskFlags[0].severity === 'medium' ? 'badge-warning' :
                                    'badge-info'
                                }`} style={{ marginLeft: 'auto' }}>
                                {claim.riskFlags.length} RISK{claim.riskFlags.length > 1 ? 'S' : ''}
                            </span>
                        )}
                    </div>

                    {/* Body */}
                    {isExpanded && (
                        <HoverableText text={claim.text} onAddToChat={onAddToChat}>
                            <p style={{
                                margin: 0, fontSize: 12, lineHeight: 1.6,
                                color: 'var(--color-content-text-secondary)',
                                display: '-webkit-box',
                                WebkitLineClamp: isExpanded ? 8 : 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}>
                                {claim.text}
                            </p>
                        </HoverableText>
                    )}
                    {!isExpanded && (
                        <p style={{ margin: 0, fontSize: 11, fontStyle: 'italic', color: 'var(--color-content-text-muted)' }}>
                            Click to expand...
                        </p>
                    )}
                </div>
            </div>

            {/* Children Container */}
            {hasChildren && isExpanded && (
                <div style={{
                    paddingLeft: indent,
                    position: 'relative',
                    marginLeft: 0,
                    // No borderLeft on container
                }}>
                    {claim.children?.map((child, idx) => (
                        <ClaimNode
                            key={child.id}
                            claim={child}
                            depth={depth + 1}
                            onAddToChat={onAddToChat}
                            isLastChild={idx === (claim.children?.length || 0) - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ClaimTree({ claims = defaultTree, onAddToChat, isSandbox = false, isAuthoritative, onCommit, isCommitting, onGenerate, isGenerating, briefApproved }: ClaimTreeProps) {
    const hasClaims = claims && claims.length > 0;

    // Empty state: no claims yet
    if (!hasClaims && onGenerate) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40 }}>
                <div className="text-center max-w-md">
                    <Sparkles size={40} className="mx-auto mb-4 text-[var(--color-content-text-muted)]" />
                    <h3 className="text-[16px] font-bold text-[var(--color-content-text)] mb-2">No Claims Generated</h3>
                    <p className="text-[13px] text-[var(--color-content-text-secondary)] mb-6">
                        {briefApproved
                            ? 'The brief has been approved. Generate claims from the structured breakdown.'
                            : 'Approve the structured brief first before generating claims.'}
                    </p>
                    <button
                        onClick={onGenerate}
                        disabled={!briefApproved || isGenerating}
                        className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded bg-[var(--color-accent-500)] text-white text-[13px] font-semibold hover:bg-[var(--color-accent-600)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {isGenerating ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Sparkles size={14} />
                        )}
                        {isGenerating ? 'Generating Claims...' : 'Generate Claims'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Commit Banner */}
            {hasClaims && isAuthoritative === false && onCommit && (
                <div className="mx-4 mt-4 p-4 rounded-lg border-2 border-[var(--color-accent-300)] bg-[var(--color-accent-50)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-[14px] font-bold text-[var(--color-accent-700)]">Review Required</h4>
                            <p className="text-[12px] text-[var(--color-accent-600)] mt-0.5">
                                Review the generated claim tree and commit to proceed to risk analysis.
                            </p>
                        </div>
                        <button
                            onClick={onCommit}
                            disabled={isCommitting}
                            className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--color-accent-500)] text-white text-[13px] font-semibold hover:bg-[var(--color-accent-600)] disabled:opacity-50 transition-colors"
                        >
                            {isCommitting ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <ShieldCheck size={14} />
                            )}
                            {isCommitting ? 'Committing...' : 'Commit Claims'}
                        </button>
                    </div>
                </div>
            )}

            {/* Committed Badge */}
            {hasClaims && isAuthoritative === true && (
                <div className="flex items-center gap-2 mx-4 mt-4 px-3 py-2 rounded bg-emerald-50 border border-emerald-200">
                    <CheckCircle size={16} className="text-emerald-600" />
                    <span className="text-[13px] font-semibold text-emerald-700">Claims Committed</span>
                </div>
            )}

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid var(--color-content-border)',
                background: 'var(--color-content-surface)',
                flexShrink: 0,
            }}>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: 'var(--color-content-text)' }}>
                            {isSandbox ? 'Sandbox Draft' : 'Authoritative Draft'}
                        </h3>
                        {isSandbox ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider border border-amber-200">
                                Sandbox
                            </span>
                        ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider border border-emerald-200">
                                Authoritative
                            </span>
                        )}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--color-content-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Last synced: just now
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-content-text-secondary)' }}>
                        {claims.reduce((sum, c) => sum + 1 + (c.children?.length || 0), 0)} Claims
                    </span>
                </div>
            </div>

            {/* Claim List */}
            <div style={{
                padding: '16px 16px 16px 8px',
                overflowY: 'auto',
                flex: 1
            }}>
                {claims.map((claim, idx) => (
                    <ClaimNode
                        key={claim.id}
                        claim={claim}
                        depth={0}
                        onAddToChat={onAddToChat}
                    />
                ))}
            </div>
        </div>
    );
}
