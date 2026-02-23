'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Shield } from 'lucide-react'

export default function SettingsPage() {
    const { user } = useAuth()

    if (!user) return null

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Configuración</h1>
                <p className="text-muted-foreground mt-1">
                    Información de tu cuenta
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Información del Usuario</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary p-3">
                            <User className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Nombre</p>
                            <p className="text-lg font-semibold">{user.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-secondary p-3">
                            <Mail className="h-6 w-6 text-secondary-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Usuario</p>
                            <p className="text-lg font-semibold">{user.username}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-accent p-3">
                            <Shield className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Rol</p>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-semibold capitalize">{user.role}</p>
                                <Badge variant={user.active ? 'success' : 'destructive'}>
                                    {user.active ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Acerca del Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Versión:</strong> 1.0.0</p>
                    <p><strong>Sistema:</strong> Punto de Venta - Restaurante</p>
                    <p><strong>Desarrollado por:</strong> Tu Equipo</p>
                </CardContent>
            </Card>
        </div>
    )
}
