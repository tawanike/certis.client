'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FileText, Hash, BookOpen } from 'lucide-react';

export type MentionType = 'document' | 'claim' | 'brief';

export interface MentionItem {
    id: string;
    label: string;
    type: MentionType;
    detail?: string;
}

interface MentionPopoverProps {
    items: MentionItem[];
    query: string;
    triggerChar: '@' | '#';
    onSelect: (item: MentionItem) => void;
    onClose: () => void;
    activeIndex: number;
}

const TYPE_ICONS: Record<MentionType, React.ElementType> = {
    document: FileText,
    claim: Hash,
    brief: BookOpen,
};

const TYPE_COLORS: Record<MentionType, string> = {
    document: 'var(--color-accent-500)',
    claim: 'var(--color-primary, #3b82f6)',
    brief: 'var(--color-success, #16a34a)',
};

export default function MentionPopover({
    items,
    query,
    triggerChar,
    onSelect,
    onClose,
    activeIndex,
}: MentionPopoverProps) {
    const listRef = useRef<HTMLDivElement>(null);

    // Scroll active item into view
    useEffect(() => {
        if (listRef.current) {
            const active = listRef.current.children[activeIndex] as HTMLElement;
            active?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    const filtered = items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
        return (
            <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: 4,
                background: 'var(--color-content-surface)',
                border: '1px solid var(--color-content-border)',
                borderRadius: 'var(--radius-md, 6px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '8px 12px',
                zIndex: 50,
            }}>
                <p style={{
                    margin: 0,
                    fontSize: 12,
                    color: 'var(--color-content-text-muted)',
                    fontStyle: 'italic',
                }}>
                    No matches for {triggerChar}{query}
                </p>
            </div>
        );
    }

    return (
        <div
            ref={listRef}
            style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: 4,
                background: 'var(--color-content-surface)',
                border: '1px solid var(--color-content-border)',
                borderRadius: 'var(--radius-md, 6px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                maxHeight: 200,
                overflowY: 'auto',
                zIndex: 50,
            }}
        >
            <div style={{
                padding: '4px 8px 2px',
                fontSize: 9,
                fontWeight: 700,
                color: 'var(--color-content-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
            }}>
                {triggerChar === '@' ? 'Files & Briefs' : 'Claims'}
            </div>
            {filtered.map((item, idx) => {
                const Icon = TYPE_ICONS[item.type];
                const isActive = idx === activeIndex;
                return (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item)}
                        onMouseDown={(e) => e.preventDefault()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            background: isActive ? 'var(--color-content-bg-hover)' : 'transparent',
                            transition: 'background 0.1s ease',
                        }}
                        onMouseOver={(e) => {
                            if (!isActive) e.currentTarget.style.background = 'var(--color-content-bg-hover)';
                        }}
                        onMouseOut={(e) => {
                            if (!isActive) e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <Icon size={13} style={{ color: TYPE_COLORS[item.type], flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: 'var(--color-content-text)',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {item.label}
                            </span>
                            {item.detail && (
                                <span style={{
                                    fontSize: 10,
                                    color: 'var(--color-content-text-muted)',
                                }}>
                                    {item.detail}
                                </span>
                            )}
                        </div>
                        <span style={{
                            fontSize: 9,
                            fontWeight: 600,
                            color: TYPE_COLORS[item.type],
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            flexShrink: 0,
                        }}>
                            {item.type}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/**
 * Build mentionable items from matter data.
 */
export function buildMentionItems(
    documents: Array<{ id: string; filename: string; total_pages?: number; status?: string }>,
    claims: Array<{ id: number; type: string; category: string; text: string }>,
    briefVersion?: { id: string; version_number: number; is_authoritative: boolean } | null,
): { atItems: MentionItem[]; hashItems: MentionItem[] } {
    const atItems: MentionItem[] = [];
    const hashItems: MentionItem[] = [];

    // Documents → @
    for (const doc of documents) {
        if (doc.status === 'failed') continue;
        atItems.push({
            id: doc.id,
            label: doc.filename,
            type: 'document',
            detail: doc.total_pages ? `${doc.total_pages} pages` : undefined,
        });
    }

    // Brief → @
    if (briefVersion) {
        atItems.push({
            id: briefVersion.id,
            label: `Brief v${briefVersion.version_number}`,
            type: 'brief',
            detail: briefVersion.is_authoritative ? 'Approved' : 'Pending',
        });
    }

    // Claims → #
    function flattenClaims(claimList: Array<any>) {
        for (const c of claimList) {
            hashItems.push({
                id: String(c.id),
                label: `Claim ${c.id}`,
                type: 'claim',
                detail: `${c.type} · ${c.category}`,
            });
            if (c.children && c.children.length > 0) {
                flattenClaims(c.children);
            }
        }
    }
    flattenClaims(claims);

    return { atItems, hashItems };
}
