"use client";

import React from 'react';
import { AlertTriangle, CheckCircle, FileText, Layers, GitCommit, GitBranch, ShieldCheck, Loader2 } from 'lucide-react';

interface SystemComponent {
    component_id: string;
    name: string;
    description: string;
    optional: boolean;
}

interface MethodStep {
    step_id: string;
    description: string;
    order_required: boolean;
}

interface Variant {
    variant_id: string;
    description: string;
    affected_components: string[];
}

interface DataElement {
    name: string;
    description: string;
}

interface FigureDetected {
    figure_id: string;
    type: string;
    extracted_components: string[];
}

interface BriefData {
    core_invention_statement: string;
    technical_field: string;
    problem_statement: string;
    technical_solution_summary: string;
    technical_effects?: string[];
    system_components?: SystemComponent[];
    method_steps?: MethodStep[];
    variants?: Variant[];
    figures_detected?: FigureDetected[];
    data_elements?: DataElement[];
    ambiguities_or_missing_information?: string[];
}

interface BriefViewerProps {
    data: BriefData;
    isAuthoritative?: boolean;
    onApprove?: () => void;
    isApproving?: boolean;
}

function Section({ title, icon: Icon, children, className = "" }: { title: string; icon: any; children: React.ReactNode; className?: string }) {
    return (
        <div className={`mb-6 p-4 rounded-lg bg-[var(--color-content-surface)] border border-[var(--color-content-border)] ${className}`}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--color-content-border)]">
                <Icon size={18} className="text-[var(--color-accent-600)]" />
                <h4 className="text-[14px] font-bold text-[var(--color-content-text)] uppercase tracking-wide">{title}</h4>
            </div>
            <div className="text-[13px] text-[var(--color-content-text-secondary)] leading-relaxed">
                {children}
            </div>
        </div>
    );
}

function ListSection({ items, ...props }: { items?: string[] } & Omit<React.ComponentProps<typeof Section>, "children">) {
    if (!items || items.length === 0) return null;
    return (
        <Section {...props}>
            <ul className="list-disc pl-5 space-y-1">
                {items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </Section>
    );
}

export default function BriefViewer({ data, isAuthoritative, onApprove, isApproving }: BriefViewerProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-4">
            {/* Approval Banner */}
            {isAuthoritative === false && onApprove && (
                <div className="p-4 rounded-lg border-2 border-[var(--color-accent-300)] bg-[var(--color-accent-50)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-[14px] font-bold text-[var(--color-accent-700)]">Review Required</h4>
                            <p className="text-[12px] text-[var(--color-accent-600)] mt-0.5">
                                Review the structured breakdown below and approve to proceed to claims generation.
                            </p>
                        </div>
                        <button
                            onClick={onApprove}
                            disabled={isApproving}
                            className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--color-accent-500)] text-white text-[13px] font-semibold hover:bg-[var(--color-accent-600)] disabled:opacity-50 transition-colors"
                        >
                            {isApproving ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <ShieldCheck size={14} />
                            )}
                            {isApproving ? 'Approving...' : 'Approve Breakdown'}
                        </button>
                    </div>
                </div>
            )}

            {/* Approved Badge */}
            {isAuthoritative === true && (
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-emerald-50 border border-emerald-200">
                    <CheckCircle size={16} className="text-emerald-600" />
                    <span className="text-[13px] font-semibold text-emerald-700">Brief Approved</span>
                </div>
            )}

            {/* Ambiguities Alert */}
            {data.ambiguities_or_missing_information && data.ambiguities_or_missing_information.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-md">
                    <div className="flex items-start">
                        <AlertTriangle className="text-yellow-500 mt-0.5 mr-3" size={20} />
                        <div>
                            <h5 className="text-sm font-bold text-yellow-800 mb-1">Missing Information / Ambiguities</h5>
                            <ul className="list-disc pl-4 text-xs text-yellow-700 space-y-1">
                                {data.ambiguities_or_missing_information.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Core Invention */}
            <Section title="Core Invention" icon={CheckCircle} className="bg-blue-50/30 border-blue-100">
                <p className="font-medium text-[var(--color-content-text)]">{data.core_invention_statement}</p>
            </Section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Section title="Technical Field" icon={Layers}>
                    {data.technical_field}
                </Section>
                <Section title="Problem Statement" icon={AlertTriangle}>
                    {data.problem_statement}
                </Section>
            </div>

            <Section title="Solution Summary" icon={FileText}>
                {data.technical_solution_summary}
            </Section>

            <ListSection title="Technical Effects" icon={CheckCircle} items={data.technical_effects} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.system_components && data.system_components.length > 0 && (
                    <Section title="System Components" icon={Layers}>
                        <ul className="list-disc pl-5 space-y-2">
                            {data.system_components.map((c) => (
                                <li key={c.component_id}>
                                    <span className="font-semibold text-[var(--color-content-text)]">{c.name}</span>
                                    {c.optional && <span className="ml-1.5 text-[10px] font-bold text-amber-600 uppercase">(optional)</span>}
                                    <br /><span>{c.description}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}
                {data.method_steps && data.method_steps.length > 0 && (
                    <Section title="Method Steps" icon={GitCommit}>
                        <ol className="list-decimal pl-5 space-y-2">
                            {data.method_steps.map((s) => (
                                <li key={s.step_id}>{s.description}</li>
                            ))}
                        </ol>
                    </Section>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.variants && data.variants.length > 0 && (
                    <Section title="Variants" icon={GitBranch}>
                        <ul className="list-disc pl-5 space-y-2">
                            {data.variants.map((v) => (
                                <li key={v.variant_id}>{v.description}</li>
                            ))}
                        </ul>
                    </Section>
                )}
                {data.data_elements && data.data_elements.length > 0 && (
                    <Section title="Data Elements" icon={FileText}>
                        <ul className="list-disc pl-5 space-y-2">
                            {data.data_elements.map((d, i) => (
                                <li key={i}>
                                    <span className="font-semibold text-[var(--color-content-text)]">{d.name}</span>
                                    <br /><span>{d.description}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}
            </div>
        </div>
    );
}
