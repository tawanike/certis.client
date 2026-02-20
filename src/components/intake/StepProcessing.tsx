'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, FileSearch, Brain, Sparkles, CheckCircle2 } from 'lucide-react';

interface StepProcessingProps {
    onSubmit: () => Promise<string>;
    onComplete: (matterId: string) => void;
}

const STAGES = [
    { id: 'creating', label: 'Creating matter...', icon: FileSearch, duration: 1500 },
    { id: 'uploading', label: 'Uploading documents...', icon: Loader2, duration: 2000 },
    { id: 'extracting', label: 'Extracting pages \u0026 content...', icon: Brain, duration: 2500 },
    { id: 'embedding', label: 'Embedding documents for AI context...', icon: Sparkles, duration: 2000 },
    { id: 'analyzing', label: 'Preparing workspace...', icon: Sparkles, duration: 1500 },
    { id: 'done', label: 'Matter created successfully!', icon: CheckCircle2, duration: 0 },
];

export default function StepProcessing({ onSubmit, onComplete }: StepProcessingProps) {
    const [currentStage, setCurrentStage] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [matterId, setMatterId] = useState<string | null>(null);
    const hasStarted = useRef(false);

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        const runSubmission = async () => {
            try {
                // Start the actual submission
                const submitPromise = onSubmit();

                // Animate through stages
                for (let i = 0; i < STAGES.length - 1; i++) {
                    setCurrentStage(i);
                    await new Promise(r => setTimeout(r, STAGES[i].duration));
                }

                // Wait for the actual submission to complete
                const id = await submitPromise;
                setMatterId(id);
                setCurrentStage(STAGES.length - 1);

                // Redirect after a brief pause
                setTimeout(() => onComplete(id), 1500);
            } catch (err: any) {
                setError(err.message || 'Failed to create matter');
            }
        };

        runSubmission();
    }, [onSubmit, onComplete]);

    if (error) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '80px 32px', textAlign: 'center',
            }}>
                <div style={{
                    width: 64, height: 64, borderRadius: 'var(--radius-full)',
                    background: 'var(--color-danger-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20, color: 'var(--color-danger)',
                }}>
                    <span style={{ fontSize: 28 }}>✕</span>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: 'var(--color-content-text)' }}>
                    Something went wrong
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-content-text-muted)', maxWidth: 400 }}>
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '60px 32px',
        }}>
            {/* Animated Icon */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                    width: 80, height: 80,
                    borderRadius: 'var(--radius-full)',
                    background: currentStage === STAGES.length - 1
                        ? 'var(--color-success-light)'
                        : 'var(--color-accent-50)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 28,
                    transition: 'background 0.4s ease',
                }}
            >
                {currentStage < STAGES.length - 1 ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <Loader2 size={32} style={{ color: 'var(--color-accent-500)' }} />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                        <CheckCircle2 size={36} style={{ color: 'var(--color-success)' }} />
                    </motion.div>
                )}
            </motion.div>

            {/* Stage List */}
            <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {STAGES.map((stage, i) => {
                    const StageIcon = stage.icon;
                    const isActive = i === currentStage;
                    const isDone = i < currentStage;
                    const isPending = i > currentStage;

                    return (
                        <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-md)',
                                background: isActive ? 'var(--color-accent-50)' : 'transparent',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <div style={{
                                width: 28, height: 28,
                                borderRadius: 'var(--radius-full)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isDone ? 'var(--color-success-light)' : isActive ? 'var(--color-accent-100)' : 'var(--color-content-raised)',
                                color: isDone ? 'var(--color-success)' : isActive ? 'var(--color-accent-600)' : 'var(--color-content-text-muted)',
                                transition: 'all 0.3s ease',
                            }}>
                                {isDone ? <Check size={14} /> : <StageIcon size={14} />}
                            </div>
                            <span style={{
                                fontSize: 14,
                                fontWeight: isActive ? 600 : 400,
                                color: isPending
                                    ? 'var(--color-content-text-muted)'
                                    : isDone
                                        ? 'var(--color-success)'
                                        : 'var(--color-content-text)',
                                transition: 'all 0.3s ease',
                            }}>
                                {stage.label}
                            </span>
                            {isActive && i < STAGES.length - 1 && (
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{
                                        marginLeft: 'auto',
                                        width: 6, height: 6,
                                        borderRadius: 'var(--radius-full)',
                                        background: 'var(--color-accent-400)',
                                    }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
