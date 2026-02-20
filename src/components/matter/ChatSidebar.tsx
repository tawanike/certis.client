'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Copy, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ChatMessage, chatMessages as defaultMessages, Workstream, WorkstreamType } from '@/data/mockData';
import CommitGate from '@/components/CommitGate';
import ContextualPrompts from '@/components/ContextualPrompts';
import WorkstreamPills from './WorkstreamPills';
import { Stage } from '@/components/ProgressTracker';

// Artifact keyword → tab mapping
const ARTIFACT_PATTERNS: Array<{ pattern: RegExp; tab: string }> = [
    { pattern: /\b(Claim\s*Tree|Claims?\s*tab|claim\s*tree|Active\s*Claim\s*Set)\b/gi, tab: 'claims' },
    { pattern: /\b(Risk\s*tab|risk\s*analysis|Litigation\s*risk|Detected\s*Risks)\b/gi, tab: 'risk' },
    { pattern: /\b(Spec(?:ification)?\s*(?:tab)?|specification\s*expansion)\b/gi, tab: 'spec' },
    { pattern: /\b(QA\s*(?:tab|Validation|check))\b/gi, tab: 'qa' },
];

function renderTextWithLinks(text: string, onNavigate?: (tab: string) => void): React.ReactNode[] {
    if (!onNavigate) return [text];
    const allPatterns = ARTIFACT_PATTERNS.map(p => `(${p.pattern.source})`).join('|');
    const combinedRegex = new RegExp(allPatterns, 'gi');
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = combinedRegex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
        const matchedText = match[0];
        const patternInfo = ARTIFACT_PATTERNS.find(p => new RegExp(p.pattern.source, 'gi').test(matchedText));
        if (patternInfo) {
            parts.push(
                <span key={match.index} className="artifact-link" onClick={() => onNavigate(patternInfo.tab)} title={`Open ${patternInfo.tab}`}>
                    {matchedText}
                </span>
            );
        } else {
            parts.push(matchedText);
        }
        lastIndex = match.index + matchedText.length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

function formatContent(content: string, onNavigate?: (tab: string) => void) {
    const lines = content.split('\n');
    return lines.map((line, i) => {
        const render = (t: string) => renderTextWithLinks(t.replace(/\*\*/g, ''), onNavigate);
        if (line.startsWith('**') && line.endsWith('**')) {
            return <h4 key={i} style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-content-text)', margin: '6px 0 3px' }}>{render(line)}</h4>;
        } else if (line.startsWith('**') && line.includes(':**')) {
            const parts = line.split(':**');
            return (
                <p key={i} style={{ margin: '2px 0', fontSize: 12.5, lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--color-content-text)' }}>{parts[0].replace(/\*\*/g, '')}:</strong>
                    {renderTextWithLinks(parts.slice(1).join(':**').replace(/\*\*/g, ''), onNavigate)}
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
    currentStage?: Stage;
    matterTitle?: string;
    matterRef?: string;
    inputPrefill?: string;
    onClearPrefill?: () => void;
    workstreams?: Workstream[];
    activeWorkstreamId?: string;
    onWorkstreamChange?: (id: string) => void;
    onCreateWorkstream?: (type: WorkstreamType, label: string) => void;
}

export default function ChatSidebar({
    messages = defaultMessages,
    onSendMessage,
    onArtifactNavigate,
    onProposalAction,
    currentStage = 'claims',
    matterTitle = 'Autonomous Vehicle LiDAR Fusion',
    matterRef = 'MAT-2024-032',
    inputPrefill,
    onClearPrefill,
    workstreams,
    activeWorkstreamId,
    onWorkstreamChange,
    onCreateWorkstream,
}: ChatSidebarProps) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

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
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
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
                        {matterTitle}
                    </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 22 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-content-text-muted)' }}>{matterRef}</span>
                    <span style={{
                        fontSize: 9, fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-accent-50)',
                        color: 'var(--color-accent-600)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}>
                        {currentStage}
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

            {/* Workstream Selector */}
            {workstreams && workstreams.length > 0 && activeWorkstreamId && (
                <WorkstreamPills
                    workstreams={workstreams}
                    activeId={activeWorkstreamId}
                    onSelect={(id) => onWorkstreamChange?.(id)}
                    onCreateNew={onCreateWorkstream}
                />
            )}

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
                                    {msg.content}
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
                                        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5 }}>{msg.content}</p>
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
                                        formatContent(msg.content, onArtifactNavigate)
                                    ) : (
                                        <TypingIndicator isDrafting={!!msg.thinking} />
                                    )}
                                </div>
                                {msg.references && msg.references.length > 0 && (
                                    <div style={{ marginTop: 6, padding: '6px 8px', background: 'var(--color-content-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-content-border)' }}>
                                        <p style={{ margin: '0 0 4px', fontSize: 9, fontWeight: 700, color: 'var(--color-content-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sources Used</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {msg.references.map((ref, idx) => (
                                                <div key={idx} title={ref.content} style={{
                                                    fontSize: 10, padding: '2px 6px',
                                                    background: 'var(--color-content-bg)',
                                                    border: '1px solid var(--color-content-border)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: 'var(--color-content-text-secondary)',
                                                    cursor: 'help',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    maxWidth: 180
                                                }}>
                                                    <Paperclip size={10} style={{ color: 'var(--color-content-text-muted)' }} />
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {ref.filename} • p.{ref.page_number}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {msg.proposal && (
                                    <CommitGate
                                        title={msg.proposal.title}
                                        description={msg.proposal.description}
                                        status={msg.proposal.status}
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
                stage={currentStage}
                onPromptSelect={(text) => setInputValue(text)}
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
                }}>
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
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Certis AI..."
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
