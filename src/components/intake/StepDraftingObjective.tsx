'use client';

import React from 'react';
import { Target, FileText, BookOpen, Layers, Compass } from 'lucide-react';
import type { MatterFormData } from '@/app/matter/new/page';

interface StepProps {
    formData: MatterFormData;
    updateFormData: (updates: Partial<MatterFormData>) => void;
}

const OBJECTIVES = [
    {
        id: 'CLAIMS',
        name: 'Claim Set',
        description: 'Generate independent and dependent claims with risk analysis',
        icon: FileText,
    },
    {
        id: 'SPECIFICATION',
        name: 'Full Specification',
        description: 'Claims plus detailed description, embodiments, and figures',
        icon: BookOpen,
    },
    {
        id: 'APPLICATION',
        name: 'Complete Application',
        description: 'End-to-end draft ready for filing — claims, specification, abstract, and export',
        icon: Layers,
    },
    {
        id: 'EXPLORATION',
        name: 'Invention Exploration',
        description: 'Structured breakdown and analysis without formal drafting',
        icon: Compass,
    },
] as const;

export default function StepDraftingObjective({ formData, updateFormData }: StepProps) {
    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{
                        width: 40, height: 40,
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-accent-50)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-accent-500)',
                    }}>
                        <Target size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-content-text)' }}>
                            Drafting Objective
                        </h2>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-content-text-muted)' }}>
                            What would you like to achieve at the end of this process?
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {OBJECTIVES.map(obj => {
                    const selected = formData.draftingObjective === obj.id;
                    const Icon = obj.icon;
                    return (
                        <button
                            key={obj.id}
                            onClick={() => updateFormData({ draftingObjective: obj.id })}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '16px 18px',
                                borderRadius: 'var(--radius-md)',
                                border: `1.5px solid ${selected ? 'var(--color-accent-400)' : 'var(--color-content-border-strong)'}`,
                                background: selected ? 'var(--color-accent-50)' : 'var(--color-content-surface)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                textAlign: 'left',
                                width: '100%',
                            }}
                        >
                            <div style={{
                                width: 40, height: 40,
                                borderRadius: 'var(--radius-md)',
                                background: selected ? 'var(--color-accent-100)' : 'var(--color-content-raised)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all 0.15s ease',
                            }}>
                                <Icon size={18} style={{
                                    color: selected ? 'var(--color-accent-600)' : 'var(--color-content-text-muted)',
                                }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: 14, fontWeight: 600,
                                    color: selected ? 'var(--color-accent-700)' : 'var(--color-content-text)',
                                }}>
                                    {obj.name}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--color-content-text-muted)', marginTop: 2 }}>
                                    {obj.description}
                                </div>
                            </div>
                            <div style={{
                                width: 20, height: 20,
                                borderRadius: 'var(--radius-full)',
                                border: `2px solid ${selected ? 'var(--color-accent-500)' : 'var(--color-content-border-strong)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s ease',
                                flexShrink: 0,
                            }}>
                                {selected && (
                                    <div style={{
                                        width: 10, height: 10,
                                        borderRadius: 'var(--radius-full)',
                                        background: 'var(--color-accent-500)',
                                    }} />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
