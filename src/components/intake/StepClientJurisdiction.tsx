'use client';

import React, { useState, useMemo } from 'react';
import { Globe, Search, Building2, Check } from 'lucide-react';
import type { MatterFormData } from '@/app/matter/new/page';

interface StepProps {
    formData: MatterFormData;
    updateFormData: (updates: Partial<MatterFormData>) => void;
}

// Mock client data
const MOCK_CLIENTS = [
    { id: 'client-001', name: 'NovaDrive Technologies Inc.', contact: 'Dr. Sarah Chen' },
    { id: 'client-002', name: 'CipherLattice GmbH', contact: 'Prof. Marcus Weber' },
    { id: 'client-003', name: 'BioSync Medical Corp.', contact: 'Dr. Aisha Patel' },
    { id: 'client-004', name: 'ChainCore Labs', contact: 'James Liu' },
    { id: 'client-005', name: 'Meridian Aerospace Ltd.', contact: 'Dr. Takeshi Yamamoto' },
    { id: 'client-006', name: 'QuantumEdge Computing', contact: 'Elena Kowalski' },
];

const JURISDICTIONS = [
    { id: 'USPTO', name: 'United States', flag: '🇺🇸', org: 'USPTO' },
    { id: 'EPO', name: 'European Union', flag: '🇪🇺', org: 'EPO' },
    { id: 'WIPO', name: 'International', flag: '🌍', org: 'WIPO' },
    { id: 'JPO', name: 'Japan', flag: '🇯🇵', org: 'JPO' },
    { id: 'KIPO', name: 'South Korea', flag: '🇰🇷', org: 'KIPO' },
    { id: 'CNIPA', name: 'China', flag: '🇨🇳', org: 'CNIPA' },
];

export default function StepClientJurisdiction({ formData, updateFormData }: StepProps) {
    const [clientSearch, setClientSearch] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);

    const filteredClients = useMemo(() =>
        MOCK_CLIENTS.filter(c =>
            c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
            c.contact.toLowerCase().includes(clientSearch.toLowerCase())
        ),
        [clientSearch]
    );

    const selectedClient = MOCK_CLIENTS.find(c => c.id === formData.clientId);

    const toggleJurisdiction = (id: string) => {
        const current = formData.jurisdictions;
        if (current.includes(id)) {
            updateFormData({ jurisdictions: current.filter(j => j !== id) });
        } else {
            updateFormData({ jurisdictions: [...current, id] });
        }
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
                        <Globe size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-content-text)' }}>
                            Client & Jurisdiction
                        </h2>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-content-text-muted)' }}>
                            Select the client and applicable patent jurisdictions
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* Client Selector */}
                <div>
                    <label style={{
                        display: 'block', fontSize: 13, fontWeight: 600,
                        color: 'var(--color-content-text-secondary)', marginBottom: 6,
                    }}>
                        Client
                    </label>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${showClientDropdown ? 'var(--color-accent-400)' : 'var(--color-content-border-strong)'}`,
                            background: 'var(--color-content-surface)',
                            transition: 'border-color 0.15s ease',
                        }}>
                            <Search size={14} style={{ color: 'var(--color-content-text-muted)', flexShrink: 0 }} />
                            <input
                                type="text"
                                value={selectedClient && !showClientDropdown ? selectedClient.name : clientSearch}
                                onChange={(e) => {
                                    setClientSearch(e.target.value);
                                    setShowClientDropdown(true);
                                }}
                                onFocus={() => {
                                    setShowClientDropdown(true);
                                    if (selectedClient) setClientSearch('');
                                }}
                                onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                                placeholder="Search clients..."
                                style={{
                                    flex: 1, border: 'none', outline: 'none',
                                    background: 'none', fontSize: 14, fontFamily: 'var(--font-sans)',
                                    color: 'var(--color-content-text)',
                                }}
                            />
                            {selectedClient && (
                                <div style={{
                                    fontSize: 11, fontWeight: 500, color: 'var(--color-accent-600)',
                                    background: 'var(--color-accent-50)',
                                    padding: '2px 8px', borderRadius: 'var(--radius-full)',
                                    flexShrink: 0,
                                }}>
                                    Selected
                                </div>
                            )}
                        </div>

                        {/* Dropdown */}
                        {showClientDropdown && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                marginTop: 4, zIndex: 50,
                                background: 'var(--color-content-surface)',
                                border: '1px solid var(--color-content-border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-elevated)',
                                maxHeight: 220, overflowY: 'auto',
                            }}>
                                {filteredClients.map(client => (
                                    <div
                                        key={client.id}
                                        onMouseDown={() => {
                                            updateFormData({ clientId: client.id });
                                            setClientSearch('');
                                            setShowClientDropdown(false);
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 14px',
                                            cursor: 'pointer',
                                            transition: 'background 0.1s ease',
                                            background: formData.clientId === client.id ? 'var(--color-accent-50)' : 'transparent',
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-content-raised)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = formData.clientId === client.id ? 'var(--color-accent-50)' : 'transparent'}
                                    >
                                        <Building2 size={16} style={{ color: 'var(--color-content-text-muted)' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-content-text)' }}>
                                                {client.name}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--color-content-text-muted)' }}>
                                                {client.contact}
                                            </div>
                                        </div>
                                        {formData.clientId === client.id && (
                                            <Check size={16} style={{ color: 'var(--color-accent-500)' }} />
                                        )}
                                    </div>
                                ))}
                                {filteredClients.length === 0 && (
                                    <div style={{ padding: '16px', textAlign: 'center', fontSize: 13, color: 'var(--color-content-text-muted)' }}>
                                        No clients found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Jurisdictions */}
                <div>
                    <label style={{
                        display: 'block', fontSize: 13, fontWeight: 600,
                        color: 'var(--color-content-text-secondary)', marginBottom: 6,
                    }}>
                        Jurisdictions <span style={{ color: 'var(--color-danger)' }}>*</span>
                    </label>
                    <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--color-content-text-muted)' }}>
                        Select all jurisdictions where you plan to file
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 8,
                    }}>
                        {JURISDICTIONS.map(j => {
                            const selected = formData.jurisdictions.includes(j.id);
                            return (
                                <button
                                    key={j.id}
                                    onClick={() => toggleJurisdiction(j.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '12px 14px',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1.5px solid ${selected ? 'var(--color-accent-400)' : 'var(--color-content-border-strong)'}`,
                                        background: selected ? 'var(--color-accent-50)' : 'var(--color-content-surface)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        textAlign: 'left',
                                    }}
                                >
                                    <span style={{ fontSize: 20 }}>{j.flag}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: 13, fontWeight: 600,
                                            color: selected ? 'var(--color-accent-700)' : 'var(--color-content-text)',
                                        }}>
                                            {j.org}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--color-content-text-muted)' }}>
                                            {j.name}
                                        </div>
                                    </div>
                                    <div style={{
                                        width: 18, height: 18,
                                        borderRadius: 'var(--radius-xs)',
                                        border: `1.5px solid ${selected ? 'var(--color-accent-500)' : 'var(--color-content-border-strong)'}`,
                                        background: selected ? 'var(--color-accent-500)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s ease',
                                    }}>
                                        {selected && <Check size={12} color="white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
