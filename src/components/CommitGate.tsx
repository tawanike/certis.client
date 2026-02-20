import React from 'react';
import { Check, X, GitCommit, ArrowRight } from 'lucide-react';

interface CommitGateProps {
    title: string;
    description: string;
    status: 'pending' | 'accepted' | 'rejected';
    onAccept: () => void;
    onReject: () => void;
}

export default function CommitGate({ title, description, status, onAccept, onReject }: CommitGateProps) {
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
                    Proposed Change
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

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onReject}
                        className="flex-1 py-2 px-3 rounded text-[13px] font-medium border border-[var(--color-content-border)] text-[var(--color-content-text-muted)] hover:bg-[var(--color-content-bg-hover)] transition-colors"
                    >
                        Reject
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 py-2 px-3 rounded text-[13px] font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Check size={14} />
                        Approve & Merge
                    </button>
                </div>
            </div>
        </div>
    );
}
