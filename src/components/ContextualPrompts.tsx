import React from 'react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Suggestion } from '@/types';

interface ContextualPromptsProps {
    suggestions: Suggestion[];
    onPromptSelect: (text: string) => void;
    onWorkflowAction: (actionId: string) => void;
    isLoading?: boolean;
}

function SkeletonPills() {
    return (
        <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="animate-pulse rounded-full bg-[var(--color-content-surface)] border border-[var(--color-content-border)]"
                    style={{
                        height: 30,
                        width: 120 + (i % 3) * 40,
                    }}
                />
            ))}
        </div>
    );
}

export default function ContextualPrompts({
    suggestions,
    onPromptSelect,
    onWorkflowAction,
    isLoading = false,
}: ContextualPromptsProps) {
    const handleClick = (suggestion: Suggestion) => {
        if (suggestion.type === 'workflow_action' && suggestion.action_id) {
            onWorkflowAction(suggestion.action_id);
        } else if (suggestion.prompt) {
            onPromptSelect(suggestion.prompt);
        }
    };

    return (
        <div className="flex flex-col gap-2 p-3 bg-[var(--color-bg-tertiary)]/30 border-t border-[var(--color-content-border)]">
            <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-[var(--color-accent-500)]" />
                <span className="text-[11px] font-semibold text-[var(--color-content-text-secondary)] uppercase tracking-wider">
                    Suggested Actions
                </span>
            </div>
            {isLoading ? (
                <SkeletonPills />
            ) : (
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => {
                        const isWorkflow = suggestion.type === 'workflow_action';
                        return (
                            <button
                                key={index}
                                onClick={() => handleClick(suggestion)}
                                className={`
                                    text-left px-3 py-1.5 rounded-full
                                    text-[13px]
                                    hover:shadow-sm
                                    transition-all duration-200
                                    flex items-center gap-2 group
                                    ${isWorkflow
                                        ? 'bg-[var(--color-accent-50)] border border-[var(--color-accent-200)] text-[var(--color-accent-700)] hover:bg-[var(--color-accent-100)] hover:border-[var(--color-accent-400)]'
                                        : 'bg-[var(--color-content-surface)] border border-[var(--color-content-border)] text-[var(--color-content-text)] hover:border-[var(--color-accent-500)] hover:text-[var(--color-accent-500)]'
                                    }
                                `}
                            >
                                {isWorkflow && (
                                    <Zap size={12} className="text-[var(--color-accent-500)] flex-shrink-0" />
                                )}
                                <span>{suggestion.label}</span>
                                {!isWorkflow && (
                                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1 group-hover:ml-0" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
