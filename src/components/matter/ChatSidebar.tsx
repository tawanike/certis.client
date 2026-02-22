'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Copy, Sparkles, ArrowLeft, FileText, FileSpreadsheet, FileImage, File, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { ChatMessage, DocumentReference, Claim, Suggestion } from '@/types';
import CommitGate from '@/components/CommitGate';
import ContextualPrompts from '@/components/ContextualPrompts';
import MentionPopover, { MentionItem, buildMentionItems } from './MentionPopover';

// Artifact keyword → tab mapping
const ARTIFACT_PATTERNS: Array<{ pattern: RegExp; tab: string }> = [
    { pattern: /\b(Claim\s*Tree|Claims?\s*tab|claim\s*tree|Active\s*Claim\s*Set)\b/gi, tab: 'claims' },
    { pattern: /\b(Risk\s*tab|risk\s*analysis|Litigation\s*risk|Detected\s*Risks)\b/gi, tab: 'risk' },
    { pattern: /\b(Spec(?:ification)?\s*(?:tab)?|specification\s*expansion)\b/gi, tab: 'spec' },
    { pattern: /\b(QA\s*(?:tab|Validation|check))\b/gi, tab: 'qa' },
];

function renderTextWithLinks(
    text: string,
    onNavigate?: (tab: string) => void,
    onClaimNavigate?: (claimId: number) => void,
): React.ReactNode[] {
    if (!onNavigate && !onClaimNavigate) return [text];

    // Combine artifact patterns + individual claim references
    const artifactSources = ARTIFACT_PATTERNS.map(p => `(${p.pattern.source})`).join('|');
    const claimSource = '(Claim\\s+\\d+)';
    const combinedRegex = new RegExp(`${artifactSources}|${claimSource}`, 'gi');

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = combinedRegex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
        const matchedText = match[0];

        // Check if it's an individual claim ref (e.g. "Claim 1") but NOT "Claim Tree", "Claims tab", etc.
        const isClaimRef = /^Claim\s+\d+$/i.test(matchedText) && !/tree|tab|set/i.test(matchedText);

        if (isClaimRef && onClaimNavigate) {
            const claimId = parseInt(matchedText.replace(/\D/g, ''), 10);
            parts.push(
                <span
                    key={match.index}
                    className="artifact-link claim-link"
                    onClick={() => {
                        onNavigate?.('claims');
                        onClaimNavigate(claimId);
                    }}
                    title={`Go to Claim ${claimId}`}
                >
                    {matchedText}
                </span>
            );
        } else {
            const patternInfo = ARTIFACT_PATTERNS.find(p => new RegExp(p.pattern.source, 'gi').test(matchedText));
            if (patternInfo && onNavigate) {
                parts.push(
                    <span key={match.index} className="artifact-link" onClick={() => onNavigate(patternInfo.tab)} title={`Open ${patternInfo.tab}`}>
                        {matchedText}
                    </span>
                );
            } else {
                parts.push(matchedText);
            }
        }
        lastIndex = match.index + matchedText.length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

function formatContent(content: string, onNavigate?: (tab: string) => void, onClaimNavigate?: (claimId: number) => void) {
    const lines = content.split('\n');
    return lines.map((line, i) => {
        const render = (t: string) => renderTextWithLinks(t.replace(/\*\*/g, ''), onNavigate, onClaimNavigate);
        if (line.startsWith('**') && line.endsWith('**')) {
            return <h4 key={i} style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-content-text)', margin: '6px 0 3px' }}>{render(line)}</h4>;
        } else if (line.startsWith('**') && line.includes(':**')) {
            const parts = line.split(':**');
            return (
                <p key={i} style={{ margin: '2px 0', fontSize: 12.5, lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--color-content-text)' }}>{parts[0].replace(/\*\*/g, '')}:</strong>
                    {renderTextWithLinks(parts.slice(1).join(':**').replace(/\*\*/g, ''), onNavigate, onClaimNavigate)}
                </p>
            );
        } else if (line.startsWith('- ') || line.startsWith('• ')) {
            return <p key={i} style={{ margin: '1px 0 1px 12px', fontSize: 12.5, lineHeight: 1.6, position: 'relative', color: 'var(--color-content-text-secondary)' }}><span style={{ position: 'absolute', left: -10, color: 'var(--color-accent-500)' }}>•</span>{render('  ' + line.slice(2))}</p>;
        } else if (line.trim() === '') {
            return <div key={i} style={{ height: 4 }} />;
        } else {
            return <p key={i} style={{ margin: '1px 0', fontSize: 12.5, lineHeight: 1.6, color: 'var(--color-content-text-secondary)' }}>{render(line)}</p>;
        }
    });
}

// System message keyword highlighting
const SYSTEM_KEYWORDS = /\b(CLAIM\s+\d+|UPDATED|PASSED|FAILED|DEFENSIBILITY\s+SCORE|ADJUSTED\s+TO\s+\d+|ANTECEDENT\s+BASIS\s+CHECK|LOCKED|MERGED|APPROVED|REJECTED)\b/gi;

function formatSystemMessage(content: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(SYSTEM_KEYWORDS.source, 'gi');
    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) parts.push(content.slice(lastIndex, match.index));
        parts.push(
            <span key={match.index} style={{
                fontWeight: 700,
                color: 'var(--color-content-text)',
                background: 'var(--color-accent-50)',
                padding: '0 3px',
                borderRadius: 2,
            }}>
                {match[0]}
            </span>
        );
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) parts.push(content.slice(lastIndex));
    return parts;
}

// Map content_type to a lucide icon component
function getFileIcon(contentType?: string) {
    if (!contentType) return FileText;
    if (contentType.includes('pdf')) return FileText;
    if (contentType.includes('word') || contentType.includes('document')) return File;
    if (contentType.includes('spreadsheet') || contentType.includes('excel') || contentType.includes('csv')) return FileSpreadsheet;
    if (contentType.includes('image')) return FileImage;
    return FileText;
}

// Short label for the file type badge (e.g. "PDF", "DOCX")
function getFileTypeLabel(contentType?: string): string | null {
    if (!contentType) return null;
    if (contentType.includes('pdf')) return 'PDF';
    if (contentType.includes('wordprocessingml') || contentType.includes('msword')) return 'DOCX';
    if (contentType.includes('spreadsheet') || contentType.includes('excel')) return 'XLSX';
    if (contentType.includes('csv')) return 'CSV';
    if (contentType.includes('image/png')) return 'PNG';
    if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) return 'JPG';
    if (contentType.includes('image')) return 'IMG';
    return null;
}

// Expandable citation card for document references
function CitationCard({ reference, msgId, idx, isExpanded, onToggle }: {
    reference: DocumentReference;
    msgId: string;
    idx: number;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const IconComponent = getFileIcon(reference.content_type);
    const typeLabel = getFileTypeLabel(reference.content_type);

    return (
        <div
            onClick={onToggle}
            style={{
                fontSize: 11,
                padding: isExpanded ? '8px 10px' : '3px 8px',
                background: 'var(--color-content-bg)',
                border: '1px solid var(--color-content-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-content-text-secondary)',
                cursor: 'pointer',
                maxWidth: isExpanded ? '100%' : 320,
                transition: 'all 0.15s ease',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconComponent size={11} style={{ color: 'var(--color-accent-500)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {reference.filename}
                </span>
                {typeLabel && (
                    <span style={{
                        fontSize: 8,
                        fontWeight: 700,
                        padding: '0 4px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-accent-50)',
                        color: 'var(--color-accent-600)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        flexShrink: 0,
                    }}>
                        {typeLabel}
                    </span>
                )}
                <span style={{ color: 'var(--color-content-text-muted)', fontSize: 10, flexShrink: 0 }}>
                    p.{reference.page_number}{reference.total_pages ? `/${reference.total_pages}` : ''}
                    {reference.chunk_index !== undefined && ` · §${reference.chunk_index + 1}`}
                </span>
                <ChevronDown
                    size={10}
                    style={{
                        marginLeft: 'auto',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.15s ease',
                        color: 'var(--color-content-text-muted)',
                        flexShrink: 0,
                    }}
                />
            </div>
            {isExpanded && (
                <p style={{
                    margin: '6px 0 0',
                    fontSize: 11,
                    lineHeight: 1.5,
                    color: 'var(--color-content-text-muted)',
                    borderTop: '1px solid var(--color-content-border)',
                    paddingTop: 6,
                    whiteSpace: 'pre-wrap',
                    maxHeight: 80,
                    overflow: 'hidden',
                }}>
                    {reference.content}
                </p>
            )}
        </div>
    );
}

// Render @[...] and #[...] mentions as styled pills
const MENTION_REGEX = /(@\[([^\]]+)\]|#\[([^\]]+)\])/g;

function renderMentions(
    text: string,
    onNavigate?: (tab: string) => void,
    onClaimNavigate?: (claimId: number) => void,
): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(MENTION_REGEX.source, 'g');

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));

        const isAt = match[0].startsWith('@');
        const label = match[2] || match[3]; // group 2 for @, group 3 for #

        if (isAt) {
            parts.push(
                <span key={match.index} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '0 6px',
                    borderRadius: 'var(--radius-full, 999px)',
                    background: 'var(--color-accent-50)',
                    color: 'var(--color-accent-700)',
                    fontSize: 12,
                    fontWeight: 600,
                    verticalAlign: 'baseline',
                }}>
                    @{label}
                </span>
            );
        } else {
            // # claim reference
            const claimMatch = label.match(/Claim\s+(\d+)/i);
            const claimId = claimMatch ? parseInt(claimMatch[1], 10) : null;
            parts.push(
                <span
                    key={match.index}
                    onClick={claimId ? () => {
                        onNavigate?.('claims');
                        onClaimNavigate?.(claimId);
                    } : undefined}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        padding: '0 6px',
                        borderRadius: 'var(--radius-full, 999px)',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--color-primary, #3b82f6)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: claimId ? 'pointer' : 'default',
                        verticalAlign: 'baseline',
                    }}
                >
                    #{label}
                </span>
            );
        }
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

const LAWYERLY_PHRASES = [
    "Billing you for this thought",
    "Filing a motion to dismiss reality",
    "Objecting to the premise of this query",
    "Drafting a strongly worded letter",
    "Searching for loopholes",
    "Practicing my 'Objection!' shout",
    "Adding 'henceforth' to random sentences",
    "Calculating my hourly rate",
    "Looking for someone to sue",
    "Arguing with opposing counsel in my head",
    "Redacting the juicy parts",
    "Preparing the Cease and Desist"
];

const TypingIndicator = ({ isDrafting = false }: { isDrafting?: boolean }) => {
    const [dots, setDots] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        setPhraseIndex(Math.floor(Math.random() * LAWYERLY_PHRASES.length));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(p => p.length >= 3 ? '' : p + '.');
        }, 400);
        return () => clearInterval(interval);
    }, []);

    const text = isDrafting ? "Drafting response" : LAWYERLY_PHRASES[phraseIndex];

    return (
        <span style={{ color: 'var(--color-content-text-muted)', fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.6 }}>
            {text}{dots}
        </span>
    );
};

interface ChatSidebarProps {
    messages?: ChatMessage[];
    onSendMessage?: (content: string) => void;
    onArtifactNavigate?: (tab: string) => void;
    onProposalAction?: (messageId: string, action: 'accept' | 'reject') => void;
    matterTitle?: string;
    matterRef?: string;
    matterStatus?: string;
    inputPrefill?: string;
    onClearPrefill?: () => void;
    suggestions?: Suggestion[];
    suggestionsLoading?: boolean;
    onWorkflowAction?: (actionId: string) => void;
    onClaimNavigate?: (claimId: number) => void;
    claims?: Claim[];
    documents?: Array<{ id: string; filename: string; total_pages?: number; status?: string }>;
    briefVersion?: { id: string; version_number: number; is_authoritative: boolean } | null;
}

export default function ChatSidebar({
    messages = [],
    onSendMessage,
    onArtifactNavigate,
    onProposalAction,
    matterTitle,
    matterRef,
    matterStatus,
    inputPrefill,
    onClearPrefill,
    suggestions = [],
    suggestionsLoading = false,
    onWorkflowAction,
    onClaimNavigate,
    claims: claimsProp = [],
    documents: documentsProp = [],
    briefVersion: briefVersionProp,
}: ChatSidebarProps) {
    const [inputValue, setInputValue] = useState('');
    const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Mention state
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionTrigger, setMentionTrigger] = useState<'@' | '#'>('@');
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionStartPos, setMentionStartPos] = useState(0);
    const [mentionActiveIndex, setMentionActiveIndex] = useState(0);

    const { atItems, hashItems } = buildMentionItems(documentsProp, claimsProp, briefVersionProp);
    const mentionItems = mentionTrigger === '@' ? atItems : hashItems;
    const filteredMentionItems = mentionItems.filter(
        (item) => item.label.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (inputPrefill) {
            setInputValue(`"${inputPrefill}"\n\n`);
            onClearPrefill?.();
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [inputPrefill, onClearPrefill]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        onSendMessage?.(inputValue);
        setInputValue('');
        setMentionOpen(false);
    };

    const handleMentionSelect = (item: MentionItem) => {
        const prefix = mentionTrigger === '@' ? '@' : '#';
        const insertText = `${prefix}[${item.label}]`;
        const before = inputValue.slice(0, mentionStartPos);
        const after = inputValue.slice(mentionStartPos + mentionQuery.length + 1); // +1 for trigger char
        const newValue = before + insertText + ' ' + after;
        setInputValue(newValue);
        setMentionOpen(false);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // Detect mention triggers
        const cursorPos = e.target.selectionStart || 0;
        const textBeforeCursor = value.slice(0, cursorPos);

        // Find the last @ or # that starts a mention (not preceded by a word char)
        const atMatch = textBeforeCursor.match(/(?:^|[\s(])(@)(\w*)$/);
        const hashMatch = textBeforeCursor.match(/(?:^|[\s(])(#)(\w*)$/);

        if (atMatch) {
            const triggerIdx = textBeforeCursor.lastIndexOf('@');
            setMentionOpen(true);
            setMentionTrigger('@');
            setMentionQuery(atMatch[2] || '');
            setMentionStartPos(triggerIdx);
            setMentionActiveIndex(0);
        } else if (hashMatch) {
            const triggerIdx = textBeforeCursor.lastIndexOf('#');
            setMentionOpen(true);
            setMentionTrigger('#');
            setMentionQuery(hashMatch[2] || '');
            setMentionStartPos(triggerIdx);
            setMentionActiveIndex(0);
        } else {
            setMentionOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (mentionOpen && filteredMentionItems.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setMentionActiveIndex((prev) =>
                    prev < filteredMentionItems.length - 1 ? prev + 1 : 0
                );
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setMentionActiveIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredMentionItems.length - 1
                );
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                handleMentionSelect(filteredMentionItems[mentionActiveIndex]);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setMentionOpen(false);
                return;
            }
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{
            width: 570,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--color-content-surface)',
            borderRight: '1px solid var(--color-content-border)',
            flexShrink: 0,
        }}>
            {/* Matter Context Header */}
            <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--color-content-border)',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Link href="/" style={{
                        display: 'flex', alignItems: 'center',
                        color: 'var(--color-content-text-muted)',
                        textDecoration: 'none',
                    }}>
                        <ArrowLeft size={14} />
                    </Link>
                    <h2 style={{
                        margin: 0, fontSize: 14, fontWeight: 700,
                        color: 'var(--color-content-text)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {matterTitle || 'Loading...'}
                    </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 22 }}>
                    {matterRef && <span style={{ fontSize: 11, color: 'var(--color-content-text-muted)' }}>{matterRef}</span>}
                    <span style={{
                        fontSize: 9, fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-accent-50)',
                        color: 'var(--color-accent-600)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}>
                        {matterStatus ? matterStatus.replace(/_/g, ' ') : 'LOADING'}
                    </span>
                    <span style={{
                        fontSize: 11, color: 'var(--color-content-text-muted)',
                        display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto',
                    }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
                        Active
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
            }}>
                {messages.map((msg) => {
                    if (msg.role === 'system') {
                        return (
                            <div key={msg.id} style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
                                <div className="chat-bubble-system" style={{ fontSize: 11 }}>
                                    {formatSystemMessage(msg.content)}
                                </div>
                            </div>
                        );
                    }

                    if (msg.role === 'user') {
                        return (
                            <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '85%' }}>
                                    <span style={{ fontSize: 10, color: 'var(--color-content-text-muted)', marginBottom: 3 }}>{msg.timestamp}</span>
                                    <div className="chat-bubble-user" style={{ padding: '8px 12px' }}>
                                        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5 }}>
                                            {renderMentions(msg.content, onArtifactNavigate, onClaimNavigate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Assistant
                    return (
                        <div key={msg.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <div style={{
                                width: 26, height: 26,
                                borderRadius: '50%',
                                background: 'var(--color-content-raised)',
                                border: '1px solid var(--color-content-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, marginTop: 14,
                            }}>
                                <Sparkles size={12} style={{ color: 'var(--color-accent-500)' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-content-text-secondary)' }}>Certis AI</span>
                                    <span style={{ fontSize: 10, color: 'var(--color-content-text-muted)' }}>{msg.timestamp}</span>
                                </div>
                                {msg.thinking && (
                                    <details style={{ marginBottom: 8, fontSize: 11, color: 'var(--color-content-text-muted)' }}>
                                        <summary style={{ cursor: 'pointer', outline: 'none', userSelect: 'none', fontStyle: 'italic' }}>
                                            Thought process
                                        </summary>
                                        <div style={{ padding: '6px 0 6px 12px', borderLeft: '2px solid var(--color-content-border)', marginTop: 4, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                                            {msg.thinking}
                                        </div>
                                    </details>
                                )}
                                <div className="chat-bubble-ai" style={{ padding: '8px 12px' }}>
                                    {msg.content ? (
                                        formatContent(msg.content, onArtifactNavigate, onClaimNavigate)
                                    ) : (
                                        <TypingIndicator isDrafting={!!msg.thinking} />
                                    )}
                                </div>
                                {msg.references && msg.references.length > 0 && (
                                    <div style={{ marginTop: 6, padding: '6px 8px', background: 'var(--color-content-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-content-border)' }}>
                                        <p style={{ margin: '0 0 4px', fontSize: 9, fontWeight: 700, color: 'var(--color-content-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sources Used</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {msg.references.map((ref, idx) => {
                                                const citationKey = `${msg.id}-${idx}`;
                                                return (
                                                    <CitationCard
                                                        key={idx}
                                                        reference={ref}
                                                        msgId={msg.id}
                                                        idx={idx}
                                                        isExpanded={!!expandedCitations[citationKey]}
                                                        onToggle={() => setExpandedCitations(prev => ({
                                                            ...prev,
                                                            [citationKey]: !prev[citationKey]
                                                        }))}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {msg.proposal && (
                                    <CommitGate
                                        title={msg.proposal.title}
                                        description={msg.proposal.description}
                                        status={msg.proposal.status}
                                        diff={msg.proposal.diff}
                                        onAccept={() => onProposalAction?.(msg.id, 'accept')}
                                        onReject={() => onProposalAction?.(msg.id, 'reject')}
                                    />
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, paddingLeft: 2 }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-content-text-muted)', padding: 2, display: 'flex' }}>
                                        <Copy size={11} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Contextual Prompts */}
            <ContextualPrompts
                suggestions={suggestions}
                onPromptSelect={(text) => setInputValue(text)}
                onWorkflowAction={(actionId) => onWorkflowAction?.(actionId)}
                isLoading={suggestionsLoading}
            />

            {/* Input Bar */}
            <div style={{
                padding: '0 16px 12px',
                flexShrink: 0,
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 8,
                    padding: '8px 12px',
                    background: 'var(--color-content-bg)',
                    border: '1px solid var(--color-content-border)',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'border-color 0.15s ease',
                    position: 'relative',
                }}>
                    {/* Mention Popover */}
                    {mentionOpen && filteredMentionItems.length > 0 && (
                        <MentionPopover
                            items={mentionItems}
                            query={mentionQuery}
                            triggerChar={mentionTrigger}
                            onSelect={handleMentionSelect}
                            onClose={() => setMentionOpen(false)}
                            activeIndex={mentionActiveIndex}
                        />
                    )}
                    <button style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-content-text-muted)', padding: 2,
                        display: 'flex', alignItems: 'center', flexShrink: 0,
                    }}>
                        <Paperclip size={16} />
                    </button>
                    <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onBlur={() => setTimeout(() => setMentionOpen(false), 150)}
                        placeholder="Ask Certis AI... (@ files, # claims)"
                        rows={inputValue.includes('\n') ? 3 : 1}
                        style={{
                            flex: 1, background: 'none', border: 'none', outline: 'none',
                            color: 'var(--color-content-text)', fontSize: 13,
                            fontFamily: 'var(--font-sans)', lineHeight: 1.5,
                            resize: 'none', maxHeight: 80,
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        style={{
                            background: inputValue.trim() ? 'var(--color-accent-500)' : 'transparent',
                            border: 'none',
                            cursor: inputValue.trim() ? 'pointer' : 'default',
                            color: inputValue.trim() ? 'white' : 'var(--color-content-text-muted)',
                            padding: 5, borderRadius: 'var(--radius-sm)',
                            display: 'flex', alignItems: 'center', flexShrink: 0,
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <Send size={14} />
                    </button>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 10, color: 'var(--color-content-text-muted)', textAlign: 'center' }}>
                    AI outputs require <span style={{ textDecoration: 'underline' }}>attorney review</span>
                </p>
            </div>
        </div>
    );
}
