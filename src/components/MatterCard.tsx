'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, ChevronRight } from 'lucide-react';
import { Matter, STATUS_LABELS } from '@/types';

interface MatterCardProps {
    matter: Matter;
}

function MiniScoreRing({ score }: { score: number }) {
    const size = 36;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const color = score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';

    return (
        <div className="score-ring" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-bg-active)" strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                />
            </svg>
            <span className="score-value" style={{ fontSize: 12 }}>{score}</span>
        </div>
    );
}

export default function MatterCard({ matter }: MatterCardProps) {
    const statusInfo = STATUS_LABELS[matter.status] || { label: matter.status, variant: 'info' };
    const juris = matter.jurisdictions && matter.jurisdictions.length > 0 ? matter.jurisdictions[0] : 'USPTO';
    const score = matter.defensibility_score || 0;
    const inventorsStr = matter.inventors?.join(', ') || 'Unknown';
    const assigneeStr = matter.assignee || 'Unknown';
    const domainStr = matter.tech_domain || 'Uncategorized';

    // Format dates nicely
    const dateObj = new Date(matter.updated_at || matter.created_at);
    const lastEdited = dateObj.toLocaleDateString();

    return (
        <Link href={`/matter/${matter.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card glass-card-hover" style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                cursor: 'pointer',
            }}>
                {/* Score */}
                <MiniScoreRing score={score} />

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
                        {matter.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                        <span className={`badge badge-accent`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Globe size={10} /> {juris}
                        </span>
                        <span className={`badge badge-${statusInfo.variant}`}>
                            {statusInfo.label}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            {domainStr}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                            <strong style={{ color: 'var(--color-text-secondary)' }}>Inventor(s):</strong> {inventorsStr}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                            <strong style={{ color: 'var(--color-text-secondary)' }}>Assignee:</strong> {assigneeStr}
                        </span>
                    </div>
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {lastEdited}
                    </span>
                    <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
            </div>
        </Link>
    );
}
