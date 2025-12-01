# Guía de Endpoints - Prescriptions API

## 📋 Descripción General

API para la gestión de prescripciones médicas con validación de alergias. Permite a los médicos crear recetas, consultar historiales y generar documentos PDF.

**Puerto:** 3005  
**Base URL:** `http://localhost:3000/api/v1` (a través del API Gateway)

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante JWT Bearer Token.

**Header requerido:**

```
Authorization: Bearer <token>
```

**Roles disponibles:**

- `MEDICO` - Puede crear y consultar prescripciones
- `PACIENTE` - Puede consultar sus propias prescripciones
- `ENFERMERA` - Puede consultar prescripciones
- `ADMINISTRADOR` - Acceso completo

---

## 📁 Endpoints

### 1. Prescripciones

#### 1.1 Crear prescripción (Solo MEDICO)

```http
POST /api/v1/prescriptions
```

**Body:**

```json
{
  "patientId": "6914a69e84e376fa5df0d1ae",
  "diagnosticId": "692abc1234567890abcdef12",
  "diagnosis": "Infección respiratoria aguda",
  "medications": [
    {
      "name": "Amoxicilina",
      "dosage": "500 mg",
      "frequency": "Cada 8 horas",
      "duration": "7 días",
      "instructions": "Tomar con alimentos"
    },
    {
      "name": "Ibuprofeno",
      "dosage": "400 mg",
      "frequency": "Cada 6 horas si hay dolor",
      "duration": "5 días",
      "instructions": "No tomar con el estómago vacío"
    }
  ],
  "notes": "Evitar consumo de alcohol durante el tratamiento"
}
```

**Validaciones automáticas:**

- Verifica que el paciente exista
- Verifica que el médico exista
- **Valida alergias**: Comprueba si el paciente es alérgico a alguno de los medicamentos

**Respuesta exitosa (201):**

```json
{
  "id": "692def1234567890abcdef56",
  "prescriptionNumber": "RX-20251201-0001",
  "patientId": "6914a69e84e376fa5df0d1ae",
  "doctorId": "69149b9c84e376fa5df0d1aa",
  "diagnosticId": "692abc1234567890abcdef12",
  "diagnosis": "Infección respiratoria aguda",
  "medications": [...],
  "notes": "Evitar consumo de alcohol durante el tratamiento",
  "status": "ACTIVE",
  "createdAt": "2025-12-01T10:30:00.000Z",
  "expiresAt": "2025-12-31T10:30:00.000Z"
}
```

**Error por alergia (400):**

```json
{
  "error": "El paciente es alérgico a los siguientes medicamentos: Amoxicilina"
}
```

#### 1.2 Consultar prescripciones de un paciente

```http
GET /api/v1/prescriptions/patient/:patientId
```

**Parámetros:**

- `patientId` - ID del paciente

**Respuesta:**

```json
[
  {
    "id": "692def1234567890abcdef56",
    "prescriptionNumber": "RX-20251201-0001",
    "patientName": "Ana Suarez",
    "doctorName": "Juan Sanchez",
    "diagnosis": "Infección respiratoria aguda",
    "status": "ACTIVE",
    "medications": [
      {
        "name": "Amoxicilina",
        "dosage": "500 mg",
        "frequency": "Cada 8 horas",
        "duration": "7 días",
        "calculatedDuration": "7 días"
      }
    ],
    "createdAt": "2025-12-01T10:30:00.000Z",
    "expiresAt": "2025-12-31T10:30:00.000Z"
  }
]
```

**Nota:** Las prescripciones se retornan ordenadas de más reciente a más antigua.

#### 1.3 Consultar prescripción por ID

```http
GET /api/v1/prescriptions/:id
```

**Parámetros:**

- `id` - ID de la prescripción

**Respuesta:** Objeto de prescripción con detalles completos

#### 1.4 Descargar PDF de prescripción

```http
GET /api/v1/prescriptions/:id/pdf
```

**Parámetros:**

- `id` - ID de la prescripción

**Respuesta:** Archivo PDF con la receta médica formateada

**Contenido del PDF:**

- Encabezado con información del médico
- Datos del paciente
- Número de prescripción
- Diagnóstico
- Lista detallada de medicamentos con instrucciones
- Notas adicionales
- Fecha de emisión y vigencia
- Firma digital del médico

---

### 2. Alergias

#### 2.1 Registrar alergia del paciente (MEDICO o ADMINISTRADOR)

```http
POST /api/v1/allergies
```

**Body:**

```json
{
  "patientId": "6914a69e84e376fa5df0d1ae",
  "allergen": "Penicilina",
  "reaction": "Erupción cutánea severa",
  "severity": "high"
}
```

**Niveles de severidad:**

- `low` - Leve (molestias menores)
- `medium` - Moderada (requiere atención)
- `high` - Alta (riesgo significativo)

**Respuesta (201):**

```json
{
  "id": "692xyz9876543210fedcba98",
  "patientId": "6914a69e84e376fa5df0d1ae",
  "allergen": "Penicilina",
  "reaction": "Erupción cutánea severa",
  "severity": "high",
  "recordedAt": "2025-12-01T10:00:00.000Z"
}
```

#### 2.2 Consultar alergias de un paciente

```http
GET /api/v1/allergies/patient/:patientId
```

**Parámetros:**

- `patientId` - ID del paciente

**Respuesta:**

```json
[
  {
    "id": "692xyz9876543210fedcba98",
    "allergen": "Penicilina",
    "reaction": "Erupción cutánea severa",
    "severity": "high",
    "recordedAt": "2025-12-01T10:00:00.000Z"
  },
  {
    "id": "692xyz9876543210fedcba99",
    "allergen": "Ibuprofeno",
    "reaction": "Náuseas y mareos",
    "severity": "medium",
    "recordedAt": "2025-11-15T14:30:00.000Z"
  }
]
```

#### 2.3 Eliminar registro de alergia (MEDICO o ADMINISTRADOR)

```http
DELETE /api/v1/allergies/:id
```

**Parámetros:**

- `id` - ID del registro de alergia

**Respuesta (200):**

```json
{
  "message": "Registro de alergia eliminado correctamente"
}
```

---

## 📊 Estados de Prescripción

| Estado      | Descripción                   |
| ----------- | ----------------------------- |
| `ACTIVE`    | Prescripción vigente y activa |
| `COMPLETED` | Tratamiento completado        |
| `CANCELLED` | Prescripción cancelada        |
| `EXPIRED`   | Prescripción vencida          |

---

## 🔍 Validación de Alergias

El sistema realiza validación automática de alergias al crear una prescripción:

1. Obtiene todas las alergias registradas del paciente
2. Compara cada medicamento con la lista de alérgenos
3. Si encuentra coincidencia, rechaza la prescripción con código 400
4. Retorna los medicamentos conflictivos en el mensaje de error

**Ejemplo de validación:**

```json
// Paciente tiene alergia registrada a "Penicilina"
// Se intenta prescribir "Amoxicilina" (derivado de penicilina)

// Respuesta del sistema:
{
  "error": "El paciente es alérgico a los siguientes medicamentos: Amoxicilina"
}
```

---

## 📊 Códigos de Estado

| Código | Descripción                            |
| ------ | -------------------------------------- |
| 200    | Operación exitosa                      |
| 201    | Recurso creado exitosamente            |
| 400    | Error de validación (incluye alergias) |
| 401    | No autenticado                         |
| 403    | No autorizado                          |
| 404    | Recurso no encontrado                  |
| 503    | Servicio no disponible                 |

---

## 🧪 Ejemplos de Uso

### Flujo completo de prescripción

**1. Registrar alergia del paciente**

```bash
curl -X POST http://localhost:3000/api/v1/allergies \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "6914a69e84e376fa5df0d1ae",
    "allergen": "Penicilina",
    "reaction": "Erupción cutánea",
    "severity": "high"
  }'
```

**2. Crear prescripción (evitando alérgenos)**

```bash
curl -X POST http://localhost:3000/api/v1/prescriptions \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "6914a69e84e376fa5df0d1ae",
    "diagnosis": "Infección urinaria",
    "medications": [
      {
        "name": "Ciprofloxacino",
        "dosage": "500 mg",
        "frequency": "Cada 12 horas",
        "duration": "7 días"
      }
    ]
  }'
```

**3. Consultar prescripciones del paciente**

```bash
curl -X GET http://localhost:3000/api/v1/prescriptions/patient/6914a69e84e376fa5df0d1ae \
  -H "Authorization: Bearer TOKEN"
```

**4. Descargar PDF**

```bash
curl -X GET http://localhost:3000/api/v1/prescriptions/692def1234567890abcdef56/pdf \
  -H "Authorization: Bearer TOKEN" \
  -o prescripcion.pdf
```

---

## 🔄 Cálculo de Duración

El sistema calcula automáticamente la duración del tratamiento basándose en el tipo de medicamento:

| Tipo              | Duración calculada       |
| ----------------- | ------------------------ |
| Antibióticos      | Según días especificados |
| Analgésicos       | Según necesidad (PRN)    |
| Antiinflamatorios | 5-7 días típicamente     |
| Otros             | Según indicación médica  |

---

## 📝 Notas Importantes

1. **Numeración automática**: Las prescripciones se numeran con formato `RX-YYYYMMDD-XXXX`
2. **Vigencia**: Por defecto, las prescripciones son válidas por 30 días
3. **Validación de alergias**: Es obligatoria y automática en cada prescripción
4. **PDF profesional**: Se genera con formato médico estándar
5. **Historial completo**: Se mantiene registro de todas las prescripciones del paciente
6. **Enriquecimiento**: Las respuestas incluyen nombres de paciente y médico automáticamente

---

## 🔗 Integración con Postman

Se incluye una colección completa en `postman/medcore-prescriptions.postman_collection.json` con:

- Variables de entorno configuradas
- Ejemplos de todas las operaciones
- Casos de validación de alergias
- Scripts de auto-guardado

---

## ⚕️ Consideraciones Médicas

- El sistema ayuda a prevenir errores médicos validando alergias
- Los médicos deben actualizar el registro de alergias regularmente
- Las prescripciones vencidas no se pueden modificar
- Se recomienda revisar el historial de alergias antes de prescribir
