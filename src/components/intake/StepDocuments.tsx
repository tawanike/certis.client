'use client';

import React, { useCallback } from 'react';
import { Upload, FileText, X, File, AlertCircle } from 'lucide-react';
import type { MatterFormData } from '@/app/matter/new/page';

interface StepProps {
    formData: MatterFormData;
    updateFormData: (updates: Partial<MatterFormData>) => void;
}

const ACCEPTED_TYPES = ['.pdf', '.docx', '.doc', '.txt', '.rtf'];
const ACCEPTED_MIME = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'];

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(name: string) {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (ext === 'docx' || ext === 'doc') return '📝';
    if (ext === 'txt') return '📃';
    return '📎';
}

export default function StepDocuments({ formData, updateFormData }: StepProps) {
    const handleDisclosureDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) updateFormData({ inventionDisclosure: file });
    }, [updateFormData]);

    const handleDisclosureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) updateFormData({ inventionDisclosure: file });
    };

    const handleSupportingDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        updateFormData({ supportingDocuments: [...formData.supportingDocuments, ...files] });
    }, [formData.supportingDocuments, updateFormData]);

    const handleSupportingSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        updateFormData({ supportingDocuments: [...formData.supportingDocuments, ...files] });
    };

    const removeSupportingDoc = (index: number) => {
        updateFormData({
            supportingDocuments: formData.supportingDocuments.filter((_, i) => i !== index)
        });
    };

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
                        <Upload size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-content-text)' }}>
                            Documents
                        </h2>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-content-text-muted)' }}>
                            Upload the invention disclosure and any supporting documents
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* Invention Disclosure */}
                <div>
                    <label style={{
                        display: 'block', fontSize: 13, fontWeight: 600,
                        color: 'var(--color-content-text-secondary)', marginBottom: 8,
                    }}>
                        Invention Disclosure
                    </label>

                    {!formData.inventionDisclosure ? (
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDisclosureDrop}
                            style={{
                                border: '2px dashed var(--color-content-border-strong)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '36px 24px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: 'var(--color-content-raised)',
                            }}
                            onDragEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-accent-400)';
                                e.currentTarget.style.background = 'var(--color-accent-50)';
                            }}
                            onDragLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-content-border-strong)';
                                e.currentTarget.style.background = 'var(--color-content-raised)';
                            }}
                            onClick={() => document.getElementById('disclosure-input')?.click()}
                        >
                            <Upload size={28} style={{ color: 'var(--color-content-text-muted)', marginBottom: 8 }} />
                            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: 'var(--color-content-text)' }}>
                                Drag and drop or <span style={{ color: 'var(--color-accent-500)', fontWeight: 600 }}>browse</span>
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-content-text-muted)' }}>
                                PDF, DOCX, or TXT — Max 50MB
                            </p>
                            <input
                                id="disclosure-input"
                                type="file"
                                accept={ACCEPTED_TYPES.join(',')}
                                onChange={handleDisclosureSelect}
                                style={{ display: 'none' }}
                            />
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-accent-200)',
                            background: 'var(--color-accent-50)',
                        }}>
                            <span style={{ fontSize: 20 }}>{getFileIcon(formData.inventionDisclosure.name)}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-content-text)' }}>
                                    {formData.inventionDisclosure.name}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--color-content-text-muted)' }}>
                                    {formatFileSize(formData.inventionDisclosure.size)}
                                </div>
                            </div>
                            <button
                                onClick={() => updateFormData({ inventionDisclosure: null })}
                                style={{
                                    width: 24, height: 24,
                                    borderRadius: 'var(--radius-full)',
                                    border: 'none', background: 'rgba(0,0,0,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: 'var(--color-content-text-muted)',
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 6,
                        marginTop: 8, padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-info-light)',
                    }}>
                        <AlertCircle size={14} style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: 1 }} />
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-content-text-secondary)', lineHeight: 1.5 }}>
                            Certis will extract structural elements and novel features automatically from the disclosure.
                        </p>
                    </div>
                </div>

                {/* Supporting Documents */}
                <div>
                    <label style={{
                        display: 'block', fontSize: 13, fontWeight: 600,
                        color: 'var(--color-content-text-secondary)', marginBottom: 4,
                    }}>
                        Supporting Documents <span style={{ color: 'var(--color-content-text-muted)', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--color-content-text-muted)' }}>
                        Engineer&apos;s notes, technical briefs, prior art references, etc.
                    </p>

                    {/* File list */}
                    {formData.supportingDocuments.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                            {formData.supportingDocuments.map((file, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '8px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--color-content-border)',
                                    background: 'var(--color-content-surface)',
                                }}>
                                    <span style={{ fontSize: 16 }}>{getFileIcon(file.name)}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-content-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {file.name}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--color-content-text-muted)' }}>
                                            {formatFileSize(file.size)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeSupportingDoc(i)}
                                        style={{
                                            width: 22, height: 22,
                                            borderRadius: 'var(--radius-full)',
                                            border: 'none', background: 'rgba(0,0,0,0.06)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: 'var(--color-content-text-muted)',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleSupportingDrop}
                        onClick={() => document.getElementById('supporting-input')?.click()}
                        style={{
                            border: '1.5px dashed var(--color-content-border-strong)',
                            borderRadius: 'var(--radius-md)',
                            padding: '20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onDragEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-accent-400)';
                            e.currentTarget.style.background = 'var(--color-accent-50)';
                        }}
                        onDragLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-content-border-strong)';
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-content-text-muted)' }}>
                            <span style={{ color: 'var(--color-accent-500)', fontWeight: 500 }}>Add files</span> or drag and drop
                        </p>
                        <input
                            id="supporting-input"
                            type="file"
                            multiple
                            accept={ACCEPTED_TYPES.join(',')}
                            onChange={handleSupportingSelect}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
