'use client';

import React, { useState } from 'react';
import { Plus, Check, Pause, Circle } from 'lucide-react';
import { Workstream, WorkstreamType, WORKSTREAM_TYPE_META } from '@/data/mockData';

interface WorkstreamPillsProps {
    workstreams: Workstream[];
    activeId: string;
    onSelect: (id: string) => void;
    onCreateNew?: (type: WorkstreamType, label: string) => void;
}

const STATUS_ICON: Record<Workstream['status'], React.ReactNode> = {
    active: <Circle size={6} fill="var(--color-success)" stroke="none" />,
    paused: <Pause size={8} style={{ color: 'var(--color-warning)' }} />,
    complete: <Check size={8} style={{ color: 'var(--color-success)' }} />,
};

export default function WorkstreamPills({ workstreams, activeId, onSelect, onCreateNew }: WorkstreamPillsProps) {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <div style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--color-content-border)',
            flexShrink: 0,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                overflowX: 'auto',
                scrollbarWidth: 'none',
            }}>
                {workstreams.map(ws => {
                    const isActive = ws.id === activeId;
                    const meta = WORKSTREAM_TYPE_META[ws.type];
                    return (
                        <button
                            key={ws.id}
                            onClick={() => onSelect(ws.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '5px 12px',
                                borderRadius: 'var(--radius-full)',
                                border: isActive
                                    ? `1.5px solid ${meta.color}80`
                                    : '1.5px solid var(--color-content-border)',
                                background: isActive ? `${meta.color}12` : 'transparent',
                                color: isActive ? meta.color : 'var(--color-content-text-muted)',
                                fontSize: 11.5,
                                fontWeight: isActive ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.12s ease',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}
                        >
                            {STATUS_ICON[ws.status]}
                            {ws.label}
                        </button>
                    );
                })}

                {/* New Workstream Button */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 26, height: 26,
                            borderRadius: 'var(--radius-full)',
                            border: '1.5px dashed var(--color-content-border)',
                            background: 'none',
                            color: 'var(--color-content-text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.12s ease',
                            fontSize: 12,
                        }}
                        title="New workstream"
                    >
                        <Plus size={13} />
                    </button>

                    {/* Type Picker Dropdown */}
                    {showPicker && (
                        <div style={{
                            position: 'absolute',
                            top: 32,
                            left: 0,
                            background: 'var(--color-content-surface)',
                            border: '1px solid var(--color-content-border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            padding: 4,
                            zIndex: 100,
                            minWidth: 180,
                        }}>
                            {(Object.entries(WORKSTREAM_TYPE_META) as [WorkstreamType, typeof WORKSTREAM_TYPE_META[WorkstreamType]][]).map(([type, meta]) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        onCreateNew?.(type, meta.label);
                                        setShowPicker(false);
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        width: '100%',
                                        padding: '7px 10px',
                                        border: 'none',
                                        background: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        color: 'var(--color-content-text)',
                                        textAlign: 'left',
                                        transition: 'background 0.1s',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = 'var(--color-content-hover)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                                >
                                    <span style={{ fontSize: 14 }}>{meta.icon}</span>
                                    <span>{meta.label}</span>
                                    <span style={{
                                        width: 8, height: 8,
                                        borderRadius: '50%',
                                        background: meta.color,
                                        flexShrink: 0,
                                        marginLeft: 'auto',
                                    }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
