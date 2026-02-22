'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText,
    BookOpen,
    AlertTriangle,
    CheckCircle,
    GitBranch,
    Check,
    ExternalLink,
    LucideIcon,
} from 'lucide-react';
import ClaimTree from './ClaimTree';
import RiskDashboard from './RiskDashboard';
import HoverableText from './HoverableText';
import BriefUpload from './BriefUpload';
import { type Claim } from '@/types';



export interface ViewDef {
    key: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
}

interface ArtifactPanelProps {
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    onAddToChat?: (text: string) => void;
    claims?: Claim[];
    views?: ViewDef[];
    isSandbox?: boolean;
}

// ========= QA Viewer =========
function QAViewer() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-8 text-center h-full">
            <div className="w-14 h-14 rounded-full bg-[var(--color-success-light)] flex items-center justify-center mb-4">
                <Check size={28} className="text-[var(--color-success)]" />
            </div>
            <h3 className="text-[16px] font-bold text-[var(--color-content-text)] mb-2">
                QA Validation Passed
            </h3>
            <p className="text-[12px] text-[var(--color-content-text-muted)] leading-relaxed max-w-[260px] mb-6">
                All automated checks for antecedent basis, claim support, and terminology consistency have been verified.
            </p>
            <button className="flex items-center gap-2 px-5 py-2 rounded-[var(--radius-sm)] bg-[var(--color-content-raised)] border border-[var(--color-content-border)] text-[var(--color-content-text-secondary)] text-[12px] font-medium hover:bg-[var(--color-content-bg-hover)] transition-colors">
                <ExternalLink size={12} />
                View Detailed Report
            </button>
        </div>
    );
}

// ========= Versions Viewer =========
function VersionsViewer() {
    return (
        <div className="p-5">
            <div className="text-center mb-6">
                <GitBranch size={24} className="text-[var(--color-content-text-muted)] mb-2 mx-auto" />
                <h3 className="text-[14px] font-bold text-[var(--color-content-text)]">
                    Version History
                </h3>
            </div>
            <div className="p-4 bg-[var(--color-content-surface)] border border-[var(--color-content-border)] rounded-[var(--radius-md)] mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-semibold text-[var(--color-content-text)]">
                        Current Draft (v0.4)
                    </span>
                    <span className="badge badge-success">ACTIVE</span>
                </div>
                <p className="text-[11px] text-[var(--color-content-text-muted)]">
                    Last edited 2 mins ago by <strong>You</strong>
                </p>
            </div>
            <div className="flex flex-col">
                {[
                    { v: 'v0.3', date: 'Feb 13 · 14:22', author: 'You' },
                    { v: 'v0.2', date: 'Feb 13 · 11:05', author: 'You' },
                    { v: 'v0.1', date: 'Feb 12 · 09:30', author: 'System' },
                ].map((ver, idx) => (
                    <div
                        key={ver.v}
                        className={`py-3 px-4 flex items-center justify-between ${idx !== 2 ? 'border-b border-[var(--color-content-border)]' : ''}`}
                    >
                        <span className="text-[12px] font-medium text-[var(--color-content-text-secondary)]">
                            {ver.v}
                        </span>
                        <span className="text-[11px] text-[var(--color-content-text-muted)]">
                            {ver.date} · {ver.author}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ========= Spec Viewer =========
function SpecViewer({ onAddToChat }: { onAddToChat?: (text: string) => void }) {
    const [activeSection, setActiveSection] = useState('background');
    const sections = [
        { key: 'background', label: 'Background' },
        { key: 'summary', label: 'Summary' },
        { key: 'detailed', label: 'Detailed Description' },
    ];

    const specContent: Record<string, Array<{ title: string; text: string }>> = {
        background: [
            {
                title: 'Technical Field',
                text: 'The present invention relates generally to autonomous vehicle sensor systems, and more particularly to a method and system for dynamically adjusting sensor fusion weights in response to environmental degradation conditions affecting primary LiDAR sensors.',
            },
            {
                title: 'Background of the Invention',
                text: 'Modern autonomous vehicles typically employ a suite of sensors including LiDAR, cameras, radar, and ultrasonic transducers to perceive their environment. LiDAR-based systems, while providing highly accurate three-dimensional point cloud data, are susceptible to performance degradation under adverse environmental conditions such as heavy rain, fog, snow, and airborne particulates.',
            },
        ],
        summary: [
            {
                title: 'Summary of the Invention',
                text: 'The present invention provides a method and system for adaptive sensor fusion in autonomous vehicles. The system monitors environmental conditions using a plurality of onboard sensors and determines a degradation metric for a primary LiDAR sensor. Fusion weight parameters are dynamically adjusted in inverse proportion to the degradation metric, with camera image data contribution increasing when degradation exceeds a predetermined threshold.',
            },
        ],
        detailed: [
            {
                title: 'Detailed Description',
                text: 'Referring now to FIG. 1, the sensor fusion system 100 comprises a primary LiDAR sensor 110, a plurality of auxiliary cameras 120a-d, a radar module 130, and a central fusion processor 140. The fusion processor 140 receives point cloud data from the LiDAR sensor 110 at a rate of approximately 300,000 points per second...',
            },
            {
                title: 'Degradation Detection',
                text: 'The degradation detection module 150 continuously monitors the quality of LiDAR returns by analyzing point density, return intensity distributions, and signal-to-noise ratios within designated reference zones...',
            },
        ],
    };

    return (
        <div className="flex flex-col h-full">
            {/* Sub-nav */}
            <div className="flex items-center border-b border-[var(--color-content-border)] px-4 bg-[var(--color-content-surface)]">
                {sections.map(s => (
                    <button
                        key={s.key}
                        onClick={() => setActiveSection(s.key)}
                        className={`
                            px-4 py-3 text-[11px] font-medium transition-all bg-transparent border-0 cursor-pointer
                            ${activeSection === s.key
                                ? 'text-[var(--color-blue-500)] border-b-2 border-[var(--color-blue-500)]'
                                : 'text-[var(--color-content-text-muted)] border-b-2 border-transparent hover:text-[var(--color-content-text)]'}
                        `}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-content-raised)] border-b border-[var(--color-content-border)]">
                <span className="text-[10px] font-bold text-[var(--color-danger)] tracking-wider uppercase">
                    CONFIDENTIAL DRAFT
                </span>
                <span className="text-[10px] text-[var(--color-content-text-muted)]">
                    Page 1 / 12
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {(specContent[activeSection] || []).map((block, idx) => (
                    <div key={idx}>
                        <h4 className="text-[13px] font-bold mb-2 text-[var(--color-content-text)] flex items-center gap-1.5">
                            <span className="text-[var(--color-content-text-muted)]">§</span> {block.title}
                        </h4>
                        <HoverableText text={block.text} onAddToChat={onAddToChat}>
                            <p className="m-0 text-[12px] leading-relaxed text-[var(--color-content-text-secondary)]">
                                {block.text}
                            </p>
                        </HoverableText>
                    </div>
                ))}
            </div>
        </div>
    );
}

import BriefViewer from './BriefViewer';

// ... (previous imports)

// ========= Main ArtifactPanel =========
export default function ArtifactPanel({
    activeTab: controlledTab,
    onTabChange,
    onAddToChat,
    claims,
    views = [],
    isSandbox = false
}: ArtifactPanelProps) {
    const [internalTab, setInternalTab] = useState(views[0]?.key || 'claims');
    const [briefData, setBriefData] = useState<any>(null); // State to hold uploaded brief data

    // Sync internal tab with controlled prop
    useEffect(() => {
        if (controlledTab) setInternalTab(controlledTab);
    }, [controlledTab]);

    const handleTabClick = (key: string) => {
        setInternalTab(key);
        onTabChange?.(key);
    };

    // Mock Matter ID for now
    const MATTER_ID = "123e4567-e89b-12d3-a456-426614174000";

    return (
        <div className="main-content flex flex-col h-full min-w-0 bg-[var(--color-content-surface)] border-l border-[var(--color-content-border)]">
            {/* Contextual Switcher (formerly Icon Tabs) */}
            <div className="flex border-b border-[var(--color-content-border)] bg-[var(--color-content-surface)] shrink-0">
                {views.map(tab => {
                    const Icon = tab.icon;
                    const isActive = internalTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabClick(tab.key)}
                            className={`
                                flex-1 flex items-center justify-center gap-2 py-3 px-2
                                text-[12px] font-medium transition-all relative border-b-2
                                ${isActive
                                    ? 'text-[var(--color-content-text)] border-[var(--color-accent-400)] bg-[var(--color-content-raised)]'
                                    : 'text-[var(--color-content-text-muted)] border-transparent hover:bg-[var(--color-content-bg-hover)] hover:text-[var(--color-content-text)]'}
                            `}
                        >
                            <div className="relative flex items-center">
                                <Icon size={16} />
                                {tab.badge && (
                                    <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[var(--color-danger)] text-white text-[8px] font-bold flex items-center justify-center">
                                        {tab.badge}
                                    </span>
                                )}
                            </div>
                            <span className="hidden xl:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {internalTab === 'brief' && (
                    <div className="p-6">
                        {!briefData ? (
                            <BriefUpload
                                matterId={MATTER_ID}
                                onUploadSuccess={(data) => {
                                    console.log("Upload Success:", data);
                                    setBriefData(data.structure_data); // Store the structured data
                                    onAddToChat?.(`I uploaded a new brief! Version: ${data.version_number}`);
                                }}
                            />
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">Brief Analysis</h3>
                                    <button
                                        onClick={() => setBriefData(null)}
                                        className="text-xs text-blue-500 hover:underline"
                                    >
                                        Upload New
                                    </button>
                                </div>
                                <BriefViewer data={briefData} />
                            </div>
                        )}
                    </div>
                )}
                {internalTab === 'claims' && <ClaimTree claims={claims} onAddToChat={onAddToChat} isSandbox={isSandbox} />}
                {internalTab === 'spec' && <SpecViewer onAddToChat={onAddToChat} />}
                {internalTab === 'risk' && <RiskDashboard onAddToChat={onAddToChat} />}
                {internalTab === 'qa' && <QAViewer />}
                {internalTab === 'versions' && <VersionsViewer />}
            </div>
        </div>
    );
}
