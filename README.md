# 🍽️ Sistema de Gestión de Restaurante

Sistema completo de gestión de restaurante con arquitectura de microservicios usando Docker, MongoDB, Next.js y React Native.

## 📋 Descripción

Sistema compuesto por tres aplicaciones principales:
- **App de Caja** (Next.js) - Gestión de pedidos y pagos
- **App de Cocina** (Next.js) - Visualización y gestión de órdenes en cocina
- **App de Meseros** (React Native) - Captura de órdenes en dispositivos móviles

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  App Caja       │     │  App Meseros     │     │  App Cocina     │
│  (Next.js)      │     │  (React Native)  │     │  (Next.js)      │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┼─────────────────────────┘
                                 │
                        ┌────────▼────────┐
                        │  Nginx Proxy    │
                        └────────┬────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
         ┌───────▼────────┐            ┌────────▼────────┐
         │  API REST      │            │  WebSocket      │
         │  (Express)     │            │  (Socket.io)    │
         └───────┬────────┘            └────────┬────────┘
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
         ┌───────▼────────┐            ┌────────▼────────┐
         │  MongoDB       │            │  Redis          │
         └────────────────┘            └─────────────────┘
```

## 🚀 Stack Tecnológico

### Frontend
- **Next.js 14** (App Router) - Apps web de caja y cocina
- **React Native + Expo** - App móvil de meseros
- **TailwindCSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Socket.io-client** - WebSockets en tiempo real

### Backend
- **Node.js + Express** - API REST
- **Socket.io** - WebSockets
- **Mongoose** - ODM para MongoDB
- **Zod** - Validación de datos
- **JWT** - Autenticación

### Base de Datos
- **MongoDB 7** - Base de datos principal
- **Redis** - Caché y pub/sub

### DevOps
- **Docker + Docker Compose** - Contenedores
- **Nginx** - Reverse proxy

## 📦 Servicios Docker

1. **mongodb** - Base de datos MongoDB (puerto 27017)
2. **redis** - Caché y sesiones (puerto 6379)
3. **api** - API REST (puerto 3000)
4. **websocket** - Servidor WebSocket (puerto 3001)
5. **app-caja** - App Next.js de caja (puerto 3002)
6. **app-cocina** - App Next.js de cocina (puerto 3003)
7. **nginx** - Reverse proxy (puerto 80/443)
8. **mongo-express** - UI para MongoDB (puerto 8081, solo desarrollo)

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Docker 24.0+
- Docker Compose 2.20+
- Node.js 20+ (para desarrollo local)
- Git

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd restaurant
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=tu_password_seguro

# Redis
REDIS_PASSWORD=tu_redis_password

# JWT
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro_minimo_32_caracteres

# CORS (en producción, especifica tus dominios)
CORS_ORIGIN=*
```

### 3. Iniciar todos los servicios

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api
```

### 4. Verificar que los servicios estén corriendo

```bash
# Ver estado de los servicios
docker-compose ps

# Health check
curl http://localhost/health
```

## 🌐 Acceso a las Aplicaciones

### Producción (con Nginx)
- **App de Caja**: http://localhost:8100/caja
- **App de Cocina**: http://localhost:8100/cocina
- **API REST**: http://localhost:8100/api
- **WebSocket**: http://localhost:8100/ws
- **Mongo Express**: http://localhost:8081 (solo desarrollo)

### Desarrollo (acceso directo)
- **API REST**: http://localhost:3000
- **WebSocket**: http://localhost:3001
- **App de Caja**: http://localhost:3002
- **App de Cocina**: http://localhost:3003
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379

## �️ Gestión de Base de Datos

### Poblar la base de datos con datos iniciales

El proyecto incluye un script de seed que carga platillos mexicanos típicos:

```bash
# Ejecutar el script de seed
docker compose exec api node src/seed.js
```

Este script carga:
- **6 categorías**: Entradas, Platos Fuertes, Sopas y Caldos, Tacos y Antojitos, Bebidas, Postres
- **10 platillos mexicanos**: Tlayuda, Chiles en Nogada, Mole Negro, Pozole, Cochinita Pibil, Tacos al Pastor, Enchiladas, Aguachile, Barbacoa, Sopa de Lima

### Consultar la base de datos

Usa el script interactivo para consultar datos:

```bash
./query-db.sh
```

Opciones disponibles:
1. Ver todas las categorías
2. Ver todos los platillos
3. Ver platillos por categoría
4. Ver platillos disponibles
5. Ver platillos con precio menor a $150
6. Contar documentos y estadísticas

### Agregar platillos manualmente

```bash
./add-dish.sh
```

### Acceso directo a MongoDB

```bash
# Conectarse a MongoDB
docker compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin restaurant

# Ejemplos de consultas
db.products.find().pretty()
db.categories.find().pretty()
db.products.countDocuments()
```

---

## �📱 App de Meseros (React Native)

La app de meseros se desarrolla y distribuye por separado:

```bash
cd apps/app-meseros

# Instalar dependencias
npm install

# Iniciar en desarrollo
npx expo start

# Construir para Android
npx expo build:android

# Construir para iOS
npx expo build:ios
```

## 🔧 Comandos Útiles

### Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (¡cuidado! elimina datos)
docker-compose down -v

# Reconstruir servicios
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar un servicio específico
docker-compose restart api

# Ejecutar comando en un contenedor
docker-compose exec api npm run seed
```

### MongoDB

```bash
# Conectar a MongoDB
docker-compose exec mongodb mongosh -u admin -p admin123

# Backup de la base de datos
docker-compose exec mongodb mongodump -u admin -p admin123 --out /backup

# Restaurar base de datos
docker-compose exec mongodb mongorestore -u admin -p admin123 /backup
```

### Desarrollo

```bash
# Iniciar solo servicios de base de datos
docker-compose up -d mongodb redis

# Desarrollo local de API
cd backend/api
npm install
npm run dev

# Desarrollo local de WebSocket
cd backend/websocket
npm install
npm run dev

# Desarrollo local de App Caja
cd apps/app-caja
npm install
npm run dev

# Desarrollo local de App Cocina
cd apps/app-cocina
npm install
npm run dev
```

## 🧪 Testing

```bash
# Tests de API
cd backend/api
npm test

# Tests de WebSocket
cd backend/websocket
npm test

# Tests E2E
npm run test:e2e
```

## 📊 Monitoreo

### Health Checks

Todos los servicios tienen endpoints de health check:

```bash
# Nginx
curl http://localhost/health

# API
curl http://localhost:3000/health

# WebSocket
curl http://localhost:3001/health

# App Caja
curl http://localhost:3002/api/health

# App Cocina
curl http://localhost:3003/api/health
```

### Logs

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api

# Ver últimas 100 líneas
docker-compose logs --tail=100 api

# Logs de Nginx
docker-compose exec nginx tail -f /var/log/nginx/access.log
docker-compose exec nginx tail -f /var/log/nginx/error.log
```

## 🔒 Seguridad

### Producción

1. **Cambiar todas las contraseñas** en `.env`
2. **Configurar CORS** correctamente
3. **Habilitar HTTPS** en Nginx
4. **Configurar firewall** para exponer solo puerto 80/443
5. **Backups automáticos** de MongoDB
6. **Rate limiting** (ya configurado en Nginx)

### Variables de entorno sensibles

Nunca commitear el archivo `.env` al repositorio. Usar `.env.example` como plantilla.

## 🚀 Deployment en Producción

### 1. Configurar dominio y SSL

```bash
# Instalar certbot para Let's Encrypt
sudo apt-get install certbot

# Obtener certificado SSL
sudo certbot certonly --standalone -d tu-dominio.com

# Copiar certificados
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ./nginx/ssl/cert.pem
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ./nginx/ssl/key.pem
```

### 2. Actualizar nginx.conf

Descomentar la sección HTTPS en `nginx/nginx.conf` y actualizar el `server_name`.

### 3. Configurar variables de entorno de producción

```env
NODE_ENV=production
CORS_ORIGIN=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api
NEXT_PUBLIC_WS_URL=wss://tu-dominio.com/ws
```

### 4. Iniciar en producción

```bash
docker-compose -f docker-compose.yml up -d --build
```

## 📚 Documentación Adicional

- [API Documentation](./docs/api/README.md)
- [Architecture](./docs/architecture/README.md)
- [User Guides](./docs/user-guides/README.md)
- [Deployment Guide](./docs/deployment/README.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Autores

- Tu Nombre - [GitHub](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Next.js Team
- MongoDB Team
- Socket.io Team
- React Native Community


## Conexión a la base de datos

```bash
# Conectarse a MongoDB
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin restaurant


# Ejemplos de consultas
db.products.find().pretty()
db.categories.find().pretty()
db.products.countDocuments()
```

```bash
# Conectarse a MongoDB
docker exec -it restaurant-mongodb mongosh "mongodb://admin:admin123@localhost:27017/restaurant?authSource=admin"
```


# Cocina

http://localhost:3003/



# Mesero

http://localhost:3002/


# Caja

http://localhost:3001/
