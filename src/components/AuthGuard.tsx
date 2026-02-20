'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        // Wait for hydration/mount
        if (!isMounted) return

        // Allow public access to login and invite pages
        if (pathname === '/auth/login' || pathname?.startsWith('/auth/invite')) return

        if (!isAuthenticated) {
            router.push('/auth/login')
        }
    }, [isAuthenticated, isMounted, pathname, router])

    // show loading or nothing until mounted to prevent hydration mismatch
    if (!isMounted) return null

    // Allow access to public pages even if not authenticated
    if (pathname === '/auth/login' || pathname?.startsWith('/auth/invite')) {
        return <>{children}</>
    }

    return isAuthenticated ? <>{children}</> : null
}
