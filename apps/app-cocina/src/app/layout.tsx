import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Cocina - Sistema de Restaurante',
    description: 'Aplicación de cocina para gestión de pedidos',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    )
}
