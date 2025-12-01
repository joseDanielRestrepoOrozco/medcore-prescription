# MedCore - Prescription Service - Quick Start

## 🚀 Pasos para Iniciar

### 1. Instalar Dependencias

```bash
cd medcore-prescription
npm install
```

### 2. Configurar Base de Datos

```bash
# Generar Prisma Client
npx prisma generate

# Sincronizar con MongoDB
npx prisma db push
```

### 3. Iniciar Servicio

```bash
# Modo desarrollo (con hot reload)
npm run dev

# Modo producción
npm run build
npm start
```

El servicio estará disponible en: `http://localhost:3005`

## ✅ Verificar que Funciona

```bash
curl http://localhost:3005/
# Respuesta esperada: {"service":"medcore-prescription","status":"ok"}
```

## 🔗 Servicios Requeridos

Antes de usar el servicio de prescripciones, asegúrate que estén corriendo:

1. **medcore-auth** (Puerto 3001) - Autenticación
2. **medcore-users** (Puerto 3002) - Usuarios
3. **medcore-apigateway** (Puerto 3000) - Gateway

## 📝 Orden de Arranque

```bash
# Terminal 1: Auth Service
cd medcore-auth && npm run dev

# Terminal 2: Users Service
cd medcore-users && npm run dev

# Terminal 3: Prescription Service
cd medcore-prescription && npm run dev

# Terminal 4: API Gateway
cd medcore-apigateway && npm run dev
```

## 🧪 Probar con Postman

### 1. Login (obtener token)

```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "doctor@example.com",
  "current_password": "password123"
}
```

Guarda el `token` de la respuesta.

### 2. Crear Prescripción

```http
POST http://localhost:3000/api/v1/prescriptions
Authorization: Bearer <tu_token>
Content-Type: application/json

{
  "patientId": "<id_del_paciente>",
  "diagnosis": "Infección respiratoria aguda",
  "medications": [
    {
      "name": "Amoxicilina",
      "dosage": "500mg",
      "frequency": "cada 8 horas",
      "duration": 7,
      "durationType": "días",
      "administrationRoute": "oral"
    }
  ]
}
```

### 3. Descargar PDF

```http
GET http://localhost:3000/api/v1/prescriptions/<id_prescripcion>/pdf
Authorization: Bearer <tu_token>
```

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"

- Verifica tu `DATABASE_URL` en `.env`
- Asegúrate que tu IP esté en la whitelist de MongoDB Atlas

### Error: "Servicio no disponible"

- Verifica que `medcore-auth` esté corriendo en puerto 3001
- Verifica que `medcore-users` esté corriendo en puerto 3002

### Error: "Invalid patient ID"

- El `patientId` debe existir en la base de datos de `medcore-users`
- Verifica que el usuario tenga rol `PACIENTE`

## 📚 Documentación Completa

Ver `README.md` para documentación detallada de la API.
