export async function GET() {
    return Response.json({
        status: 'healthy',
        service: 'restaurant-app-caja',
        timestamp: new Date().toISOString()
    })
}
