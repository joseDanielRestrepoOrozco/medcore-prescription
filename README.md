# MedCore - Prescription Service

Microservicio de gestión de prescripciones médicas con validación de alergias y generación de PDF.

## 🚀 Características

- ✅ Creación de prescripciones médicas con múltiples medicamentos
- ✅ Validación automática de alergias del paciente
- ✅ Control de acceso basado en roles (MEDICO, PACIENTE, ADMINISTRADOR)
- ✅ Generación de PDF profesional de prescripciones
- ✅ Registro y gestión de alergias de pacientes
- ✅ Integración con medcore-users para validaciones
- ✅ Numeración única de prescripciones (PRE-YYYYMMDD-XXXX)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Sincronizar base de datos
npx prisma db push

# Iniciar en desarrollo
npm run dev
```

## 🔧 Configuración

Copia `.env.example` a `.env` y configura:

```env
PORT=3005
DATABASE_URL="mongodb+srv://..."
AUTH_SERVICE_URL=http://localhost:3001
USERS_SERVICE_URL=http://localhost:3002/api/v1
INTERNAL_SERVICE_TOKEN=tu_token_interno
```

## 📚 API Endpoints

### Prescripciones

#### Crear Prescripción

```http
POST /api/v1/prescriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "string",
  "appointmentId": "string (opcional)",
  "diagnosticId": "string (opcional)",
  "diagnosis": "Infección respiratoria aguda",
  "observations": "Control en 7 días",
  "medications": [
    {
      "name": "Amoxicilina",
      "genericName": "Amoxicilina",
      "dosage": "500mg",
      "frequency": "cada 8 horas",
      "duration": 7,
      "durationType": "días",
      "administrationRoute": "oral",
      "instructions": "Tomar con alimentos"
    }
  ]
}
```

**Respuesta (201):**

```json
{
  "message": "Prescripción creada exitosamente",
  "prescription": { ... },
  "allergyWarnings": [
    "⚠️ ALERTA: Paciente alérgico a penicilina - Severidad: severa"
  ],
  "hasAllergies": true
}
```

#### Obtener Prescripciones del Paciente

```http
GET /api/v1/prescriptions/patient/:patientId?page=1&limit=10&status=ACTIVE
Authorization: Bearer <token>
```

**Permisos:**

- PACIENTE: solo sus propias prescripciones
- MEDICO, ADMINISTRADOR: todas

#### Obtener Prescripciones del Médico

```http
GET /api/v1/prescriptions/doctor/me?page=1&limit=10
Authorization: Bearer <token>
```

**Solo MEDICO:** Retorna las prescripciones que el médico autenticado ha creado.

#### Obtener Prescripción por ID

```http
GET /api/v1/prescriptions/:id
Authorization: Bearer <token>
```

**Permisos:**

- MEDICO: solo las prescripciones que él creó
- PACIENTE: solo sus prescripciones
- ADMINISTRADOR: todas

#### Actualizar Estado

```http
PATCH /api/v1/prescriptions/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED" | "CANCELLED"
}
```

**Solo MEDICO (propias) o ADMINISTRADOR**

#### Descargar PDF

```http
GET /api/v1/prescriptions/:id/pdf
Authorization: Bearer <token>
```

Descarga un PDF profesional con:

- Información del médico y paciente
- Diagnóstico
- Advertencias de alergias (si aplica)
- Lista de medicamentos con instrucciones
- Firma digital

### Alergias

#### Registrar Alergia

```http
POST /api/v1/allergies
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "string",
  "allergyType": "medicamento" | "alimento" | "ambiental",
  "allergen": "penicilina",
  "severity": "leve" | "moderada" | "severa",
  "reaction": "Erupción cutánea",
  "diagnosedDate": "2024-01-15"
}
```

**Solo MEDICO, ENFERMERA o ADMINISTRADOR**

#### Obtener Alergias del Paciente

```http
GET /api/v1/allergies/patient/:patientId
Authorization: Bearer <token>
```

#### Eliminar Alergia

```http
DELETE /api/v1/allergies/:id
Authorization: Bearer <token>
```

**Solo MEDICO o ADMINISTRADOR**

## 🔐 Autenticación

Todos los endpoints requieren token JWT en el header:

```
Authorization: Bearer <token>
```

El token se obtiene del servicio `medcore-auth` y se valida en cada request.

## ⚠️ Validación de Alergias

El sistema automáticamente:

1. Consulta las alergias registradas del paciente
2. Compara con los medicamentos prescritos
3. Genera advertencias si hay coincidencias
4. Incluye las advertencias en la prescripción y el PDF

**Ejemplo de advertencia:**

```
⚠️ ALERTA: Paciente alérgico a penicilina - Severidad: severa. Reacción: Shock anafiláctico
```

## 📄 Duración de Tratamiento

Los medicamentos se pueden prescribir en:

- **días**: `duration: 7, durationType: "días"`
- **semanas**: `duration: 2, durationType: "semanas"`
- **meses**: `duration: 3, durationType: "meses"`

El sistema valida que la duración sea un número positivo.

## 🏗️ Arquitectura

```
medcore-prescription/
├── prisma/
│   └── schema.prisma          # Modelos de BD
├── src/
│   ├── controllers/           # Lógica de endpoints
│   ├── services/              # Lógica de negocio
│   ├── middlewares/           # Autenticación y errores
│   ├── schemas/               # Validación con Zod
│   ├── routes/                # Definición de rutas
│   └── libs/                  # Utilidades
```

## 🔗 Integración con Otros Servicios

### medcore-users

- Valida existencia de pacientes
- Valida que el doctor sea MEDICO
- Obtiene datos completos para PDF

### medcore-auth

- Valida tokens JWT
- Verifica permisos por rol

### API Gateway

Las rutas están expuestas a través del gateway:

- `/api/v1/prescriptions/*`
- `/api/v1/allergies/*`

## 📊 Base de Datos

### Modelos Prisma

**Prescription:**

- prescriptionNumber (único)
- patientId, doctorId
- diagnosis, observations
- status (ACTIVE, COMPLETED, CANCELLED)
- allergyWarnings[]
- medications[] (relación)

**Medication:**

- name, genericName
- dosage, frequency
- duration, durationType
- administrationRoute
- instructions, warnings

**PatientAllergy:**

- patientId
- allergyType, allergen
- severity, reaction
- diagnosedDate

## 🧪 Testing

Próximamente: Colección de Postman con ejemplos de todas las peticiones.

## 📝 Notas Importantes

1. **Solo MEDICO puede crear prescripciones**
2. **Validación automática de alergias** en cada prescripción
3. **Control de acceso granular** por rol
4. **PDFs profesionales** listos para imprimir
5. **Numeración secuencial** por día

## 🚦 Estados de Prescripción

- `ACTIVE`: Prescripción activa y vigente
- `COMPLETED`: Tratamiento completado
- `CANCELLED`: Prescripción cancelada

## 🔄 Flujo de Trabajo

1. Doctor crea prescripción
2. Sistema valida alergias automáticamente
3. Genera advertencias si hay coincidencias
4. Crea prescripción con número único
5. Paciente puede ver y descargar PDF
6. Doctor puede actualizar estado
