'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, Home } from 'lucide-react';
import UserProfileDropdown from '@/components/UserProfileDropdown';

// Mock recent matters — in production, pull from API/store
const RECENT_MATTERS = [
    { id: 'matter-001', title: 'Autonomous Drone Navigation', initials: 'AD', color: '#5b8def' },
    { id: 'matter-002', title: 'Bio-Sensing Wearable Patch', initials: 'BW', color: '#e05252' },
    { id: 'matter-003', title: 'Distributed Ledger Auth', initials: 'DL', color: '#34c28a' },
];

export default function NavRail() {
    const router = useRouter();
    const pathname = usePathname();

    const isHome = pathname === '/';
    const activeMatterId = pathname.startsWith('/matter/')
        ? pathname.split('/')[2]
        : null;

    return (
        <div style={{
            width: 52,
            height: '100vh',
            background: 'var(--color-sidebar-bg)',
            borderRight: '1px solid var(--color-sidebar-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px 0',
            flexShrink: 0,
            zIndex: 50,
        }}>
            {/* Logo */}
            <button
                onClick={() => router.push('/')}
                title="Dashboard"
                style={{
                    width: 34, height: 34,
                    borderRadius: 'var(--radius-md)',
                    background: isHome
                        ? 'linear-gradient(135deg, var(--color-accent-500), var(--color-accent-400))'
                        : 'var(--color-sidebar-surface)',
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    color: isHome ? 'white' : 'var(--color-sidebar-text-muted)',
                    fontSize: 15, fontWeight: 800,
                }}
            >
                C
            </button>

            {/* Divider */}
            <div style={{
                width: 20, height: 1,
                background: 'var(--color-sidebar-border)',
                margin: '12px 0',
            }} />

            {/* Recent Matters */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                overflowY: 'auto',
            }}>
                {RECENT_MATTERS.map(matter => {
                    const isActive = activeMatterId === matter.id;
                    return (
                        <div key={matter.id} style={{ position: 'relative' }}>
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    left: -8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 3,
                                    height: 20,
                                    borderRadius: '0 2px 2px 0',
                                    background: 'var(--color-accent-400)',
                                }} />
                            )}
                            <button
                                onClick={() => router.push(`/matter/${matter.id}`)}
                                title={matter.title}
                                style={{
                                    width: 34, height: 34,
                                    borderRadius: 'var(--radius-md)',
                                    background: isActive
                                        ? matter.color + '25'
                                        : 'var(--color-sidebar-surface)',
                                    border: isActive
                                        ? `1.5px solid ${matter.color}60`
                                        : '1.5px solid transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    color: isActive ? matter.color : 'var(--color-sidebar-text-secondary)',
                                    fontSize: 11, fontWeight: 700,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {matter.initials}
                            </button>
                        </div>
                    );
                })}

                {/* New Matter */}
                <button
                    onClick={() => router.push('/matter/new')}
                    title="New Matter"
                    style={{
                        width: 34, height: 34,
                        borderRadius: 'var(--radius-md)',
                        background: 'none',
                        border: '1.5px dashed var(--color-sidebar-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        color: 'var(--color-sidebar-text-muted)',
                    }}
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* User Avatar */}
            <div style={{ marginTop: 8 }}>
                <UserProfileDropdown />
            </div>
        </div>
    );
}
