'use client'

export const dynamic = 'force-dynamic'

export default function OfflinePage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-orange-50 text-center px-8">
            <div className="text-5xl">📡</div>
            <h1 className="text-xl font-bold text-gray-900">Sin conexión</h1>
            <p className="text-sm text-gray-500">
                Revisa tu conexión a la red e intenta de nuevo.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium"
            >
                Reintentar
            </button>
        </div>
    )
}
