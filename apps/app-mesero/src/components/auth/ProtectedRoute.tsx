'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login')
            } else if (user && !['waiter', 'admin'].includes(user.role)) {
                // Only waiters and admins allowed
                router.push('/login')
            }
        }
    }, [isAuthenticated, isLoading, user, router])

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Cargando...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
