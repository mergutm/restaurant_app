const mongoose = require('mongoose');
const { User, Table } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27117/restaurant?authSource=admin';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => {
        console.error('❌ Error conectando a MongoDB:', err);
        process.exit(1);
    });

// Usuarios de prueba
const users = [
    {
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin',
        active: true
    },
    {
        username: 'cajero1',
        password: 'cajero123',
        name: 'María González',
        role: 'cashier',
        active: true
    },
    {
        username: 'mesero1',
        password: 'mesero123',
        name: 'Juan Pérez',
        role: 'waiter',
        active: true
    },
    {
        username: 'mesero2',
        password: 'mesero123',
        name: 'Ana Martínez',
        role: 'waiter',
        active: true
    },
    {
        username: 'cocina1',
        password: 'cocina123',
        name: 'Carlos López',
        role: 'kitchen',
        active: true
    }
];

// Mesas de prueba
const tables = [
    { number: 1, capacity: 2, location: 'indoor', status: 'available' },
    { number: 2, capacity: 2, location: 'indoor', status: 'available' },
    { number: 3, capacity: 4, location: 'indoor', status: 'available' },
    { number: 4, capacity: 4, location: 'indoor', status: 'available' },
    { number: 5, capacity: 6, location: 'indoor', status: 'available' },
    { number: 6, capacity: 6, location: 'indoor', status: 'available' },
    { number: 7, capacity: 4, location: 'outdoor', status: 'available' },
    { number: 8, capacity: 4, location: 'outdoor', status: 'available' },
    { number: 9, capacity: 2, location: 'terrace', status: 'available' },
    { number: 10, capacity: 8, location: 'terrace', status: 'available' }
];

async function seedUsersAndTables() {
    try {
        console.log('🗑️  Limpiando usuarios y mesas existentes...');
        await User.deleteMany({});
        await Table.deleteMany({});

        console.log('👥 Creando usuarios (con hash de contraseñas)...');

        // Crear usuarios uno por uno para que el middleware pre-save funcione
        const createdUsers = [];
        for (const userData of users) {
            const user = await User.create(userData);
            createdUsers.push(user);
            console.log(`  ✓ ${user.name} (@${user.username})`);
        }

        console.log(`✅ ${createdUsers.length} usuarios creados`);

        console.log('🪑 Insertando mesas...');
        const insertedTables = await Table.insertMany(tables);
        console.log(`✅ ${insertedTables.length} mesas insertadas`);

        console.log('\n📊 Resumen:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Usuarios: ${createdUsers.length}`);
        console.log(`Mesas: ${insertedTables.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        console.log('\n🔑 Credenciales de acceso:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin:    admin / admin123');
        console.log('Cajero:   cajero1 / cajero123');
        console.log('Mesero 1: mesero1 / mesero123');
        console.log('Mesero 2: mesero2 / mesero123');
        console.log('Cocina:   cocina1 / cocina123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        console.log('\n🎉 ¡Usuarios y mesas creados exitosamente!');

    } catch (error) {
        console.error('❌ Error al crear usuarios y mesas:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Conexión cerrada');
        process.exit(0);
    }
}

seedUsersAndTables();
