import React, { useState } from 'react';
import { Check, X, GitCommit, Code2 } from 'lucide-react';

interface CommitGateProps {
    title: string;
    description: string;
    status: 'pending' | 'accepted' | 'rejected';
    diff?: string;
    onAccept: () => void;
    onReject: () => void;
}

function DiffView({ diff }: { diff: string }) {
    const lines = diff.split('\n');
    return (
        <div
            className="mt-3 rounded border border-[var(--color-content-border)] overflow-hidden"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
        >
            {lines.map((line, i) => {
                const isRemoval = line.startsWith('-');
                const isAddition = line.startsWith('+');
                return (
                    <div
                        key={i}
                        style={{
                            padding: '3px 10px',
                            background: isRemoval
                                ? 'rgba(220, 38, 38, 0.08)'
                                : isAddition
                                    ? 'rgba(22, 163, 74, 0.08)'
                                    : 'transparent',
                            color: isRemoval
                                ? 'var(--color-danger, #dc2626)'
                                : isAddition
                                    ? 'var(--color-success, #16a34a)'
                                    : 'var(--color-content-text-secondary)',
                            textDecoration: isRemoval ? 'line-through' : 'none',
                            borderBottom: i < lines.length - 1 ? '1px solid var(--color-content-border)' : 'none',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6,
                        }}
                    >
                        {line}
                    </div>
                );
            })}
        </div>
    );
}

export default function CommitGate({ title, description, status, diff, onAccept, onReject }: CommitGateProps) {
    const [showDiff, setShowDiff] = useState(false);

    if (status !== 'pending') {
        return (
            <div className={`
                flex items-center gap-3 p-3 rounded-md border text-[13px]
                ${status === 'accepted'
                    ? 'bg-[var(--color-success-light)] border-[var(--color-success)] text-[var(--color-success-dark)]'
                    : 'bg-[var(--color-content-bg-hover)] border-[var(--color-content-border)] text-[var(--color-content-text-muted)]'}
            `}>
                <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center shrink-0
                    ${status === 'accepted' ? 'bg-[var(--color-success)] text-white' : 'bg-[var(--color-content-text-muted)] text-white'}
                `}>
                    {status === 'accepted' ? <Check size={14} /> : <X size={14} />}
                </div>
                <div className="flex-1 font-medium">
                    {status === 'accepted' ? 'Change Approved & Merged' : 'Change Rejected'}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--color-content-surface)] border border-[var(--color-content-border)] rounded-lg overflow-hidden shadow-sm my-2">
            {/* Header */}
            <div className="bg-[var(--color-content-raised)] px-4 py-2 border-b border-[var(--color-content-border)] flex items-center gap-2">
                <GitCommit size={16} className="text-[var(--color-accent-500)]" />
                <span className="text-[12px] font-bold text-[var(--color-content-text)] uppercase tracking-wider">
                    Proposed Changes
                </span>
            </div>

            {/* Content */}
            <div className="p-4">
                <h4 className="text-[14px] font-bold text-[var(--color-content-text)] mb-1">
                    {title}
                </h4>
                <p className="text-[13px] text-[var(--color-content-text-secondary)] leading-relaxed mb-4">
                    {description}
                </p>

                {/* Diff view (above buttons when visible) */}
                {showDiff && diff && <DiffView diff={diff} />}

                {/* Three-button row */}
                <div className={`flex gap-2 ${showDiff && diff ? 'mt-3' : ''}`}>
                    <button
                        onClick={onAccept}
                        className="flex items-center gap-2 px-4 py-2 rounded text-[13px] font-medium bg-[var(--color-content-text)] text-[var(--color-content-surface)] hover:opacity-90 transition-opacity"
                    >
                        <Check size={14} />
                        Review & Merge
                    </button>
                    <button
                        onClick={onReject}
                        className="flex items-center gap-2 px-3 py-2 rounded text-[13px] font-medium border border-[var(--color-content-border)] text-[var(--color-content-text-secondary)] hover:bg-[var(--color-content-bg-hover)] transition-colors"
                    >
                        <X size={14} />
                        Reject
                    </button>
                    {diff && (
                        <button
                            onClick={() => setShowDiff(!showDiff)}
                            className="flex items-center gap-2 px-3 py-2 rounded text-[13px] font-medium border border-[var(--color-content-border)] text-[var(--color-content-text-secondary)] hover:bg-[var(--color-content-bg-hover)] transition-colors ml-auto"
                        >
                            <Code2 size={14} />
                            {showDiff ? 'Hide Diff' : 'Compare Diff'}
                        </button>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[var(--color-content-border)] bg-[var(--color-content-bg)]">
                <p className="text-[11px] text-[var(--color-content-text-muted)] m-0">
                    Changes are sandboxed until merged.
                </p>
            </div>
        </div>
    );
}
