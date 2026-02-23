// Script de inicialización de MongoDB
// Este script se ejecuta automáticamente cuando se crea el contenedor

db = db.getSiblingDB('restaurant');

// Crear colecciones con validación de esquema
db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['username', 'password', 'role', 'name', 'active'],
            properties: {
                username: {
                    bsonType: 'string',
                    description: 'Username must be a string and is required'
                },
                password: {
                    bsonType: 'string',
                    description: 'Password must be a string and is required'
                },
                role: {
                    enum: ['cashier', 'waiter', 'kitchen', 'admin'],
                    description: 'Role must be one of the enum values'
                },
                name: {
                    bsonType: 'string',
                    description: 'Name must be a string and is required'
                },
                active: {
                    bsonType: 'bool',
                    description: 'Active must be a boolean and is required'
                }
            }
        }
    }
});

db.createCollection('tables');
db.createCollection('categories');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('payments');

// Crear índices
print('Creating indexes...');

// Users indexes
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ role: 1, active: 1 });

// Tables indexes
db.tables.createIndex({ number: 1 }, { unique: true });
db.tables.createIndex({ status: 1 });

// Categories indexes
db.categories.createIndex({ name: 1 });
db.categories.createIndex({ active: 1 });

// Products indexes
db.products.createIndex({ name: "text" });
db.products.createIndex({ categoryId: 1, available: 1 });
db.products.createIndex({ available: 1 });

// Orders indexes
db.orders.createIndex({ orderNumber: 1, createdAt: -1 });
db.orders.createIndex({ status: 1, createdAt: -1 });
db.orders.createIndex({ waiterId: 1, createdAt: -1 });
db.orders.createIndex({ tableId: 1, status: 1 });
db.orders.createIndex({ "items.status": 1 });

// Payments indexes
db.payments.createIndex({ orderId: 1 });
db.payments.createIndex({ createdAt: -1 });
db.payments.createIndex({ cashierId: 1, createdAt: -1 });

print('Indexes created successfully');

// Insertar datos de prueba (opcional)
print('Inserting sample data...');

// Usuario administrador por defecto
db.users.insertOne({
    username: 'admin',
    password: '$2a$10$rZ5YhkKvJZKvKvJZKvJZKe.YhkKvJZKvKvJZKvJZKvJZKvJZKvJZK', // password: admin123
    role: 'admin',
    name: 'Administrador',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
});

// Categorías de ejemplo
const categories = [
    { name: 'Entradas', description: 'Platillos de entrada', order: 1, active: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Platos Fuertes', description: 'Platillos principales', order: 2, active: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Bebidas', description: 'Bebidas frías y calientes', order: 3, active: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Postres', description: 'Postres y dulces', order: 4, active: true, createdAt: new Date(), updatedAt: new Date() }
];

db.categories.insertMany(categories);

// Mesas de ejemplo
const tables = [];
for (let i = 1; i <= 10; i++) {
    tables.push({
        number: i,
        capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
    });
}

db.tables.insertMany(tables);

print('Sample data inserted successfully');
print('Database initialization completed!');
