const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;

// Configure Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'restaurant-websocket',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        connections: io.engine.clientsCount
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Restaurant Management System - WebSocket Server',
        version: '1.0.0',
        connections: io.engine.clientsCount,
        transport: 'socket.io'
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Handle authentication
    socket.on('authenticate', (data) => {
        console.log(`🔐 Authentication attempt from ${socket.id}`);
        // TODO: Implement JWT verification
        socket.emit('authenticated', { success: true });
    });

    // Join room based on role
    socket.on('join:room', (data) => {
        const { role } = data;
        socket.join(role);
        console.log(`👤 Socket ${socket.id} joined room: ${role}`);
        socket.emit('room:joined', { room: role });
    });

    // Order events
    socket.on('order:create', (data) => {
        console.log('📝 New order created:', data);
        io.to('kitchen').emit('order:created', data);
        io.to('cashier').emit('order:created', data);
    });

    socket.on('order:update', (data) => {
        console.log('📝 Order updated:', data);
        io.emit('order:updated', data);
    });

    socket.on('order:status_changed', (data) => {
        console.log('🔄 Order status changed:', data);
        io.emit('order:status_changed', data);
    });

    // Order item events
    socket.on('orderItem:updateStatus', (data) => {
        console.log('🍽️ Order item status updated:', data);
        io.to('waiter').emit('orderItem:status_changed', data);
        io.to('kitchen').emit('orderItem:status_changed', data);
    });

    // Payment events
    socket.on('order:paid', (data) => {
        console.log('💰 Order paid:', data);
        io.emit('order:paid', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
        console.error(`❌ Socket error from ${socket.id}:`, error);
    });
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WebSocket Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing WebSocket server');
    io.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing WebSocket server');
    io.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
    });
});
