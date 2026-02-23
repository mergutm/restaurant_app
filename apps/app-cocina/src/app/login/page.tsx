'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { ChefHat, Lock, User as UserIcon } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, {
                username,
                password
            })

            const { token, user } = res.data.data

            if (user.role !== 'kitchen' && user.role !== 'admin') {
                setError('Usuario no tiene permisos de cocina.')
                setIsLoading(false)
                return
            }

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            router.push('/')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error de conexión / Credenciales inválidas')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <ChefHat className="h-8 w-8 text-orange-500" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Cocina
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Inicia sesión para gestionar los pedidos
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                placeholder="Usuario"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                placeholder="Contraseña"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 transition-colors"
                        >
                            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
