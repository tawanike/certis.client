'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import type { MatterFormData } from '@/app/matter/new/page';

interface StepProps {
    formData: MatterFormData;
    updateFormData: (updates: Partial<MatterFormData>) => void;
}

export default function StepMatterDetails({ formData, updateFormData }: StepProps) {
    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
                }}>
                    <div style={{
                        width: 40, height: 40,
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-accent-50)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-accent-500)',
                    }}>
                        <FileText size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-content-text)' }}>
                            Matter Details
                        </h2>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-content-text-muted)' }}>
                            Give your matter a working title and optional description
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Title */}
                <div>
                    <label style={{
                        display: 'block', fontSize: 13, fontWeight: 600,
                        color: 'var(--color-content-text-secondary)', marginBottom: 6,
                    }}>
                        Working Title <span style={{ color: 'var(--color-danger)' }}>*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => updateFormData({ title: e.target.value })}
                        placeholder="e.g. Autonomous Vehicle LiDAR Fusion System"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-content-border-strong)',
                            background: 'var(--color-content-surface)',
                            color: 'var(--color-content-text)',
                            fontSize: 15,
                            fontFamily: 'var(--font-sans)',
                            outline: 'none',
                            transition: 'border-color 0.15s ease',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-400)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--color-content-border-strong)'}
                    />
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-content-text-muted)' }}>
                        A clear, descriptive title for the patent matter
                    </p>
                </div>

                {/* Description */}
                <div>
                    <label style={{
                        display: 'block', fontSize: 13, fontWeight: 600,
                        color: 'var(--color-content-text-secondary)', marginBottom: 6,
                    }}>
                        Short Description <span style={{ color: 'var(--color-content-text-muted)', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        placeholder="Brief overview of the invention or technology area..."
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-content-border-strong)',
                            background: 'var(--color-content-surface)',
                            color: 'var(--color-content-text)',
                            fontSize: 14,
                            fontFamily: 'var(--font-sans)',
                            outline: 'none',
                            resize: 'vertical',
                            transition: 'border-color 0.15s ease',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-400)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--color-content-border-strong)'}
                    />
                </div>
            </div>
        </div>
    );
}
