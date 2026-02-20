'use client';

import React from 'react';
import { Download, Settings, Globe, Zap } from 'lucide-react';

interface TopBarProps {
    matterName?: string;
    jurisdiction?: string;
    status?: string;
    pipeline?: string;
}

export default function TopBar({
    matterName = 'Autonomous Vehicle LiDAR Fusion System',
    jurisdiction = 'USPTO',
    status = 'Claims Generated',
    pipeline = 'Stage 3 of 6',
}: TopBarProps) {
    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            height: 52,
            background: 'var(--color-bg-raised)',
            borderBottom: '1px solid var(--color-border-subtle)',
            flexShrink: 0,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h1 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
                    {matterName}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Globe size={10} /> {jurisdiction}
                    </span>
                    <span className="badge badge-warning">{status}</span>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, color: 'var(--color-text-tertiary)',
                    padding: '6px 12px',
                    background: 'var(--color-bg-surface)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border-subtle)',
                }}>
                    <Zap size={12} style={{ color: 'var(--color-accent-400)' }} />
                    {pipeline}
                </div>

                <button style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-default)',
                    background: 'var(--color-bg-surface)',
                    color: 'var(--color-text-secondary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-500)';
                        e.currentTarget.style.color = 'var(--color-accent-300)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border-default)';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                >
                    <Download size={14} />
                    Export DOCX
                </button>
            </div>
        </header>
    );
}
