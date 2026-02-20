'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, MoreHorizontal, Copy, Settings, Paperclip } from 'lucide-react';
import { ChatMessage, chatMessages as defaultMessages } from '@/data/mockData';
import CommitGate from './CommitGate';
import ContextualPrompts from './ContextualPrompts';
import { Stage } from './ProgressTracker';
import { Suggestion } from '@/types';

interface ChatPanelProps {
    messages?: ChatMessage[];
    onSendMessage?: (message: string) => void;
    onArtifactNavigate?: (tab: string) => void;
    inputPrefill?: string;
    onClearPrefill?: () => void;
    threadTitle?: string;
    threadMode?: string;
    onProposalAction?: (messageId: string, action: 'accept' | 'reject') => void;
    currentStage?: Stage;
}

// Artifact keyword → tab mapping
const ARTIFACT_PATTERNS: Array<{ pattern: RegExp; tab: string; label: string }> = [
    { pattern: /\b(Claim\s*Tree|Claims?\s*tab|claim\s*tree|Active\s*Claim\s*Set)\b/gi, tab: 'claims', label: '' },
    { pattern: /\b(Risk\s*tab|risk\s*analysis|Litigation\s*risk|Detected\s*Risks)\b/gi, tab: 'risk', label: '' },
    { pattern: /\b(Spec(?:ification)?\s*(?:tab)?|specification\s*expansion)\b/gi, tab: 'spec', label: '' },
    { pattern: /\b(QA\s*(?:tab|Validation|check))\b/gi, tab: 'qa', label: '' },
    { pattern: /\b(Version\s*History|Versions?\s*tab)\b/gi, tab: 'versions', label: '' },
];

function renderTextWithArtifactLinks(text: string, onNavigate?: (tab: string) => void): React.ReactNode[] {
    if (!onNavigate) return [text];

    // Build a combined regex from all patterns
    const allPatterns = ARTIFACT_PATTERNS.map(p => `(${p.pattern.source})`).join('|');
    const combinedRegex = new RegExp(allPatterns, 'gi');

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = combinedRegex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Find which pattern matched
        const matchedText = match[0];
        const patternInfo = ARTIFACT_PATTERNS.find(p => {
            const testRegex = new RegExp(p.pattern.source, 'gi');
            return testRegex.test(matchedText);
        });

        if (patternInfo) {
            parts.push(
                <span
                    key={`${match.index}-${matchedText}`}
                    className="artifact-link"
                    onClick={() => onNavigate(patternInfo.tab)}
                    title={`Open ${patternInfo.tab} tab`}
                >
                    {matchedText}
                </span>
            );
        } else {
            parts.push(matchedText);
        }

        lastIndex = match.index + matchedText.length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}

function formatMessageContent(content: string, onNavigate?: (tab: string) => void) {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
        const renderLine = (text: string) => renderTextWithArtifactLinks(text.replace(/\*\*/g, ''), onNavigate);

        if (line.startsWith('**') && line.endsWith('**')) {
            elements.push(
                <h4 key={i} style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-content-text)', margin: '8px 0 4px' }}>
                    {renderLine(line)}
                </h4>
            );
        } else if (line.startsWith('**') && line.includes(':**')) {
            const parts = line.split(':**');
            elements.push(
                <p key={i} style={{ margin: '3px 0', fontSize: 13, lineHeight: 1.65 }}>
                    <strong style={{ color: 'var(--color-content-text)' }}>{parts[0].replace(/\*\*/g, '')}:</strong>
                    {renderTextWithArtifactLinks(parts.slice(1).join(':**').replace(/\*\*/g, ''), onNavigate)}
                </p>
            );
        } else if (line.startsWith('- ') || line.startsWith('• ')) {
            elements.push(
                <p key={i} style={{ margin: '2px 0 2px 16px', fontSize: 13, lineHeight: 1.65, position: 'relative', color: 'var(--color-content-text-secondary)' }}>
                    <span style={{ position: 'absolute', left: -12, color: 'var(--color-accent-500)' }}>•</span>
                    {renderLine('  ' + line.slice(2))}
                </p>
            );
        } else if (line.match(/^\d+\.\s/)) {
            elements.push(
                <p key={i} style={{ margin: '2px 0 2px 16px', fontSize: 13, lineHeight: 1.65, color: 'var(--color-content-text-secondary)' }}>
                    {renderLine(line)}
                </p>
            );
        } else if (line.startsWith('---')) {
            elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid var(--color-content-border)', margin: '10px 0' }} />);
        } else if (line.startsWith('⚠') || line.startsWith('🟡') || line.startsWith('🔴') || line.startsWith('🟢') || line.startsWith('⚡')) {
            elements.push(
                <p key={i} style={{ margin: '4px 0', fontSize: 13, lineHeight: 1.65, padding: '6px 10px', background: 'var(--color-warning-light)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-warning)' }}>
                    {renderLine(line)}
                </p>
            );
        } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
            elements.push(
                <p key={i} style={{ margin: '4px 0', fontSize: 12, lineHeight: 1.5, color: 'var(--color-content-text-muted)', fontStyle: 'italic' }}>
                    {renderLine(line)}
                </p>
            );
        } else if (line.trim() === '') {
            elements.push(<div key={i} style={{ height: 6 }} />);
        } else {
            elements.push(
                <p key={i} style={{ margin: '2px 0', fontSize: 13, lineHeight: 1.65, color: 'var(--color-content-text-secondary)' }}>
                    {renderLine(line)}
                </p>
            );
        }
    });

    return elements;
}

const STAGE_SUGGESTIONS: Record<Stage, Suggestion[]> = {
    brief: [
        { label: "Summarize the invention disclosure", type: "chat_prompt", prompt: "Summarize the invention disclosure" },
        { label: "Identify key novel features", type: "chat_prompt", prompt: "Identify key novel features" },
        { label: "List potential competitors", type: "chat_prompt", prompt: "List potential competitors" },
    ],
    claims: [
        { label: "Check for antecedent basis issues", type: "chat_prompt", prompt: "Check for antecedent basis issues" },
        { label: "Expand on the fallback mechanism", type: "chat_prompt", prompt: "Expand on the fallback mechanism" },
        { label: "Draft a dependent claim", type: "chat_prompt", prompt: "Draft a dependent claim for the camera fusion" },
    ],
    risk: [
        { label: "Analyze potential 112(b) indefiniteness", type: "chat_prompt", prompt: "Analyze potential 112(b) indefiniteness" },
        { label: "Search for prior art", type: "chat_prompt", prompt: "Search for prior art on LiDAR weight adjustment" },
    ],
    spec: [
        { label: "Generate a summary of the invention", type: "chat_prompt", prompt: "Generate a summary of the invention" },
        { label: "Create an abstract", type: "chat_prompt", prompt: "Create an abstract based on independent claims" },
    ],
    qa: [
        { label: "Verify all reference numbers", type: "chat_prompt", prompt: "Verify all reference numbers are used" },
        { label: "Check claim numbering", type: "chat_prompt", prompt: "Check claim numbering sequence" },
    ],
    export: [
        { label: "Generate USPTO-ready PDF", type: "chat_prompt", prompt: "Generate USPTO-ready PDF" },
        { label: "Export claim tree to Word", type: "chat_prompt", prompt: "Export claim tree to Word" },
    ],
};

export default function ChatPanel({
    messages = defaultMessages,
    onSendMessage,
    onArtifactNavigate,
    inputPrefill,
    onClearPrefill,
    threadTitle = 'Main Draft Thread',
    threadMode = 'DRAFTING',
    onProposalAction,
    currentStage = 'claims',
}: ChatPanelProps) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle prefill from "Add to Chat"
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
        <div className="main-content" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'var(--color-content-bg)',
            minWidth: 0,
        }}>
            {/* Thread Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 24px',
                borderBottom: '1px solid var(--color-content-border)',
                background: 'var(--color-content-surface)',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--color-content-text)' }}>
                        {threadTitle}
                    </h2>
                    <span style={{
                        fontSize: 10, fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--color-content-raised)',
                        color: 'var(--color-content-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}>
                        {threadMode}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-content-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
                        Active Session · Last synced 2m ago
                    </span>
                    <button style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-content-text-muted)', padding: 4,
                        display: 'flex', alignItems: 'center',
                    }}>
                        <Download size={16} />
                    </button>
                    <button style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-content-text-muted)', padding: 4,
                        display: 'flex', alignItems: 'center',
                    }}>
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Chat Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
            }}>
                {messages.map((msg) => {
                    if (msg.role === 'system') {
                        return (
                            <div key={msg.id} className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                                <div className="chat-bubble-system">
                                    {msg.content}
                                </div>
                            </div>
                        );
                    }

                    if (msg.role === 'user') {
                        return (
                            <div key={msg.id} className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'flex-start' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-content-text-secondary)' }}>
                                            Attorney
                                        </span>
                                        <span style={{ fontSize: 11, color: 'var(--color-content-text-muted)' }}>
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                    <div className="chat-bubble-user">
                                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{msg.content}</p>
                                    </div>
                                </div>
                                <div style={{
                                    width: 32, height: 32,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b6dd1, #5b8def)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 700, color: 'white',
                                    flexShrink: 0, marginTop: 20,
                                }}>JD</div>
                            </div>
                        );
                    }

                    // Assistant message
                    return (
                        <div key={msg.id} className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'flex-start', gap: 10, alignItems: 'flex-start' }}>
                            <div style={{
                                width: 32, height: 32,
                                borderRadius: '50%',
                                background: 'var(--color-content-raised)',
                                border: '1px solid var(--color-content-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, marginTop: 20,
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-content-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 8V4H8" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4v4" />
                                    <rect x="4" y="8" width="16" height="12" rx="2" />
                                    <circle cx="9" cy="13" r="1" /><circle cx="15" cy="13" r="1" />
                                    <path d="M9 17h6" />
                                </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-content-text-secondary)' }}>
                                        Certis AI
                                    </span>
                                    <span style={{ fontSize: 11, color: 'var(--color-content-text-muted)' }}>{msg.timestamp}</span>
                                </div>
                                <div className="chat-bubble-ai">
                                    {formatMessageContent(msg.content, onArtifactNavigate)}
                                </div>

                                {/* Proposal Gate */}
                                {msg.proposal && (
                                    <CommitGate
                                        title={msg.proposal.title}
                                        description={msg.proposal.description}
                                        status={msg.proposal.status}
                                        onAccept={() => onProposalAction?.(msg.id, 'accept')}
                                        onReject={() => onProposalAction?.(msg.id, 'reject')}
                                    />
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, paddingLeft: 4 }}>
                                    <button style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: 11, color: 'var(--color-content-text-muted)',
                                        padding: 0,
                                    }}
                                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-blue-500)'}
                                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-content-text-muted)'}
                                    >
                                        <Copy size={12} />
                                    </button>
                                    <span style={{
                                        fontSize: 11, color: 'var(--color-blue-500)',
                                        cursor: 'pointer', fontWeight: 500,
                                    }}>
                                        Apply Changes
                                    </span>
                                    <span style={{
                                        fontSize: 11, color: 'var(--color-content-text-muted)',
                                        cursor: 'pointer',
                                    }}>
                                        Compare Diff
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Contextual Prompts */}
            <ContextualPrompts
                suggestions={STAGE_SUGGESTIONS[currentStage] || STAGE_SUGGESTIONS['claims']}
                onPromptSelect={(text) => setInputValue(text)}
                onWorkflowAction={() => {}}
            />

            {/* Input Bar */}
            <div style={{
                padding: '0 28px 16px',
                background: 'var(--color-content-surface)',
                borderTop: 'none',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 10,
                    padding: '10px 14px',
                    background: 'var(--color-content-bg)',
                    border: '1px solid var(--color-content-border)',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'border-color 0.15s ease',
                }}>
                    <button style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-content-text-muted)', padding: 4,
                        display: 'flex', alignItems: 'center',
                        flexShrink: 0,
                    }} title="Upload file">
                        <Paperclip size={18} />
                    </button>

                    <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Draft claims, request analysis, or ask for suggestions..."
                        rows={inputValue.includes('\n') ? 3 : 1}
                        style={{
                            flex: 1,
                            background: 'none',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--color-content-text)',
                            fontSize: 13,
                            fontFamily: 'var(--font-sans)',
                            lineHeight: 1.5,
                            resize: 'none',
                            maxHeight: 100,
                        }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--color-content-text-muted)', padding: 4,
                            display: 'flex', alignItems: 'center',
                            flexShrink: 0,
                        }}>
                            <Settings size={18} />
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            style={{
                                background: inputValue.trim() ? 'var(--color-accent-500)' : 'transparent',
                                border: 'none',
                                cursor: inputValue.trim() ? 'pointer' : 'default',
                                color: inputValue.trim() ? 'white' : 'var(--color-content-text-muted)',
                                padding: 6,
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex', alignItems: 'center',
                                flexShrink: 0,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
                <p style={{
                    margin: '8px 0 0',
                    fontSize: 11,
                    color: 'var(--color-content-text-muted)',
                    textAlign: 'center',
                }}>
                    AI outputs are generated for structural assistance. <span style={{ textDecoration: 'underline' }}>Attorney review required.</span>
                </p>
            </div>
        </div>
    );
}
