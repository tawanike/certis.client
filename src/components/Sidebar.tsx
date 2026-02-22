'use client';

import React from 'react';
import {
    FileText,
    Shield,
    Gavel,
    Plus,
    ChevronDown,
    ChevronRight,
    PanelLeftClose,
    AlertCircle,
    FileCheck,
    FilePlus,
    AlertTriangle,
} from 'lucide-react';
import { Thread, threads as allThreads } from '@/types';

const getBadgeIcon = (badge: string) => {
    if (badge.includes('Risk') || badge.includes('Warning')) {
        return <AlertTriangle size={14} className="text-[var(--color-risk-high)]" />;
    }
    if (badge.includes('Claims Updated')) {
        return <FileCheck size={14} className="text-[var(--color-accent-400)]" />;
    }
    if (badge.includes('Spec Expanded')) {
        return <FilePlus size={14} className="text-[var(--color-accent-400)]" />;
    }
    return <AlertCircle size={14} className="text-[var(--color-content-text-muted)]" />;
};

interface SidebarProps {
    activeThreadId?: string;
    onThreadSelect?: (threadId: string) => void;
    onToggle?: () => void;
}

const matters = [
    { id: 'matter-001', name: 'Autonomous Drone Navigatio...', matId: 'MAT-2024-032', color: '#5b8def' },
    { id: 'matter-002', name: 'Bio-Sensing Wearable Patch...', matId: 'MAT-2024-009', color: '#e05252' },
    { id: 'matter-003', name: 'Distributed Ledger Auth Proto...', matId: 'MAT-2024-V11', color: '#34c28a', badge: 'USPTO' },
];

export default function Sidebar({
    activeThreadId = 'thread-1',
    onThreadSelect,
    onToggle,
}: SidebarProps) {
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        drafting: true,
        risk: true,
        prosecution: true,
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const sections = [
        { key: 'drafting', label: 'Drafting', icon: FileText },
        { key: 'risk', label: 'Risk & QA', icon: Shield },
        { key: 'prosecution', label: 'Prosecution', icon: Gavel },
    ];

    return (
        <aside className="w-[var(--spacing-sidebar)] min-w-[var(--spacing-sidebar)] h-full bg-[var(--color-sidebar-bg)] flex flex-col overflow-hidden border-r border-[var(--color-sidebar-border)]">
            {/* Brand */}
            <div className="p-4 border-b border-[var(--color-sidebar-border)]">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded flex items-center justify-center text-sm font-extrabold text-white bg-gradient-to-br from-[var(--color-accent-400)] to-[var(--color-accent-500)] shadow-sm">
                        C
                    </div>
                    <div className="flex-1">
                        <div className="text-[15px] font-bold text-[var(--color-sidebar-text)] leading-tight">Certis</div>
                        <div className="text-[13px] font-normal text-[var(--color-sidebar-text-muted)]">Analyst</div>
                    </div>
                    {onToggle && (
                        <button
                            onClick={onToggle}
                            title="Collapse sidebar"
                            className="p-1 rounded text-[var(--color-sidebar-text-muted)] hover:text-white hover:bg-[var(--color-sidebar-hover)] transition-all"
                        >
                            <PanelLeftClose size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Matter List */}
            <div className="p-2 border-b border-[var(--color-sidebar-border)]">
                {matters.map(matter => (
                    <div
                        key={matter.id}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${matter.id === 'matter-003' ? 'bg-[var(--color-sidebar-surface)]' : 'hover:bg-[var(--color-sidebar-hover)]'
                            }`}
                    >
                        <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: matter.color }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="m-0 text-[13px] font-medium text-[var(--color-sidebar-text)] truncate">
                                {matter.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-[var(--color-sidebar-text-muted)] truncate block">
                                    {matter.matId}
                                </span>
                                {matter.badge && (
                                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-[var(--color-sidebar-hover)] text-[var(--color-blue-400)] uppercase tracking-wider">
                                        {matter.badge}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Defensibility Score - Minimal/Clean */}
            <div className="px-4 py-4 border-b border-[var(--color-sidebar-border)]">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[var(--color-sidebar-text-muted)] uppercase tracking-wider">
                        Defensibility
                    </span>
                    <span className="text-[13px] font-bold text-[var(--color-blue-400)]">
                        45
                    </span>
                </div>
                <div className="w-full h-1 bg-[var(--color-sidebar-surface)] rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-[var(--color-blue-400)] rounded-full" />
                </div>
            </div>

            {/* Dynamic Navigation Sections */}
            <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
                {sections.map(section => {
                    const sectionThreads = allThreads.filter(t => t.category === section.key);
                    const isExpanded = expandedSections[section.key];
                    const SectionIcon = section.icon;

                    return (
                        <div key={section.key} className="mb-1">
                            <button
                                onClick={() => toggleSection(section.key)}
                                className="w-full flex items-center gap-2 px-2 py-2 text-[11px] font-bold text-[var(--color-sidebar-text-muted)] uppercase tracking-wider hover:text-[var(--color-sidebar-text)] transition-colors"
                            >
                                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                <span>{section.label}</span>
                                <div className="flex-1" />
                            </button>

                            {isExpanded && (
                                <div className="pl-1 space-y-0.5 mt-1 relative">
                                    {/* Subtle vertical guide line */}
                                    <div className="absolute left-[11px] top-0 bottom-0 w-[1px] bg-[var(--color-sidebar-border)] opacity-50" />

                                    {sectionThreads.map(thread => {
                                        const isActive = activeThreadId === thread.id;
                                        return (
                                            <div
                                                key={thread.id}
                                                onClick={() => onThreadSelect?.(thread.id)}
                                                className={`
                                                    group relative flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-all ml-2
                                                    ${isActive
                                                        ? 'bg-[var(--color-sidebar-surface)] text-[var(--color-sidebar-text)]'
                                                        : 'text-[var(--color-sidebar-text-secondary)] hover:text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)]'
                                                    }
                                                `}
                                            >
                                                {/* Active Indicator Dot */}
                                                {isActive && (
                                                    <div className="absolute left-0 w-0.5 h-3 bg-[var(--color-accent-400)] rounded-r-full" />
                                                )}

                                                <span className={`text-[13px] truncate ${isActive ? 'font-medium' : 'font-normal'}`}>
                                                    {thread.title}
                                                </span>

                                                {thread.badge && (
                                                    <div className="ml-auto" title={thread.badge}>
                                                        {getBadgeIcon(thread.badge)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-[var(--color-sidebar-border)]">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded text-[12px] font-medium text-[var(--color-sidebar-text-muted)] hover:text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-surface)] transition-all">
                    <Plus size={14} />
                    New Matter...
                </button>
                <div className="flex items-center justify-between px-3 mt-2 text-[10px] text-[var(--color-sidebar-text-muted)]">
                    <span className="opacity-70">v1.2.4</span>
                    <span className="opacity-70">Auto-saved</span>
                </div>
            </div>
        </aside>
    );
}
