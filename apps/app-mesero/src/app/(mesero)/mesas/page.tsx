'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { Table } from '@/types'
import { cn } from '@/lib/utils'
import { Users, MapPin } from 'lucide-react'

const statusConfig = {
    available: { label: 'Disponible', color: 'bg-green-50 border-green-300 text-green-700', dot: 'bg-green-500' },
    occupied: { label: 'Ocupada', color: 'bg-orange-50 border-orange-300 text-orange-700', dot: 'bg-orange-500' },
    reserved: { label: 'Reservada', color: 'bg-blue-50 border-blue-300 text-blue-700', dot: 'bg-blue-500' },
    cleaning: { label: 'Limpieza', color: 'bg-gray-50 border-gray-300 text-gray-500', dot: 'bg-gray-400' },
}

export default function MesasPage() {
    const [tables, setTables] = useState<Table[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        api.getTables()
            .then(res => setTables(res.data.data?.tables ?? res.data.data ?? []))
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">Seleccionar Mesa</h2>
                <p className="text-sm text-gray-500">Toca una mesa para iniciar un pedido</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables.filter(t => t.active).map(table => {
                    const cfg = statusConfig[table.status]
                    const canSelect = table.status === 'available' || table.status === 'occupied'
                    return (
                        <button
                            key={table._id}
                            onClick={() => canSelect && router.push(`/pedido/${table._id}`)}
                            disabled={!canSelect}
                            className={cn(
                                'relative rounded-2xl border-2 p-4 text-left transition-all active:scale-95',
                                cfg.color,
                                canSelect ? 'cursor-pointer shadow-sm hover:shadow-md' : 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-bold">#{table.number}</span>
                                <span className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                            </div>
                            <div className="flex items-center gap-1 text-xs mb-1">
                                <Users className="w-3 h-3" />
                                <span>{table.capacity} personas</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                                <MapPin className="w-3 h-3" />
                                <span className="capitalize">{table.location}</span>
                            </div>
                            <div className="mt-2">
                                <span className="text-xs font-medium">{cfg.label}</span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
