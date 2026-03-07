'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Globe, Search, Building2, Check, Plus, X } from 'lucide-react';
import { clientsService, type ClientResponse } from '@/services/clients.service';
import type { MatterFormData } from '@/app/matter/new/page';

interface StepProps {
    formData: MatterFormData;
    updateFormData: (updates: Partial<MatterFormData>) => void;
}

const JURISDICTIONS = [
    { id: 'USPTO', name: 'United States', flag: '\u{1F1FA}\u{1F1F8}', org: 'USPTO' },
    { id: 'EPO', name: 'European Union', flag: '\u{1F1EA}\u{1F1FA}', org: 'EPO' },
    { id: 'WIPO', name: 'International', flag: '\u{1F30D}', org: 'WIPO' },
    { id: 'JPO', name: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', org: 'JPO' },
    { id: 'KIPO', name: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', org: 'KIPO' },
    { id: 'CNIPA', name: 'China', flag: '\u{1F1E8}\u{1F1F3}', org: 'CNIPA' },
];

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-content-border-strong)',
    background: 'var(--color-content-surface)',
    fontSize: 13,
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-content-text)',
    outline: 'none',
};

export default function StepClientJurisdiction({ formData, updateFormData }: StepProps) {
    const [clients, setClients] = useState<ClientResponse[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        clientsService.list().then(setClients).catch(() => {});
    }, []);

    const filteredClients = useMemo(() =>
        clients.filter(c =>
            c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
            (c.company || '').toLowerCase().includes(clientSearch.toLowerCase())
        ),
        [clientSearch, clients]
    );

    const selectedClient = clients.find(c => c.id === formData.clientId);

    const handleAddClient = async () => {
        if (!newClient.name.trim()) return;
        setSaving(true);
        try {
            const created = await clientsService.create({
                name: newClient.name.trim(),
                company: newClient.company.trim() || undefined,
                email: newClient.email.trim() || undefined,
                phone: newClient.phone.trim() || undefined,
            });
            setClients(prev => [...prev, created]);
            updateFormData({ clientId: created.id });
            setNewClient({ name: '', company: '', email: '', phone: '' });
            setShowAddForm(false);
        } catch {
            // Error creating client
        } finally {
            setSaving(false);
        }
    };

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

                    {showAddForm ? (
                        <div style={{
                            padding: 16,
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-accent-400)',
                            background: 'var(--color-content-surface)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-content-text)' }}>
                                    New Client
                                </span>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--color-content-text-muted)', padding: 2,
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-content-text-secondary)', marginBottom: 4 }}>
                                        Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newClient.name}
                                        onChange={e => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Client or company name"
                                        style={inputStyle}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-content-text-secondary)', marginBottom: 4 }}>
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        value={newClient.company}
                                        onChange={e => setNewClient(prev => ({ ...prev, company: e.target.value }))}
                                        placeholder="Legal entity name"
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-content-text-secondary)', marginBottom: 4 }}>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={newClient.email}
                                            onChange={e => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="contact@example.com"
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-content-text-secondary)', marginBottom: 4 }}>
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={newClient.phone}
                                            onChange={e => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="+1 (555) 000-0000"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddClient}
                                    disabled={!newClient.name.trim() || saving}
                                    style={{
                                        marginTop: 4,
                                        padding: '9px 20px',
                                        borderRadius: 'var(--radius-md)',
                                        border: 'none',
                                        background: newClient.name.trim() && !saving
                                            ? 'var(--color-accent-500)'
                                            : 'var(--color-content-raised)',
                                        color: newClient.name.trim() && !saving
                                            ? 'white'
                                            : 'var(--color-content-text-muted)',
                                        fontSize: 13, fontWeight: 600,
                                        cursor: newClient.name.trim() && !saving ? 'pointer' : 'default',
                                        transition: 'all 0.15s ease',
                                        alignSelf: 'flex-end',
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Add Client'}
                                </button>
                            </div>
                        </div>
                    ) : (
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
                                    maxHeight: 260, overflowY: 'auto',
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
                                                    {client.company || client.email}
                                                </div>
                                            </div>
                                            {formData.clientId === client.id && (
                                                <Check size={16} style={{ color: 'var(--color-accent-500)' }} />
                                            )}
                                        </div>
                                    ))}
                                    {/* Add New Client option */}
                                    <div
                                        onMouseDown={() => {
                                            setShowClientDropdown(false);
                                            setNewClient(prev => ({
                                                ...prev,
                                                name: clientSearch,
                                            }));
                                            setClientSearch('');
                                            setShowAddForm(true);
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 14px',
                                            cursor: 'pointer',
                                            borderTop: '1px solid var(--color-content-border)',
                                            transition: 'background 0.1s ease',
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-content-raised)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Plus size={16} style={{ color: 'var(--color-accent-500)' }} />
                                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-accent-600)' }}>
                                            Add new client{clientSearch ? ` "${clientSearch}"` : ''}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
