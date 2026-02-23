'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        if (!isLoading) {
            router.replace(isAuthenticated ? '/mesas' : '/login')
        }
    }, [isAuthenticated, isLoading, router])

    return (
        <div className="flex h-screen items-center justify-center bg-orange-50">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
    )
}
