'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { User, LoginCredentials } from '@/types'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setIsLoading(false)
                return
            }

            const response = await api.getMe()
            if (response.data?.user) {
                setUser(response.data.user)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            localStorage.removeItem('token')
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await api.login(credentials)
            if (response.data?.user) {
                setUser(response.data.user)
                router.push('/')
            }
        } catch (error) {
            throw error
        }
    }

    const logout = async () => {
        try {
            await api.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setUser(null)
            localStorage.removeItem('token')
            router.push('/login')
        }
    }

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
