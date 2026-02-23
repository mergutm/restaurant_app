#!/bin/bash

# Script de inicio rápido para el sistema de gestión de restaurante
# Este script configura el entorno y levanta todos los servicios

set -e

echo "🍽️  Sistema de Gestión de Restaurante - Inicio Rápido"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker no está instalado${NC}"
    echo "Por favor instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar que Docker Compose está instalado
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Error: Docker Compose no está instalado${NC}"
    echo "Por favor instala Docker Compose desde: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker y Docker Compose están instalados${NC}"
echo ""

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    echo "Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
    echo -e "${YELLOW}⚠️  Por favor revisa y actualiza las variables en .env antes de continuar${NC}"
    echo ""
    read -p "¿Deseas continuar con los valores por defecto? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Por favor edita el archivo .env y ejecuta este script nuevamente"
        exit 0
    fi
fi

echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
echo ""

# Preguntar si desea limpiar volúmenes existentes
read -p "¿Deseas limpiar volúmenes existentes? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deteniendo y eliminando contenedores y volúmenes..."
    docker compose down -v
    echo -e "${GREEN}✅ Volúmenes eliminados${NC}"
fi

# Construir e iniciar servicios
echo ""
echo "🔨 Construyendo e iniciando servicios..."
echo ""

docker compose up -d --build

echo ""
echo "⏳ Esperando a que los servicios estén listos..."
echo ""

# Esperar a que los servicios estén saludables
sleep 10

# Verificar estado de los servicios
echo ""
echo "📊 Estado de los servicios:"
echo ""
docker compose ps

echo ""
echo -e "${GREEN}✅ ¡Sistema iniciado correctamente!${NC}"
echo ""
echo "=================================================="
echo "🌐 Acceso a las aplicaciones:"
echo "=================================================="
echo ""
echo "  📱 App de Caja:        http://localhost:8100/caja"
echo "  👨‍🍳 App de Cocina:      http://localhost:8100/cocina"
echo "  🔌 API REST:           http://localhost:8100/api"
echo "  🔄 WebSocket:          http://localhost:8100/ws"
echo "  🗄️  Mongo Express:      http://localhost:8081"
echo "     Usuario: admin"
echo "     Password: admin123"
echo ""
echo "=================================================="
echo "📝 Comandos útiles:"
echo "=================================================="
echo ""
echo "  Ver logs:              docker compose logs -f"
echo "  Detener servicios:     docker compose down"
echo "  Reiniciar servicios:   docker compose restart"
echo "  Ver estado:            docker compose ps"
echo ""
echo "=================================================="
echo ""
echo -e "${YELLOW}💡 Tip: Ejecuta 'docker compose logs -f' para ver los logs en tiempo real${NC}"
echo ""
