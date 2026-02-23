#!/bin/bash

# Script para agregar más platillos a la base de datos

echo "🍽️  Agregar Platillos a la Base de Datos"
echo "=========================================="
echo ""

read -p "Nombre del platillo: " nombre
read -p "Descripción: " descripcion
read -p "Precio: " precio
read -p "Categoría (Entradas/Platos Fuertes/Sopas y Caldos/Tacos y Antojitos/Bebidas/Postres): " categoria
read -p "Ingredientes (separados por coma): " ingredientes_str
read -p "Tiempo de preparación (minutos): " tiempo

# Convertir ingredientes a array JSON
IFS=',' read -ra INGREDIENTES <<< "$ingredientes_str"
ingredientes_json="["
for i in "${!INGREDIENTES[@]}"; do
    ingredientes_json+="\"${INGREDIENTES[$i]}\""
    if [ $i -lt $((${#INGREDIENTES[@]} - 1)) ]; then
        ingredientes_json+=","
    fi
done
ingredientes_json+="]"

# Obtener el ID de la categoría
category_id=$(docker compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin restaurant --quiet --eval "const cat = db.categories.findOne({name: '$categoria'}); print(cat._id)")

if [ -z "$category_id" ]; then
    echo "❌ Categoría no encontrada"
    exit 1
fi

# Insertar el platillo
docker compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin restaurant --quiet --eval "
db.products.insertOne({
    name: '$nombre',
    description: '$descripcion',
    price: $precio,
    categoryId: ObjectId('$category_id'),
    category: {
        _id: ObjectId('$category_id'),
        name: '$categoria'
    },
    image: 'https://example.com/images/placeholder.jpg',
    ingredients: $ingredientes_json,
    available: true,
    preparationTime: $tiempo,
    createdAt: new Date(),
    updatedAt: new Date()
})
print('✅ Platillo agregado exitosamente')
"

echo ""
echo "🎉 ¡Platillo '$nombre' agregado a la categoría '$categoria'!"
