'use client';

import React from 'react';
import HoverableText from './HoverableText';

const risks = [
    {
        category: 'FUNCTIONAL',
        claim: 'Claim 1',
        description: '"Degradation metric" lacks specific parameters — could face an indefiniteness rejection.',
        severity: 'medium',
    },
    {
        category: 'PRIOR ART',
        claim: 'Claim 3',
        description: 'Overlap with US2023/0145782 — consider narrowing the environmental monitoring limitation.',
        severity: 'low',
    },
];

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

export default function RiskDashboard({ onAddToChat }: { onAddToChat?: (text: string) => void }) {
    return (
        <div className="p-4">
            {/* Score */}
            <div className="flex flex-col items-center mb-6 pb-6 border-b border-[var(--color-content-border)]">
                <ScoreCircle score={82} />
                <p className="mt-3 text-[11px] text-[var(--color-content-text-muted)] text-center">
                    Outperforms <strong className="text-[var(--color-content-text-secondary)]">85%</strong> of similar portfolios
                </p>
            </div>

            {/* Detected Risks Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[var(--color-content-text)] uppercase tracking-wider">
                    Detected Risks
                </span>
                <button className="text-[11px] font-medium text-[var(--color-blue-500)] hover:underline cursor-pointer bg-transparent border-none p-0">
                    Filter by Severity
                </button>
            </div>

            {/* Risk Cards */}
            <div className="space-y-2">
                {risks.map((risk, idx) => (
                    <div
                        key={idx}
                        className="p-3.5 bg-[var(--color-content-surface)] border border-[var(--color-content-border)] rounded-[var(--radius-sm)] transition-shadow hover:shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-[var(--color-content-text-muted)] uppercase tracking-wider">
                                {risk.category}
                            </span>
                            <span className="text-[10px] text-[var(--color-content-text-muted)]">·</span>
                            <span className="text-[10px] font-medium text-[var(--color-content-text-muted)]">
                                {risk.claim}
                            </span>
                            <span className={`ml-auto badge ${risk.severity === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                                {risk.severity === 'medium' ? 'MEDIUM PRIORITY' : 'LOW PRIORITY'}
                            </span>
                        </div>
                        <HoverableText text={risk.description} onAddToChat={onAddToChat}>
                            <p className="m-0 text-[12px] leading-relaxed text-[var(--color-content-text-secondary)]">
                                {risk.description}
                            </p>
                        </HoverableText>

                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={() => onAddToChat?.(`Discuss the ${risk.severity} risk in ${risk.claim}: ${risk.description}`)}
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
        </div>
    );
}
