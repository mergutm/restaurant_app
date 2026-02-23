const { io } = require('socket.io-client');

// Conexión al servidor WebSocket interno
const WS_URL = process.env.WS_INTERNAL_URL || 'ws://websocket:3001';

const socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
    console.log('✅ API conectada al servidor WebSocket');
});

socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión WebSocket en API:', error.message);
});

module.exports = {
    emitEvent: (event, data) => {
        if (socket.connected) {
            socket.emit(event, data);
        } else {
            console.warn(`⚠️ No se pudo emitir ${event}, WebSocket desconectado`);
        }
    }
};
