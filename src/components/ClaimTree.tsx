'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronRightSquare, CheckCircle, ShieldCheck, Loader2, Sparkles, Pencil, Trash2, Plus, X, Save } from 'lucide-react';
import { type Claim } from '@/types';
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
    highlightedClaimId?: number | null;
    // Editing
    isEditable?: boolean;
    onEditClaim?: (nodeId: string, patch: { text?: string; type?: string; category?: string; dependencies?: string[] }) => Promise<void>;
    onAddClaim?: (body: { type: string; text: string; category?: string; dependencies?: string[] }) => Promise<void>;
    onDeleteClaim?: (nodeId: string) => Promise<void>;
}

function ClaimNode({ claim, depth, onAddToChat, isLastChild = false, highlightedClaimId, isEditable, onEditClaim, onDeleteClaim }: {
    claim: Claim;
    depth: number;
    onAddToChat?: (text: string) => void;
    isLastChild?: boolean;
    highlightedClaimId?: number | null;
    isEditable?: boolean;
    onEditClaim?: (nodeId: string, patch: { text?: string; type?: string; category?: string; dependencies?: string[] }) => Promise<void>;
    onDeleteClaim?: (nodeId: string) => Promise<void>;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(claim.text);
    const [editType, setEditType] = useState(claim.type);
    const [editCategory, setEditCategory] = useState(claim.category);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (highlightedClaimId === claim.id && nodeRef.current) {
            nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setIsHighlighted(true);
            const timer = setTimeout(() => setIsHighlighted(false), 2500);
            return () => clearTimeout(timer);
        }
    }, [highlightedClaimId, claim.id]);

    const isIndependent = claim.type === 'independent';
    const hasChildren = claim.children && claim.children.length > 0;
    const categoryLabel = claim.category.charAt(0).toUpperCase() + claim.category.slice(1);

    const handleSaveEdit = async () => {
        if (!onEditClaim) return;
        setIsSaving(true);
        try {
            const patch: { text?: string; type?: string; category?: string } = {};
            if (editText !== claim.text) patch.text = editText;
            if (editType !== claim.type) patch.type = editType;
            if (editCategory !== claim.category) patch.category = editCategory;
            if (Object.keys(patch).length > 0) {
                await onEditClaim(String(claim.id), patch);
            }
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to save claim edit", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!onDeleteClaim) return;
        setIsSaving(true);
        try {
            await onDeleteClaim(String(claim.id));
            setConfirmDelete(false);
        } catch (err) {
            console.error("Failed to delete claim", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Connector dimensions
    const connectorHeight = 26;
    const indent = 28;

    return (
        <div style={{ position: 'relative' }} className="animate-fade-in-up">
            {/* Connector Lines (only for depth > 0) */}
            {depth > 0 && (
                <>
                    {isLastChild ? (
                        <div style={{
                            position: 'absolute',
                            left: -indent + 10,
                            top: 0,
                            width: indent - 10,
                            height: connectorHeight,
                            borderLeft: '2px solid var(--color-content-border-strong)',
                            borderBottom: '2px solid var(--color-content-border-strong)',
                            borderBottomLeftRadius: 0,
                            zIndex: 0,
                        }} />
                    ) : (
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

            <div ref={nodeRef} style={{
                marginBottom: 12,
                position: 'relative',
                zIndex: 1,
            }}>
                <div style={{
                    padding: '12px 14px',
                    background: isHighlighted ? 'var(--color-accent-50)' : 'var(--color-content-surface)',
                    border: isHighlighted ? '2px solid var(--color-accent-500)' : '1px solid var(--color-content-border)',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease',
                    boxShadow: isHighlighted ? '0 0 0 3px rgba(93, 112, 82, 0.15)' : 'none',
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
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
                            <div style={{ width: 12 }} />
                        )}

                        <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: 'var(--color-content-text)',
                            marginLeft: hasChildren ? 0 : 4,
                        }}>
                            Claim {claim.id}.
                        </span>

                        {isEditing ? (
                            <>
                                <select
                                    value={editType}
                                    onChange={e => setEditType(e.target.value as 'independent' | 'dependent')}
                                    style={{ fontSize: 10, padding: '2px 4px', borderRadius: 2, border: '1px solid var(--color-content-border)' }}
                                >
                                    <option value="independent">Independent</option>
                                    <option value="dependent">Dependent</option>
                                </select>
                                <select
                                    value={editCategory}
                                    onChange={e => setEditCategory(e.target.value as 'system' | 'method' | 'apparatus')}
                                    style={{ fontSize: 10, padding: '2px 4px', borderRadius: 2, border: '1px solid var(--color-content-border)' }}
                                >
                                    <option value="system">System</option>
                                    <option value="method">Method</option>
                                    <option value="apparatus">Apparatus</option>
                                </select>
                            </>
                        ) : (
                            <>
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
                            </>
                        )}

                        {/* Edit/Delete buttons */}
                        {isEditable && !isEditing && (
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                                <button
                                    onClick={() => { setIsEditing(true); setEditText(claim.text); setEditType(claim.type); setEditCategory(claim.category); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-content-text-muted)', borderRadius: 2 }}
                                    title="Edit claim"
                                >
                                    <Pencil size={13} />
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-content-text-muted)', borderRadius: 2 }}
                                    title="Delete claim"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        )}

                        {isEditing && (
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        padding: '2px 8px', borderRadius: 2, border: 'none',
                                        background: 'var(--color-accent-500)', color: 'white',
                                        fontSize: 11, fontWeight: 600, cursor: isSaving ? 'wait' : 'pointer',
                                    }}
                                >
                                    <Save size={12} />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        padding: '2px 8px', borderRadius: 2,
                                        border: '1px solid var(--color-content-border)', background: 'var(--color-content-surface)',
                                        color: 'var(--color-content-text)', fontSize: 11, cursor: 'pointer',
                                    }}
                                >
                                    <X size={12} />
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* Risk flags */}
                        {!isEditing && claim.riskFlags && claim.riskFlags.length > 0 && (
                            <span className={`badge ${claim.riskFlags[0].severity === 'high' ? 'badge-danger' :
                                claim.riskFlags[0].severity === 'medium' ? 'badge-warning' :
                                    'badge-info'
                                }`} style={{ marginLeft: isEditable ? 0 : 'auto' }}>
                                {claim.riskFlags.length} RISK{claim.riskFlags.length > 1 ? 'S' : ''}
                            </span>
                        )}
                    </div>

                    {/* Delete confirmation */}
                    {confirmDelete && (
                        <div style={{
                            padding: '8px 12px', marginBottom: 8, borderRadius: 2,
                            background: 'var(--color-danger-bg, #fef2f2)', border: '1px solid var(--color-danger, #ef4444)',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span style={{ fontSize: 12, color: 'var(--color-danger)', flex: 1 }}>
                                Delete Claim {claim.id}? This cannot be undone.
                            </span>
                            <button
                                onClick={handleDelete}
                                disabled={isSaving}
                                style={{
                                    padding: '2px 10px', borderRadius: 2, border: 'none',
                                    background: 'var(--color-danger, #ef4444)', color: 'white',
                                    fontSize: 11, fontWeight: 600, cursor: isSaving ? 'wait' : 'pointer',
                                }}
                            >
                                {isSaving ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
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

                    {/* Body */}
                    {isExpanded && isEditing ? (
                        <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            rows={5}
                            style={{
                                width: '100%', fontSize: 12, lineHeight: 1.6, padding: '8px',
                                border: '1px solid var(--color-content-border)', borderRadius: 2,
                                background: 'var(--color-content-bg)', color: 'var(--color-content-text)',
                                resize: 'vertical', fontFamily: 'inherit',
                            }}
                        />
                    ) : isExpanded ? (
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
                    ) : (
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
                }}>
                    {claim.children?.map((child, idx) => (
                        <ClaimNode
                            key={child.id}
                            claim={child}
                            depth={depth + 1}
                            onAddToChat={onAddToChat}
                            isLastChild={idx === (claim.children?.length || 0) - 1}
                            highlightedClaimId={highlightedClaimId}
                            isEditable={isEditable}
                            onEditClaim={onEditClaim}
                            onDeleteClaim={onDeleteClaim}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ClaimTree({ claims = [], onAddToChat, isSandbox = false, isAuthoritative, onCommit, isCommitting, onGenerate, isGenerating, briefApproved, highlightedClaimId, isEditable, onEditClaim, onAddClaim, onDeleteClaim }: ClaimTreeProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [addText, setAddText] = useState('');
    const [addType, setAddType] = useState<'independent' | 'dependent'>('dependent');
    const [addCategory, setAddCategory] = useState<'system' | 'method' | 'apparatus'>('system');
    const [addDeps, setAddDeps] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const hasClaims = claims && claims.length > 0;

    const handleAddClaim = async () => {
        if (!onAddClaim || !addText.trim()) return;
        setIsAdding(true);
        try {
            const deps = addDeps.split(',').map(s => s.trim()).filter(Boolean);
            await onAddClaim({ type: addType, text: addText, category: addCategory, dependencies: deps });
            setAddText('');
            setAddDeps('');
            setShowAddForm(false);
        } catch (err) {
            console.error("Failed to add claim", err);
        } finally {
            setIsAdding(false);
        }
    };

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
                        highlightedClaimId={highlightedClaimId}
                        isEditable={isEditable}
                        onEditClaim={onEditClaim}
                        onDeleteClaim={onDeleteClaim}
                    />
                ))}

                {/* Add Claim Button */}
                {isEditable && onAddClaim && !showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
                            padding: '8px 14px', borderRadius: 2,
                            border: '1px dashed var(--color-content-border)',
                            background: 'transparent', color: 'var(--color-content-text-muted)',
                            fontSize: 12, fontWeight: 500, cursor: 'pointer', width: '100%',
                        }}
                    >
                        <Plus size={14} />
                        Add Claim
                    </button>
                )}

                {/* Add Claim Form */}
                {isEditable && showAddForm && (
                    <div style={{
                        marginTop: 8, padding: 14, borderRadius: 2,
                        border: '1px solid var(--color-content-border)',
                        background: 'var(--color-content-surface)',
                    }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <select
                                value={addType}
                                onChange={e => setAddType(e.target.value as 'independent' | 'dependent')}
                                style={{ fontSize: 11, padding: '4px 6px', borderRadius: 2, border: '1px solid var(--color-content-border)' }}
                            >
                                <option value="independent">Independent</option>
                                <option value="dependent">Dependent</option>
                            </select>
                            <select
                                value={addCategory}
                                onChange={e => setAddCategory(e.target.value as 'system' | 'method' | 'apparatus')}
                                style={{ fontSize: 11, padding: '4px 6px', borderRadius: 2, border: '1px solid var(--color-content-border)' }}
                            >
                                <option value="system">System</option>
                                <option value="method">Method</option>
                                <option value="apparatus">Apparatus</option>
                            </select>
                            {addType === 'dependent' && (
                                <input
                                    placeholder="Depends on (e.g. 1,3)"
                                    value={addDeps}
                                    onChange={e => setAddDeps(e.target.value)}
                                    style={{ fontSize: 11, padding: '4px 6px', borderRadius: 2, border: '1px solid var(--color-content-border)', flex: 1 }}
                                />
                            )}
                        </div>
                        <textarea
                            placeholder="Claim text..."
                            value={addText}
                            onChange={e => setAddText(e.target.value)}
                            rows={4}
                            style={{
                                width: '100%', fontSize: 12, lineHeight: 1.6, padding: 8, marginBottom: 8,
                                border: '1px solid var(--color-content-border)', borderRadius: 2,
                                background: 'var(--color-content-bg)', color: 'var(--color-content-text)',
                                resize: 'vertical', fontFamily: 'inherit',
                            }}
                        />
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                onClick={handleAddClaim}
                                disabled={isAdding || !addText.trim()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '4px 12px', borderRadius: 2, border: 'none',
                                    background: 'var(--color-accent-500)', color: 'white',
                                    fontSize: 12, fontWeight: 600, cursor: isAdding ? 'wait' : 'pointer',
                                    opacity: (!addText.trim() || isAdding) ? 0.6 : 1,
                                }}
                            >
                                {isAdding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                {isAdding ? 'Adding...' : 'Add Claim'}
                            </button>
                            <button
                                onClick={() => { setShowAddForm(false); setAddText(''); setAddDeps(''); }}
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
                )}
            </div>
        </div>
    );
}
