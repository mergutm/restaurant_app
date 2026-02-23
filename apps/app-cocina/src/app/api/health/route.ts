export async function GET() {
    return Response.json({
        status: 'healthy',
        service: 'restaurant-app-cocina',
        timestamp: new Date().toISOString()
    })
}
