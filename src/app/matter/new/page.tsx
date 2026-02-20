'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import StepMatterDetails from '@/components/intake/StepMatterDetails';
import StepClientJurisdiction from '@/components/intake/StepClientJurisdiction';
import StepDocuments from '@/components/intake/StepDocuments';
import StepProcessing from '@/components/intake/StepProcessing';
import { mattersService } from '@/services/matters.service';

export interface MatterFormData {
    title: string;
    description: string;
    clientId: string;
    jurisdictions: string[];
    inventionDisclosure: File | null;
    supportingDocuments: File[];
}

const STEPS = [
    { id: 1, label: 'Matter Details' },
    { id: 2, label: 'Client & Jurisdiction' },
    { id: 3, label: 'Documents' },
    { id: 4, label: 'Processing' },
];

export default function NewMatterPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<MatterFormData>({
        title: '',
        description: '',
        clientId: '',
        jurisdictions: [],
        inventionDisclosure: null,
        supportingDocuments: [],
    });
    const [createdMatterId, setCreatedMatterId] = useState<string | null>(null);

    const updateFormData = (updates: Partial<MatterFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1: return formData.title.trim().length > 0;
            case 2: return formData.jurisdictions.length > 0;
            case 3: return true; // Documents are optional for now
            default: return false;
        }
    };

    const handleNext = async () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
        if (currentStep === 3) {
            // Move to processing step and start submission
            setCurrentStep(4);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (): Promise<string> => {
        // Create the matter
        const matter = await mattersService.create({
            title: formData.title,
            description: formData.description || undefined,
            jurisdictions: formData.jurisdictions,
        });

        // Upload invention disclosure if provided
        if (formData.inventionDisclosure) {
            // Upload as brief for existing analysis pipeline
            await mattersService.uploadBrief(matter.id, formData.inventionDisclosure);
            // Also upload via document API for RAG (chunking + embedding)
            await mattersService.uploadDocument(matter.id, formData.inventionDisclosure);
        }

        // Upload supporting documents
        for (const file of formData.supportingDocuments) {
            await mattersService.uploadBrief(matter.id, file);
            // Also upload via document API for RAG
            await mattersService.uploadDocument(matter.id, file);
        }

        setCreatedMatterId(matter.id);
        return matter.id;
    };

    const handleComplete = (matterId: string) => {
        router.push(`/matter/${matterId}`);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-content-bg)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Top Bar */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 32px',
                height: 64,
                borderBottom: '1px solid var(--color-content-border)',
                background: 'var(--color-content-surface)',
                flexShrink: 0,
            }}>
                <Link href="/" style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    color: 'var(--color-content-text-muted)',
                    textDecoration: 'none', fontSize: 14, fontWeight: 500,
                    transition: 'color 0.15s ease',
                }}>
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                <div style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-content-text)' }}>
                        New Matter
                    </span>
                </div>

                <div style={{ width: 140 }} /> {/* Spacer for centering */}
            </header>

            {/* Step Indicator */}
            {currentStep < 4 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '24px 32px 0',
                    gap: 8,
                }}>
                    {STEPS.slice(0, 3).map((step) => (
                        <div key={step.id} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <div style={{
                                width: 28, height: 28,
                                borderRadius: 'var(--radius-full)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 600,
                                background: currentStep >= step.id
                                    ? 'var(--color-accent-500)'
                                    : 'var(--color-content-raised)',
                                color: currentStep >= step.id
                                    ? 'white'
                                    : 'var(--color-content-text-muted)',
                                transition: 'all 0.2s ease',
                            }}>
                                {step.id}
                            </div>
                            <span style={{
                                fontSize: 13, fontWeight: 500,
                                color: currentStep >= step.id
                                    ? 'var(--color-content-text)'
                                    : 'var(--color-content-text-muted)',
                            }}>
                                {step.label}
                            </span>
                            {step.id < 3 && (
                                <div style={{
                                    width: 40, height: 1,
                                    background: currentStep > step.id
                                        ? 'var(--color-accent-400)'
                                        : 'var(--color-content-border)',
                                    margin: '0 4px',
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Step Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                padding: '32px',
            }}>
                <div style={{ width: '100%', maxWidth: 640 }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                            {currentStep === 1 && (
                                <StepMatterDetails
                                    formData={formData}
                                    updateFormData={updateFormData}
                                />
                            )}
                            {currentStep === 2 && (
                                <StepClientJurisdiction
                                    formData={formData}
                                    updateFormData={updateFormData}
                                />
                            )}
                            {currentStep === 3 && (
                                <StepDocuments
                                    formData={formData}
                                    updateFormData={updateFormData}
                                />
                            )}
                            {currentStep === 4 && (
                                <StepProcessing
                                    onSubmit={handleSubmit}
                                    onComplete={handleComplete}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Navigation */}
            {currentStep < 4 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '16px 32px',
                    borderTop: '1px solid var(--color-content-border)',
                    background: 'var(--color-content-surface)',
                }}>
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        style={{
                            padding: '10px 24px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-content-border)',
                            background: 'var(--color-content-surface)',
                            color: currentStep === 1 ? 'var(--color-content-text-muted)' : 'var(--color-content-text)',
                            fontSize: 14, fontWeight: 500, cursor: currentStep === 1 ? 'default' : 'pointer',
                            opacity: currentStep === 1 ? 0.5 : 1,
                            transition: 'all 0.15s ease',
                        }}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        style={{
                            padding: '10px 32px',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: canProceed()
                                ? 'var(--color-accent-500)'
                                : 'var(--color-content-raised)',
                            color: canProceed() ? 'white' : 'var(--color-content-text-muted)',
                            fontSize: 14, fontWeight: 600,
                            cursor: canProceed() ? 'pointer' : 'default',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {currentStep === 3 ? 'Create Matter' : 'Continue'}
                    </button>
                </div>
            )}
        </div>
    );
}
