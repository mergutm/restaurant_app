#!/bin/bash

# Script para consultar la base de datos MongoDB del restaurante

echo "🍽️  Consultando Base de Datos del Restaurante"
echo "=============================================="
echo ""

# Función para ejecutar consultas MongoDB
query_mongo() {
    docker compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin restaurant --quiet --eval "$1"
}

# Menú de opciones
echo "Selecciona una opción:"
echo "1. Ver todas las categorías"
echo "2. Ver todos los platillos"
echo "3. Ver platillos por categoría"
echo "4. Ver platillos disponibles"
echo "5. Ver platillos con precio menor a $150"
echo "6. Contar documentos"
echo ""
read -p "Opción: " option

case $option in
    1)
        echo ""
        echo "📋 Categorías:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        query_mongo "db.categories.find({}, {name: 1, description: 1, order: 1, _id: 0}).sort({order: 1}).forEach(c => print(c.order + '. ' + c.name + ' - ' + c.description))"
        ;;
    2)
        echo ""
        echo "🍽️  Todos los Platillos:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        query_mongo "db.products.find({}, {name: 1, price: 1, 'category.name': 1, _id: 0}).forEach(p => print(p.name + ' - $' + p.price + ' (' + p.category.name + ')'))"
        ;;
    3)
        echo ""
        echo "Categorías disponibles:"
        query_mongo "db.categories.find({}, {name: 1, _id: 0}).forEach(c => print('- ' + c.name))"
        echo ""
        read -p "Ingresa el nombre de la categoría: " categoria
        echo ""
        echo "🍽️  Platillos de '$categoria':"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        query_mongo "db.products.find({'category.name': '$categoria'}, {name: 1, price: 1, description: 1, _id: 0}).forEach(p => print(p.name + ' - $' + p.price + '\n  ' + p.description + '\n'))"
        ;;
    4)
        echo ""
        echo "✅ Platillos Disponibles:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        query_mongo "db.products.find({available: true}, {name: 1, price: 1, 'category.name': 1, _id: 0}).forEach(p => print(p.name + ' - $' + p.price + ' (' + p.category.name + ')'))"
        ;;
    5)
        echo ""
        echo "💰 Platillos con precio menor a $150:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        query_mongo "db.products.find({price: {\$lt: 150}}, {name: 1, price: 1, _id: 0}).sort({price: 1}).forEach(p => print(p.name + ' - $' + p.price))"
        ;;
    6)
        echo ""
        echo "📊 Estadísticas:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -n "Categorías: "
        query_mongo "print(db.categories.countDocuments())"
        echo -n "Platillos: "
        query_mongo "print(db.products.countDocuments())"
        echo -n "Platillos disponibles: "
        query_mongo "print(db.products.countDocuments({available: true}))"
        echo ""
        echo "Precio promedio: $"
        query_mongo "const result = db.products.aggregate([{\$group: {_id: null, avg: {\$avg: '\$price'}}}]).toArray(); print(Math.round(result[0].avg))"
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
