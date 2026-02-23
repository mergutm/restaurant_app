const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27117/restaurant?authSource=admin';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => {
        console.error('❌ Error conectando a MongoDB:', err);
        process.exit(1);
    });

// Definir esquemas
const categorySchema = new mongoose.Schema({
    name: String,
    description: String,
    order: Number,
    active: Boolean,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    categoryId: mongoose.Schema.Types.ObjectId,
    category: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String
    },
    image: String,
    ingredients: [String],
    available: Boolean,
    preparationTime: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

// Datos de categorías
const categories = [
    { name: 'Entradas', description: 'Platillos de entrada', order: 1, active: true },
    { name: 'Platos Fuertes', description: 'Platillos principales', order: 2, active: true },
    { name: 'Sopas y Caldos', description: 'Sopas y caldos tradicionales', order: 3, active: true },
    { name: 'Tacos y Antojitos', description: 'Tacos y antojitos mexicanos', order: 4, active: true },
    { name: 'Bebidas', description: 'Bebidas frías y calientes', order: 5, active: true },
    { name: 'Postres', description: 'Postres tradicionales', order: 6, active: true }
];

// Datos de platillos mexicanos
const platillosData = [
    {
        platillo: "Tlayuda con Tasajo",
        precio: 150,
        descripcion: "Tortilla de maíz gigante y crujiente, untada con asiento, frijoles negros, quesillo y una pieza de tasajo asado.",
        imageurl: "https://example.com/images/tlayuda.jpg",
        ingredientes: ["Maíz", "Asiento de cerdo", "Frijol", "Quesillo", "Tasajo", "Aguacate", "Col"],
        categoria: "Platos Fuertes",
        tiempoPreparacion: 15
    },
    {
        platillo: "Chiles en Nogada",
        precio: 280,
        descripcion: "Chile poblano relleno de picadillo de fruta y carne, bañado en salsa de nuez de Castilla y granada. Platillo de temporada.",
        imageurl: "https://example.com/images/chiles-en-nogada.jpg",
        ingredientes: ["Chile poblano", "Carne molida", "Nuez de Castilla", "Granada", "Perejil", "Fruta cristalizada"],
        categoria: "Platos Fuertes",
        tiempoPreparacion: 30
    },
    {
        platillo: "Mole Negro",
        precio: 190,
        descripcion: "Salsa compleja hecha a base de chiles secos y especias, servida tradicionalmente con pollo y arroz rojo.",
        imageurl: "https://example.com/images/mole-negro.jpg",
        ingredientes: ["Chile chilhuacle", "Chocolate", "Canela", "Ajonjolí", "Pollo", "Especias"],
        categoria: "Platos Fuertes",
        tiempoPreparacion: 25
    },
    {
        platillo: "Pozole Rojo",
        precio: 120,
        descripcion: "Caldo de maíz cacahuazintle con carne de cerdo, acompañado de rábano, lechuga, orégano y tostadas.",
        imageurl: "https://example.com/images/pozole.jpg",
        ingredientes: ["Maíz cacahuazintle", "Carne de cerdo", "Chile ancho", "Chile guajillo", "Rábanos", "Lechuga"],
        categoria: "Sopas y Caldos",
        tiempoPreparacion: 20
    },
    {
        platillo: "Cochinita Pibil",
        precio: 140,
        descripcion: "Carne de cerdo marinada en achiote y jugo de naranja agria, cocida lentamente en hojas de plátano.",
        imageurl: "https://example.com/images/cochinita-pibil.jpg",
        ingredientes: ["Cerdo", "Achiote", "Naranja agria", "Cebolla morada", "Chile habanero", "Hoja de plátano"],
        categoria: "Platos Fuertes",
        tiempoPreparacion: 20
    },
    {
        platillo: "Tacos al Pastor",
        precio: 90,
        descripcion: "Orden de 5 tacos de carne de cerdo marinada, servidos con piña, cebolla y cilantro.",
        imageurl: "https://example.com/images/tacos-pastor.jpg",
        ingredientes: ["Lomo de cerdo", "Achiote", "Piña", "Cebolla", "Cilantro", "Tortilla de maíz"],
        categoria: "Tacos y Antojitos",
        tiempoPreparacion: 10
    },
    {
        platillo: "Enchiladas Verdes",
        precio: 110,
        descripcion: "Tortillas rellenas de pollo bañadas en salsa de tomatillo verde y chile, con crema y queso fresco.",
        imageurl: "https://example.com/images/enchiladas.jpg",
        ingredientes: ["Tortilla", "Pollo", "Tomatillo", "Chile serrano", "Crema", "Queso fresco"],
        categoria: "Platos Fuertes",
        tiempoPreparacion: 15
    },
    {
        platillo: "Aguachile Verde",
        precio: 220,
        descripcion: "Camarones frescos curtidos en jugo de limón con una mezcla de chile serrano y cilantro.",
        imageurl: "https://example.com/images/aguachile.jpg",
        ingredientes: ["Camarón", "Limón", "Chile serrano", "Cilantro", "Pepino", "Cebolla morada"],
        categoria: "Entradas",
        tiempoPreparacion: 10
    },
    {
        platillo: "Barbacoa de Borrego",
        precio: 250,
        descripcion: "Carne de borrego cocida en horno de tierra, servida por kilo o en tacos con su respectivo consomé.",
        imageurl: "https://example.com/images/barbacoa.jpg",
        ingredientes: ["Carne de borrego", "Penca de maguey", "Garbanzos", "Chile", "Especias"],
        categoria: "Platos Fuertes",
        tiempoPreparacion: 25
    },
    {
        platillo: "Sopa de Lima",
        precio: 100,
        descripcion: "Caldo ligero de pollo con un toque cítrico de lima yucateca, servido con tiras de tortilla frita.",
        imageurl: "https://example.com/images/sopa-de-lima.jpg",
        ingredientes: ["Pollo", "Lima yucateca", "Tortilla", "Pimiento morrón", "Cebolla"],
        categoria: "Sopas y Caldos",
        tiempoPreparacion: 15
    }
];

async function seed() {
    try {
        console.log('🗑️  Limpiando colecciones existentes...');
        await Category.deleteMany({});
        await Product.deleteMany({});

        console.log('📦 Insertando categorías...');
        const insertedCategories = await Category.insertMany(categories);
        console.log(`✅ ${insertedCategories.length} categorías insertadas`);

        // Crear un mapa de categorías por nombre
        const categoryMap = {};
        insertedCategories.forEach(cat => {
            categoryMap[cat.name] = cat;
        });

        console.log('🍽️  Insertando platillos...');
        const products = platillosData.map(platillo => {
            const category = categoryMap[platillo.categoria];
            return {
                name: platillo.platillo,
                description: platillo.descripcion,
                price: platillo.precio,
                categoryId: category._id,
                category: {
                    _id: category._id,
                    name: category.name
                },
                image: platillo.imageurl,
                ingredients: platillo.ingredientes,
                available: true,
                preparationTime: platillo.tiempoPreparacion || 15
            };
        });

        const insertedProducts = await Product.insertMany(products);
        console.log(`✅ ${insertedProducts.length} platillos insertados`);

        console.log('\n📊 Resumen:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Categorías: ${insertedCategories.length}`);
        console.log(`Platillos: ${insertedProducts.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        console.log('\n🎉 ¡Base de datos poblada exitosamente!');

        // Mostrar algunos platillos
        console.log('\n📋 Platillos insertados:');
        insertedProducts.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name} - $${p.price} (${p.category.name})`);
        });

    } catch (error) {
        console.error('❌ Error al poblar la base de datos:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Conexión cerrada');
        process.exit(0);
    }
}

// Ejecutar seed
seed();
