import React from 'react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Stage } from './ProgressTracker';

interface ContextualPromptsProps {
    stage: Stage;
    onPromptSelect: (text: string) => void;
}

const PROMPTS: Record<Stage, string[]> = {
    brief: [
        "Summarize the invention disclosure",
        "Identify key novel features",
        "List potential competitors",
        "Draft a problem-solution statement"
    ],
    claims: [
        "Draft a dependent claim for the camera fusion",
        "Define 'environmental conditions' more precisely",
        "Expand on the fallback mechanism",
        "Check for antecedent basis issues"
    ],
    risk: [
        "Analyze potential 112(b) indefiniteness",
        "Search for prior art on LiDAR weight adjustment",
        "Identify enablement risks in the current scope",
        "Review terms for breadth interpretation"
    ],
    spec: [
        "Generate a summary of the invention",
        "Draft a detailed description for Figure 3",
        "Ensure consistency with Claim 12",
        "Create an abstract based on independent claims"
    ],
    qa: [
        "Verify all reference numbers are used",
        "Check claim numbering sequence",
        "Validate acronym definitions",
        "Ensure consistent terminology usage"
    ],
    export: [
        "Generate USPTO-ready PDF",
        "Export claim tree to Word",
        "Create client report email",
        "Format for filing"
    ]
};

export default function ContextualPrompts({ stage, onPromptSelect }: ContextualPromptsProps) {
    const prompts = PROMPTS[stage] || PROMPTS['claims'];

    return (
        <div className="flex flex-col gap-2 p-3 bg-[var(--color-bg-tertiary)]/30 border-t border-[var(--color-content-border)]">
            <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-[var(--color-accent-500)]" />
                <span className="text-[11px] font-semibold text-[var(--color-content-text-secondary)] uppercase tracking-wider">
                    Suggested Actions
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {prompts.map((prompt, index) => (
                    <button
                        key={index}
                        onClick={() => onPromptSelect(prompt)}
                        className="
              text-left px-3 py-1.5 rounded-full 
              bg-[var(--color-content-surface)] 
              border border-[var(--color-content-border)] 
              text-[13px] text-[var(--color-content-text)] 
              hover:border-[var(--color-accent-500)] 
              hover:text-[var(--color-accent-500)] 
              hover:shadow-sm
              transition-all duration-200
              flex items-center gap-2 group
            "
                    >
                        <span>{prompt}</span>
                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1 group-hover:ml-0" />
                    </button>
                ))}
            </div>
        </div>
    );
}
