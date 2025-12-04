# 💊 MedCore Prescription Service

Servicio de gestión de prescripciones médicas con validación automática de alergias y catálogo de medicamentos predefinidos.

## 🚀 Características

- ✅ Creación de prescripciones médicas con múltiples medicamentos
- ✅ Validación automática de alergias del paciente
- ✅ **Catálogo de 12 medicamentos predefinidos** con diagnósticos comunes
- ✅ Control de acceso basado en roles (MEDICO, ENFERMERA, ADMINISTRADOR)
- ✅ Generación de PDF profesional de prescripciones
- ✅ Registro y gestión de alergias de pacientes
- ✅ **Documentación Swagger/OpenAPI interactiva**
- ✅ Integración con medcore-users para validaciones
- ✅ Numeración única de prescripciones (RX-YYYY-XXXXXX)

## 📦 Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Servidor
PORT=3005
NODE_ENV=development

# Base de datos
DATABASE_URL="mongodb://localhost:27017/medcore-prescription"

# JWT (debe coincidir con medcore-auth)
JWT_SECRET=tu_clave_secreta_aqui

# Servicios externos
AUTH_SERVICE_URL=http://localhost:3001
USERS_SERVICE_URL=http://localhost:3002
```

### 3. Configurar base de datos

```bash
# Generar cliente Prisma
npx prisma generate

# Sincronizar schema con MongoDB
npx prisma db push

# Cargar datos iniciales (12 medicamentos predefinidos)
npm run seed
```

### 4. Iniciar el servicio

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm start
```

El servicio estará disponible en: **http://localhost:3005**  
Documentación Swagger: **http://localhost:3005/api/v1/docs**

## 📚 API Endpoints

### 🔐 Autenticación

**Todos los endpoints requieren autenticación JWT:**

```
Authorization: Bearer <token>
```

### Cómo Autenticarte en Swagger

1. **Obtén un token:** Ir a http://localhost:3001/api/v1/docs (servicio Auth)
2. **Login:** Usar endpoint `POST /auth/login` con email y password
3. **Copiar token** de la respuesta
4. **En Swagger de Prescription:** Clic en botón **"Authorize"** (🔓)
5. **Escribir:** `Bearer <tu_token_aquí>`
6. **Clic en "Authorize"** y luego "Close"
7. ✅ ¡Listo para probar endpoints!

---

### 💊 Templates de Medicamentos

#### `GET /api/v1/medication-templates`

Lista todos los templates de medicamentos predefinidos

**Query Parameters:**

- `category` (opcional): Filtrar por categoría
- `search` (opcional): Buscar por nombre o nombre genérico

**Ejemplos:**

```http
GET /api/v1/medication-templates
GET /api/v1/medication-templates?category=Antibiótico
GET /api/v1/medication-templates?search=ibuprofeno
```

**Respuesta 200:**

```json
{
  "templates": [
    {
      "code": "MED-003",
      "name": "Amoxicilina",
      "genericName": "Amoxicilina",
      "category": "Antibiótico",
      "commonDiagnosis": ["Faringitis", "Otitis", "Sinusitis"],
      "dosage": "500mg",
      "frequency": "cada 8 horas",
      "duration": 7,
      "durationType": "días",
      "administrationRoute": "oral",
      "instructions": "Tomar con alimentos para mejor absorción",
      "warnings": "No usar en alérgicos a penicilina"
    }
  ],
  "total": 12
}
```

#### `GET /api/v1/medication-templates/categories`

Obtiene lista de categorías disponibles

**Respuesta 200:**

```json
{
  "categories": [
    "Analgésico",
    "Antiinflamatorio",
    "Antibiótico",
    "Antihipertensivo",
    "Antidiabético",
    "Gastroprotector",
    "Antihistamínico",
    "Broncodilatador",
    "Antiemético",
    "Hipolipemiante"
  ]
}
```

#### `GET /api/v1/medication-templates/:code`

Obtiene un template específico por código

**Ejemplo:**

```http
GET /api/v1/medication-templates/MED-001
```

**Respuesta 200:**

```json
{
  "code": "MED-001",
  "name": "Acetaminofén",
  "genericName": "Paracetamol",
  "category": "Analgésico",
  "commonDiagnosis": ["Cefalea", "Fiebre", "Dolor leve a moderado"],
  "dosage": "500mg",
  "frequency": "cada 6-8 horas",
  "duration": 3,
  "durationType": "días",
  "administrationRoute": "oral",
  "instructions": "No exceder 4g diarios",
  "warnings": "Evitar en enfermedad hepática"
}
```

---

### 📝 Prescripciones

#### `POST /api/v1/prescriptions`

Crear nueva prescripción **(Solo MEDICO)**

**Request Body:**

```json
{
  "patientId": "675d1234567890abcdef1234",
  "diagnosticId": "675d1234567890abcdef5678",
  "diagnosis": "Faringitis aguda",
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
  ],
  "notes": "Control en 7 días"
}
```

**Respuesta 201 (Exitosa):**

```json
{
  "message": "Prescripción creada exitosamente",
  "prescription": {
    "id": "675d1234567890abcdef9999",
    "prescriptionNumber": "RX-2025-001234",
    "patientId": "675d1234567890abcdef1234",
    "doctorId": "675d1234567890abcdef4567",
    "diagnosis": "Faringitis aguda",
    "status": "ACTIVE",
    "allergiesChecked": true,
    "allergyWarnings": [],
    "medications": [...]
  }
}
```

**Respuesta 400 (Alergia detectada):**

```json
{
  "error": "Paciente alérgico a medicamentos",
  "allergies": [
    {
      "medication": "Amoxicilina",
      "allergen": "penicilina",
      "severity": "severa",
      "reaction": "Anafilaxia"
    }
  ]
}
```

#### `GET /api/v1/prescriptions/patient/:patientId`

Obtener prescripciones de un paciente

**Query Parameters:**

- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 10)
- `status` (opcional): Filtrar por estado (ACTIVE, COMPLETED, CANCELLED)

**Ejemplo:**

```http
GET /api/v1/prescriptions/patient/675d1234567890abcdef1234?page=1&limit=10&status=ACTIVE
```

**Permisos:**

- PACIENTE: solo sus propias prescripciones
- MEDICO, ADMINISTRADOR: todas las prescripciones del paciente

#### `GET /api/v1/prescriptions/doctor/me`

Obtener mis prescripciones como doctor **(Solo MEDICO)**

Retorna todas las prescripciones que el médico autenticado ha creado.

#### `GET /api/v1/prescriptions/:id`

Obtener prescripción por ID

**Permisos:**

- MEDICO: solo las prescripciones que él creó
- PACIENTE: solo sus prescripciones
- ADMINISTRADOR: todas

#### `PATCH /api/v1/prescriptions/:id/status`

Actualizar estado de prescripción **(MEDICO o ADMINISTRADOR)**

**Request Body:**

```json
{
  "status": "COMPLETED"
}
```

Estados válidos: `ACTIVE`, `COMPLETED`, `CANCELLED`

#### `GET /api/v1/prescriptions/:id/pdf`

Descargar prescripción en PDF

Genera y descarga un PDF profesional con:

- Información del médico y paciente
- Diagnóstico
- Advertencias de alergias (si aplica)
- Lista de medicamentos con instrucciones detalladas
- Firma digital

---

### 🛡️ Alergias

#### `POST /api/v1/allergies`

Registrar alergia de paciente **(MEDICO, ENFERMERA o ADMINISTRADOR)**

**Request Body:**

```json
{
  "patientId": "675d1234567890abcdef1234",
  "allergyType": "medicamento",
  "allergen": "penicilina",
  "severity": "severa",
  "reaction": "Anafilaxia",
  "diagnosedDate": "2025-01-15"
}
```

**Tipos de alergia:** `medicamento`, `alimento`, `ambiental`  
**Severidad:** `leve`, `moderada`, `severa`

#### `GET /api/v1/allergies/patient/:patientId`

Obtener alergias de un paciente

**Respuesta 200:**

```json
{
  "allergies": [
    {
      "id": "...",
      "allergyType": "medicamento",
      "allergen": "penicilina",
      "severity": "severa",
      "reaction": "Anafilaxia",
      "diagnosedDate": "2025-01-15T00:00:00Z"
    }
  ]
}
```

#### `DELETE /api/v1/allergies/:id`

Eliminar registro de alergia **(MEDICO o ADMINISTRADOR)**

## 💡 Casos de Uso

### Caso 1: Crear Prescripción Simple

```bash
POST http://localhost:3005/api/v1/prescriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "675d1234567890abcdef1234",
  "diagnosticId": "675d1234567890abcdef5678",
  "diagnosis": "Cefalea tensional",
  "medications": [
    {
      "name": "Acetaminofén",
      "genericName": "Paracetamol",
      "dosage": "500mg",
      "frequency": "cada 8 horas",
      "duration": 3,
      "durationType": "días",
      "administrationRoute": "oral",
      "instructions": "Tomar con alimentos"
    }
  ]
}
```

### Caso 2: Usar Template de Medicamento

**Paso 1:** Buscar template disponible

```bash
GET http://localhost:3005/api/v1/medication-templates?category=Analgésico
Authorization: Bearer <token>
```

**Paso 2:** Obtener datos del template

```bash
GET http://localhost:3005/api/v1/medication-templates/MED-001
Authorization: Bearer <token>
```

**Paso 3:** Usar los datos del template en la prescripción

```json
{
  "patientId": "675d1234567890abcdef1234",
  "diagnosis": "Cefalea",
  "medications": [
    {
      "name": "Acetaminofén",
      "genericName": "Paracetamol",
      "dosage": "500mg",
      "frequency": "cada 6-8 horas",
      "duration": 3,
      "durationType": "días",
      "administrationRoute": "oral",
      "instructions": "No exceder 4g diarios",
      "warnings": "Evitar en enfermedad hepática"
    }
  ]
}
```

### Caso 3: Registrar Alergia y Verificar Validación

**Paso 1:** Registrar alergia

```bash
POST http://localhost:3005/api/v1/allergies
Authorization: Bearer <token>

{
  "patientId": "675d1234567890abcdef1234",
  "allergyType": "medicamento",
  "allergen": "penicilina",
  "severity": "moderada",
  "reaction": "Urticaria"
}
```

**Paso 2:** Intentar crear prescripción con medicamento alérgico

```bash
POST http://localhost:3005/api/v1/prescriptions

{
  "patientId": "675d1234567890abcdef1234",
  "diagnosis": "Faringitis",
  "medications": [
    {
      "name": "Amoxicilina",
      "genericName": "Amoxicilina",
      "dosage": "500mg",
      "frequency": "cada 8 horas",
      "duration": 7,
      "durationType": "días",
      "administrationRoute": "oral"
    }
  ]
}
```

**Respuesta esperada (400):**

```json
{
  "error": "Paciente alérgico a medicamentos",
  "allergies": [
    {
      "medication": "Amoxicilina",
      "allergen": "penicilina",
      "severity": "moderada",
      "reaction": "Urticaria"
    }
  ]
}
```

---

## 💊 Catálogo de Medicamentos Predefinidos

El sistema incluye **12 medicamentos** en 10 categorías:

| Código  | Nombre         | Categoría        | Diagnósticos Comunes                 |
| ------- | -------------- | ---------------- | ------------------------------------ |
| MED-001 | Acetaminofén   | Analgésico       | Cefalea, Fiebre, Dolor               |
| MED-002 | Ibuprofeno     | Antiinflamatorio | Dolor muscular, Artritis             |
| MED-003 | Amoxicilina    | Antibiótico      | Faringitis, Otitis, Sinusitis        |
| MED-004 | Azitromicina   | Antibiótico      | Infección respiratoria               |
| MED-005 | Losartán       | Antihipertensivo | Hipertensión arterial                |
| MED-006 | Enalapril      | Antihipertensivo | Hipertensión, Insuficiencia cardíaca |
| MED-007 | Metformina     | Antidiabético    | Diabetes tipo 2                      |
| MED-008 | Omeprazol      | Gastroprotector  | Gastritis, Reflujo gastroesofágico   |
| MED-009 | Loratadina     | Antihistamínico  | Rinitis alérgica, Urticaria          |
| MED-010 | Salbutamol     | Broncodilatador  | Asma, EPOC                           |
| MED-011 | Metoclopramida | Antiemético      | Náuseas, Vómito                      |
| MED-012 | Atorvastatina  | Hipolipemiante   | Hipercolesterolemia                  |

### Ventajas de Usar Templates

✅ **Ahorro de tiempo:** No escribir la misma información repetidamente  
✅ **Estandarización:** Dosis y frecuencias consistentes  
✅ **Diagnósticos sugeridos:** Ver para qué sirve cada medicamento  
✅ **Información completa:** Instrucciones y advertencias incluidas  
✅ **Búsqueda rápida:** Filtrar por categoría o nombre

### Cargar Templates en la Base de Datos

```bash
npm run seed
```

Esto poblará la colección `medication_templates` con los 12 medicamentos predefinidos.

## 🛡️ Validación Automática de Alergias

El sistema automáticamente:

1. ✅ Consulta las alergias registradas del paciente
2. ✅ Compara con los medicamentos prescritos
3. ✅ Genera advertencias si hay coincidencias
4. ✅ Incluye las advertencias en la respuesta y el PDF

**Ejemplo de advertencia:**

```
⚠️ ALERTA: Paciente alérgico a penicilina - Severidad: severa
Reacción: Shock anafiláctico
```

Si se detecta una alergia, el sistema:

- Retorna error 400
- Proporciona detalles de la alergia
- Impide la creación de la prescripción (seguridad del paciente)

---

## 🏗️ Arquitectura del Proyecto

```
medcore-prescription/
├── prisma/
│   ├── schema.prisma         # Modelos de base de datos
│   └── seed.ts              # Datos iniciales (12 medicamentos)
├── src/
│   ├── app.ts               # Configuración Express + Swagger
│   ├── index.ts             # Punto de entrada
│   ├── controllers/         # Lógica de endpoints
│   │   ├── prescriptions.controller.ts
│   │   ├── allergies.controller.ts
│   │   └── medication-templates.controller.ts
│   ├── routes/              # Definición de rutas
│   │   ├── router.ts
│   │   ├── prescriptions.routes.ts
│   │   ├── allergies.routes.ts
│   │   └── medication-templates.routes.ts
│   ├── services/            # Lógica de negocio
│   ├── middlewares/         # Autenticación y validación
│   ├── schemas/             # Validación con Zod
│   ├── types/               # Tipos TypeScript
│   └── libs/                # Utilidades (Swagger, PDF)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 💾 Modelos de Base de Datos

### Prescription

```typescript
{
  id: string;
  prescriptionNumber: string; // Único: "RX-2025-001234"
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diagnosticId?: string;
  diagnosis: string;
  observations?: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  allergiesChecked: boolean;
  allergyWarnings: string[];
  medications: Medication[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Medication

```typescript
{
  id: string;
  prescriptionId: string;
  name: string;
  genericName?: string;
  dosage: string; // "500mg", "10ml"
  frequency: string; // "cada 8 horas"
  duration: number;
  durationType: string; // "días", "semanas", "meses"
  administrationRoute: string; // "oral", "intravenosa"
  instructions?: string;
  warnings?: string;
}
```

### PatientAllergy

```typescript
{
  id: string;
  patientId: string;
  allergyType: string; // "medicamento", "alimento", "ambiental"
  allergen: string; // "penicilina", "ibuprofeno"
  severity: string; // "leve", "moderada", "severa"
  reaction?: string;
  diagnosedDate?: Date;
}
```

### MedicationTemplate

```typescript
{
  id: string;
  code: string; // "MED-001" (único)
  name: string; // "Acetaminofén"
  genericName: string; // "Paracetamol"
  category: string; // "Analgésico"
  commonDiagnosis: string[]; // ["Cefalea", "Fiebre"]
  dosage: string;
  frequency: string;
  duration: number;
  durationType: string;
  administrationRoute: string;
  instructions?: string;
  warnings?: string;
  isActive: boolean;
}
```

---

## 🤝 Roles y Permisos

| Acción             | MEDICO | ENFERMERA | ADMINISTRADOR | PACIENTE |
| ------------------ | ------ | --------- | ------------- | -------- |
| Crear prescripción | ✅     | ❌        | ❌            | ❌       |
| Ver prescripción   | ✅\*   | ❌        | ✅            | ✅\*\*   |
| Actualizar estado  | ✅\*   | ❌        | ✅            | ❌       |
| Registrar alergia  | ✅     | ✅        | ✅            | ❌       |
| Ver alergias       | ✅     | ✅        | ✅            | ✅\*\*   |
| Eliminar alergia   | ✅     | ❌        | ✅            | ❌       |
| Ver templates      | ✅     | ✅        | ✅            | ✅       |
| Descargar PDF      | ✅     | ❌        | ✅            | ✅\*\*   |

\*Solo sus propias prescripciones  
\*\*Solo sus propios datos

---

## 🔗 Integración con Otros Servicios

### medcore-auth (Puerto 3001)

- Valida tokens JWT
- Verifica permisos por rol
- Proporciona datos del usuario autenticado

### medcore-users (Puerto 3002)

- Valida existencia de pacientes
- Valida que el doctor tenga rol MEDICO
- Obtiene datos completos para generación de PDF

### medcore-apigateway (Puerto 3000)

Todas las rutas están expuestas a través del gateway:

- `/api/v1/prescriptions/*`
- `/api/v1/allergies/*`
- `/api/v1/medication-templates/*`

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Ejecutar en modo desarrollo con hot-reload

# Producción
npm run build        # Compilar TypeScript a JavaScript
npm start            # Ejecutar versión compilada

# Base de datos
npx prisma generate  # Generar cliente Prisma
npx prisma db push   # Sincronizar schema con MongoDB
npm run seed         # Cargar 12 medicamentos predefinidos

# Calidad de código
npm run lint         # Verificar código con ESLint
```

---

## 📊 Documentación Interactiva

Accede a **Swagger UI** en:

```
http://localhost:3005/api/v1/docs
```

### Características de Swagger:

- 📖 Ver todos los endpoints disponibles
- 🧪 Probar peticiones directamente desde el navegador
- 📝 Ver ejemplos de request/response
- 🔐 Autenticarte con tu token JWT
- 📋 Documentación de schemas y modelos

---

## 🐛 Troubleshooting

### ❌ Error: "Unauthorized" o "Invalid token"

**Solución:**

1. Verifica que el token no haya expirado
2. Asegúrate de incluir `Bearer` antes del token
3. Confirma que el `JWT_SECRET` sea el mismo en auth y prescription

### ❌ Error: "Database connection failed"

**Solución:**

1. Verifica que MongoDB esté corriendo
2. Confirma la URL en `DATABASE_URL`
3. Ejecuta `npx prisma db push`

### ❌ No aparecen los templates de medicamentos

**Solución:**

```bash
npm run seed
```

### ❌ El PDF no se genera correctamente

**Solución:**

1. Verifica que exista la carpeta `public/`
2. Confirma que el paquete `pdfkit` esté instalado
3. Revisa los logs del servidor para más detalles

---

## 📝 Notas Importantes

1. 🔒 **Solo MEDICO puede crear prescripciones**
2. 🛡️ **Validación automática de alergias** en cada prescripción
3. 👥 **Control de acceso granular** por rol
4. 📄 **PDFs profesionales** listos para imprimir
5. 🔢 **Numeración secuencial única** por prescripción
6. 💊 **12 medicamentos predefinidos** para uso rápido

---

## 🚦 Estados de Prescripción

- `ACTIVE`: Prescripción activa y vigente
- `COMPLETED`: Tratamiento completado
- `CANCELLED`: Prescripción cancelada

---

## 🔄 Flujo de Trabajo Completo

1. **Doctor crea prescripción** (puede usar templates)
2. **Sistema valida alergias automáticamente**
3. **Genera advertencias** si hay coincidencias
4. **Crea prescripción** con número único si no hay alergias críticas
5. **Paciente puede ver** y descargar PDF
6. **Doctor puede actualizar estado** según evolución

---

## 📞 Información del Servicio

- **Puerto:** 3005
- **Base de datos:** medcore-prescription (MongoDB)
- **Documentación:** http://localhost:3005/api/v1/docs
- **Health check:** http://localhost:3005/health

---

**Desarrollado con ❤️ para MedCore**
