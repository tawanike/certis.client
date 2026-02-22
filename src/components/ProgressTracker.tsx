import React from 'react';
import {
    FileText,
    Shield,
    BookOpen,
    CheckCircle,
    PenTool,
    UploadCloud,
    Lock,
} from 'lucide-react';
import { MatterStatus } from '@/types';

export type Stage = 'brief' | 'claims' | 'risk' | 'spec' | 'qa' | 'export';

interface ProgressTrackerProps {
    currentStage: Stage;
    onStageSelect: (stage: Stage) => void;
    matterStatus?: MatterStatus;
}

const stages: { id: Stage; label: string; icon: React.ElementType }[] = [
    { id: 'brief', label: 'Brief', icon: UploadCloud },
    { id: 'claims', label: 'Claims', icon: PenTool },
    { id: 'risk', label: 'Risk', icon: Shield },
    { id: 'spec', label: 'Spec', icon: BookOpen },
    { id: 'qa', label: 'QA', icon: CheckCircle },
    { id: 'export', label: 'Export', icon: FileText },
];

// Map MatterStatus to the highest completed stage index
const STATUS_TO_STAGE_INDEX: Record<MatterStatus, number> = {
    CREATED: -1,
    BRIEF_ANALYZED: 0,
    CLAIMS_PROPOSED: 1,
    CLAIMS_APPROVED: 1,
    RISK_REVIEWED: 2,
    SPEC_GENERATED: 3,
    RISK_RE_REVIEWED: 3,
    QA_COMPLETE: 4,
    LOCKED_FOR_EXPORT: 5,
};

function getStageState(stageIndex: number, matterStatus?: MatterStatus): 'completed' | 'active' | 'locked' {
    if (!matterStatus) return 'locked';
    const completedUpTo = STATUS_TO_STAGE_INDEX[matterStatus];
    if (stageIndex < completedUpTo) return 'completed';
    if (stageIndex === completedUpTo) return 'active';
    // Allow navigating one stage ahead (the next actionable stage)
    if (stageIndex === completedUpTo + 1) return 'active';
    return 'locked';
}

export default function ProgressTracker({ currentStage, onStageSelect, matterStatus }: ProgressTrackerProps) {
    const currentIndex = stages.findIndex(s => s.id === currentStage);

    return (
        <div className="w-full bg-[var(--color-content-surface)] border-b border-[var(--color-content-border)] px-6 py-3">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
                {stages.map((stage, index) => {
                    const Icon = stage.icon;
                    const isActive = stage.id === currentStage;

                    // Use matterStatus if available, otherwise fall back to currentStage-based logic
                    const stageState = matterStatus
                        ? getStageState(index, matterStatus)
                        : (index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'locked');

                    const isCompleted = stageState === 'completed';
                    const isLocked = stageState === 'locked';

                    return (
                        <div key={stage.id} className="flex items-center flex-1 last:flex-none">
                            <button
                                onClick={() => !isLocked && onStageSelect(stage.id)}
                                disabled={isLocked}
                                className={`
                                    group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all
                                    ${isLocked
                                        ? 'text-[var(--color-content-text-muted)] opacity-40 cursor-not-allowed'
                                        : isActive
                                            ? 'bg-[var(--color-accent-400)] text-white shadow-sm ring-2 ring-[var(--color-accent-400)] ring-offset-2 ring-offset-[var(--color-content-surface)]'
                                            : isCompleted
                                                ? 'text-[var(--color-accent-500)] hover:bg-[var(--color-accent-100)]'
                                                : 'text-[var(--color-content-text-muted)] hover:text-[var(--color-content-text)] hover:bg-[var(--color-content-bg-hover)]'
                                    }
                                `}
                            >
                                <div className={`
                                    w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border
                                    ${isLocked
                                        ? 'border-[var(--color-content-border)] bg-[var(--color-content-raised)]'
                                        : isActive
                                            ? 'border-transparent bg-white/20'
                                            : isCompleted
                                                ? 'border-[var(--color-accent-500)] bg-[var(--color-accent-500)] text-white'
                                                : 'border-[var(--color-content-border)] bg-[var(--color-content-raised)]'
                                    }
                                `}>
                                    {isLocked ? <Lock size={10} /> : isCompleted ? <CheckCircle size={12} /> : <Icon size={12} />}
                                </div>
                                <span className={`text-[12px] font-medium ${isActive ? 'text-white' : ''}`}>
                                    {stage.label}
                                </span>
                            </button>

                            {index < stages.length - 1 && (
                                <div className={`flex-1 h-[1px] mx-2 ${isCompleted ? 'bg-[var(--color-accent-300)]' : 'bg-[var(--color-content-border)]'}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
