export default function CocinaPage() {
    return (
        <main className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">
                    👨‍🍳 Sistema de Cocina
                </h1>
                <p className="text-gray-600 mb-8">
                    Aplicación de cocina para gestión de pedidos en tiempo real
                </p>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Estado del Sistema</h2>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span>Sistema operativo</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            API URL: {process.env.NEXT_PUBLIC_API_URL || 'No configurado'}
                        </div>
                        <div className="text-sm text-gray-500">
                            WebSocket URL: {process.env.NEXT_PUBLIC_WS_URL || 'No configurado'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4 text-yellow-600">
                            ⏳ Pendientes
                        </h3>
                        <p className="text-3xl font-bold">0</p>
                        <p className="text-sm text-gray-500 mt-2">Pedidos por preparar</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4 text-blue-600">
                            🔥 En Preparación
                        </h3>
                        <p className="text-3xl font-bold">0</p>
                        <p className="text-sm text-gray-500 mt-2">Pedidos en proceso</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4 text-green-600">
                            ✅ Listos
                        </h3>
                        <p className="text-3xl font-bold">0</p>
                        <p className="text-sm text-gray-500 mt-2">Pedidos completados</p>
                    </div>
                </div>
            </div>
        </main>
    )
}
