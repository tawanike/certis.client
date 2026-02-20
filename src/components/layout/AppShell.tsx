'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import NavRail from './NavRail';

const AUTH_ROUTES = ['/auth/login', '/auth/invite'];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Don't show nav rail on auth pages or new matter wizard
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
    const isNewMatter = pathname === '/matter/new';

    if (isAuthRoute || isNewMatter) {
        return <>{children}</>;
    }

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <NavRail />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </div>
    );
}
