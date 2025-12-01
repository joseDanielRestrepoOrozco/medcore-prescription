# 🧪 Guía de Pruebas - MedCore Prescription Service

## 📋 Pre-requisitos

### 1. Servicios que deben estar corriendo:

```bash
# Terminal 1 - Auth Service
cd medcore-auth
npm install
npx prisma generate
npx prisma db push
npm run dev
# Debe correr en: http://localhost:3001

# Terminal 2 - Users Service
cd medcore-users
npm install
npx prisma generate
npx prisma db push
npm run dev
# Debe correr en: http://localhost:3002

# Terminal 3 - API Gateway
cd medcore-apigateway
npm install
npm run dev
# Debe correr en: http://localhost:3000

# Terminal 4 - Prescription Service
cd medcore-prescription
npm install
npx prisma generate
npx prisma db push
npm run dev
# Debe correr en: http://localhost:3005
```

---

## 🚀 Orden de Pruebas

### **PASO 1: Importar Colección en Postman**

1. Abre Postman
2. Clic en **Import** (esquina superior izquierda)
3. Selecciona el archivo: `medcore-prescription/postman/medcore-prescriptions.postman_collection.json`
4. La colección aparecerá con el nombre **"MedCore - Prescriptions Service"**

---

### **PASO 2: Autenticación**

Ejecuta **EN ORDEN** estos 3 requests de la carpeta "1. Autenticación":

✅ **Login MEDICO** → Guarda automáticamente el token del doctor  
✅ **Login PACIENTE** → Guarda automáticamente el token del paciente  
✅ **Login ADMINISTRADOR** → Guarda automáticamente el token del admin

> **IMPORTANTE:** Ajusta los emails/passwords según los usuarios que hayas creado en tu BD

---

### **PASO 3: Registrar Alergias**

Carpeta "2. Alergias del Paciente":

1. **Registrar Alergia - Penicilina** (severidad: severa)
2. **Registrar Alergia - Ibuprofeno** (severidad: moderada)
3. **Ver Alergias del Paciente** → Debe mostrar las 2 alergias registradas

---

### **PASO 4: Crear Prescripciones**

Carpeta "3. Prescripciones":

#### 🟢 **Prescripción SIN alergias**

- **Request:** "Crear Prescripción SIN alergias"
- Medicamentos: Amoxicilina + Acetaminofén
- **Resultado esperado:**
  ```json
  {
    "message": "Prescripción creada exitosamente",
    "prescription": { ... },
    "allergyWarnings": [],
    "hasAllergies": false
  }
  ```

#### ⚠️ **Prescripción CON advertencia**

- **Request:** "Crear Prescripción CON advertencia de alergia"
- Medicamentos: Ibuprofeno (paciente es alérgico)
- **Resultado esperado:**
  ```json
  {
    "message": "Prescripción creada exitosamente",
    "prescription": { ... },
    "allergyWarnings": [
      "⚠️ ALERTA: Paciente alérgico a Ibuprofeno - Severidad: moderada"
    ],
    "hasAllergies": true
  }
  ```

---

### **PASO 5: Consultar Prescripciones**

1. **Ver Prescripción por ID (MEDICO)** → ✅ Debe mostrar la prescripción
2. **Ver Prescripción por ID (PACIENTE)** → ✅ Debe mostrar la prescripción (es suya)
3. **Mis Prescripciones (MEDICO)** → Lista todas las prescripciones que el médico creó
4. **Prescripciones por Paciente** → Lista todas las prescripciones del paciente

---

### **PASO 6: Actualizar Estado**

- **Request:** "Actualizar Estado a COMPLETED"
- Cambia el estado de ACTIVE → COMPLETED
- **Resultado esperado:** 200 OK con la prescripción actualizada

---

### **PASO 7: Descargar PDF** 📄

- **Request:** "Descargar PDF"
- **Resultado esperado:** Archivo PDF descargado con:
  - Encabezado profesional
  - Información del médico y paciente
  - Diagnóstico
  - ⚠️ Advertencias de alergias (si las hay) en ROJO
  - Lista de medicamentos con todas las instrucciones
  - Firma del médico

---

### **PASO 8: Pruebas de Permisos** 🔒

Carpeta "4. Pruebas de Permisos":

1. **❌ PACIENTE intenta crear prescripción**

   - **Resultado esperado:** `403 Forbidden`
   - Solo médicos pueden crear prescripciones

2. **❌ Sin Token - Acceso denegado**
   - **Resultado esperado:** `401 Unauthorized`
   - Todos los endpoints requieren autenticación

---

## 🎯 Resultados Esperados

### ✅ Funcionalidades que DEBEN funcionar:

- [x] Login con diferentes roles (MEDICO, PACIENTE, ADMIN)
- [x] Registro de alergias del paciente
- [x] Creación de prescripciones con validación automática de alergias
- [x] Advertencias en rojo cuando hay conflicto con alergias
- [x] Consulta de prescripciones con filtros de rol
- [x] MEDICO solo ve prescripciones que él creó
- [x] PACIENTE solo ve sus propias prescripciones
- [x] ADMINISTRADOR ve todas las prescripciones
- [x] Actualización de estado (ACTIVE → COMPLETED → CANCELLED)
- [x] Generación de PDF profesional
- [x] Control de permisos (403 cuando no autorizado)

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"

```bash
# Verifica tu .env en medcore-prescription
DATABASE_URL="mongodb+srv://..."
```

### Error: "User not found" al hacer login

```bash
# Crea usuarios de prueba en medcore-users primero
# O ajusta los emails en los requests de Postman
```

### Error: "Service unavailable"

```bash
# Verifica que TODOS los servicios estén corriendo:
# - medcore-auth (3001)
# - medcore-users (3002)
# - medcore-apigateway (3000)
# - medcore-prescription (3005)
```

### Error: "Invalid token"

```bash
# Vuelve a hacer login para obtener un token fresco
# Los tokens expiran después de cierto tiempo
```

---

## 📊 Verificaciones Finales

### En la Terminal de medcore-prescription debes ver:

```
✔️ Prisma Client generated
✔️ Server running on port 3005
✔️ MongoDB connected
```

### En Postman debes tener:

```
✔️ Variables de entorno con tokens guardados
✔️ prescription_id guardado después de crear una prescripción
✔️ patient_id guardado después del login
```

---

## 📞 Siguiente Paso

Una vez que todas las pruebas pasen exitosamente:
✅ El servicio de prescripciones está completamente funcional
✅ Podemos proceder con **Medical Orders Service**

---

**¿Algún error? Comparte el mensaje exacto y te ayudo a resolverlo!** 🚀
