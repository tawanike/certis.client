'use client';

import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';

interface HoverableTextProps {
    text: string;
    onAddToChat?: (text: string) => void;
    children: React.ReactNode;
}

export default function HoverableText({ text, onAddToChat, children }: HoverableTextProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onAddToChat?.(text);
                }}
                style={{
                    position: 'absolute',
                    top: 4,
                    right: -4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-accent-500)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateX(0)' : 'translateX(6px)',
                    transition: 'opacity 0.15s ease, transform 0.15s ease',
                    pointerEvents: isHovered ? 'auto' : 'none',
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
            >
                <MessageSquarePlus size={11} />
                Add to Chat
            </button>
        </div>
    );
}
