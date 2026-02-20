'use client';

import React from 'react';
import {
    FolderOpen,
    FileText,
    PenTool,
    BookOpen,
    Search,
    FileCheck,
    Image,
    File,
} from 'lucide-react';
import { DocumentResponse } from '@/types';

// Map file types or names to tabs, simplified since we only have filenames now
const getTabForDoc = (doc: DocumentResponse): string => {
    const name = doc.filename.toLowerCase();
    if (name.includes('spec')) return 'spec';
    if (name.includes('claim')) return 'claims';
    if (name.includes('qa') || name.includes('ids')) return 'qa';
    if (name.includes('brief') || name.includes('response')) return 'brief';
    return 'wrapper';
};

const getIconForDoc = (doc: DocumentResponse) => {
    const name = doc.filename.toLowerCase();
    if (name.includes('spec')) return BookOpen;
    if (name.includes('claim')) return PenTool;
    if (name.includes('qa') || name.includes('ids')) return Search;
    if (name.includes('brief') || name.includes('response')) return FileCheck;
    if (doc.content_type.includes('image')) return Image;
    return FileText;
};

interface FileWrapperViewerProps {
    documents: DocumentResponse[];
    onNavigate?: (tab: string) => void;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
}

export default function FileWrapperViewer({ documents, onNavigate }: FileWrapperViewerProps) {
    // Group documents by date
    const grouped = documents.reduce<Record<string, DocumentResponse[]>>((acc, doc) => {
        const date = formatDate(doc.created_at);
        if (!acc[date]) acc[date] = [];
        acc[date].push(doc);
        return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort(
        (a, b) => new Date(grouped[a][0].created_at).getTime() - new Date(grouped[b][0].created_at).getTime()
    );

    return (
        <div style={{ padding: 28, maxWidth: 800 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <FolderOpen size={18} style={{ color: 'var(--color-accent-500)' }} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-content-text)' }}>
                    File Wrapper
                </h3>
                <span style={{
                    fontSize: 11, color: 'var(--color-content-text-muted)',
                    marginLeft: 'auto',
                }}>
                    {documents.length} document{documents.length !== 1 ? 's' : ''}
                </span>
            </div>

            {documents.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 40,
                    color: 'var(--color-content-text-muted)', fontSize: 13,
                }}>
                    No documents in the file wrapper yet. Documents are added when workstreams produce finalized artifacts.
                </div>
            ) : (
                <div style={{ position: 'relative' }}>
                    {/* Timeline line */}
                    <div style={{
                        position: 'absolute',
                        left: 15,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        background: 'var(--color-content-border)',
                        borderRadius: 1,
                    }} />

                    {sortedDates.map((date, di) => (
                        <div key={date} style={{ marginBottom: 24 }}>
                            {/* Date label */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                marginBottom: 10,
                                position: 'relative',
                            }}>
                                <div style={{
                                    width: 10, height: 10,
                                    borderRadius: '50%',
                                    background: 'var(--color-accent-500)',
                                    border: '2px solid var(--color-content-surface)',
                                    zIndex: 1,
                                    flexShrink: 0,
                                    marginLeft: 11,
                                }} />
                                <span style={{
                                    fontSize: 12, fontWeight: 700,
                                    color: 'var(--color-content-text)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                }}>
                                    {date}
                                </span>
                            </div>

                            {/* Documents in this group */}
                            <div style={{
                                display: 'flex', flexDirection: 'column', gap: 6,
                                marginLeft: 40,
                            }}>
                                {grouped[date].map(doc => {
                                    const Icon = getIconForDoc(doc);
                                    return (
                                        <div key={doc.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 14px',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--color-content-border)',
                                            background: 'var(--color-content-surface)',
                                            cursor: 'pointer',
                                            transition: 'all 0.1s ease',
                                        }}
                                            onClick={() => {
                                                const tab = getTabForDoc(doc);
                                                if (tab && onNavigate) onNavigate(tab);
                                            }}
                                            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-accent-300)'}
                                            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-content-border)'}
                                        >
                                            <Icon size={16} style={{ color: 'var(--color-accent-500)', flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: 13, fontWeight: 500,
                                                    color: 'var(--color-content-text)',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    {doc.filename}
                                                </div>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: 8,
                                                    fontSize: 11, color: 'var(--color-content-text-muted)',
                                                    marginTop: 2,
                                                }}>
                                                    <span>Matter intake</span>
                                                    <span>•</span>
                                                    <span style={{ color: doc.status === 'ready' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                                                        {doc.status}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{doc.total_pages} {doc.total_pages === 1 ? 'page' : 'pages'}</span>
                                                </div>
                                            </div>
                                            <span style={{
                                                fontSize: 10, fontWeight: 600,
                                                padding: '2px 6px',
                                                borderRadius: 'var(--radius-xs)',
                                                background: 'var(--color-content-raised)',
                                                color: 'var(--color-content-text-muted)',
                                            }}>
                                                v1
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
