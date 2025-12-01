import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MedCore - Prescriptions API',
      version: '1.0.0',
      description: 'API para gestión de prescripciones médicas con validación de alergias',
      contact: {
        name: 'MedCore Team',
        email: 'support@medcore.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'API Gateway',
      },
      {
        url: 'http://localhost:3005/api/v1',
        description: 'Prescription Service (directo)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT obtenido del servicio de autenticación',
        },
      },
      schemas: {
        Prescription: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            prescriptionNumber: { type: 'string', example: 'RX-20251201-0001' },
            patientId: { type: 'string' },
            doctorId: { type: 'string' },
            diagnosticId: { type: 'string', nullable: true },
            diagnosis: { type: 'string', example: 'Infección respiratoria aguda' },
            medications: {
              type: 'array',
              items: { $ref: '#/components/schemas/Medication' },
            },
            notes: { type: 'string', nullable: true },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
            patientName: { type: 'string' },
            doctorName: { type: 'string' },
          },
        },
        Medication: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Amoxicilina' },
            dosage: { type: 'string', example: '500 mg' },
            frequency: { type: 'string', example: 'Cada 8 horas' },
            duration: { type: 'string', example: '7 días' },
            instructions: { type: 'string', example: 'Tomar con alimentos' },
            calculatedDuration: { type: 'string' },
          },
        },
        Allergy: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            patientId: { type: 'string' },
            allergen: { type: 'string', example: 'Penicilina' },
            reaction: { type: 'string', example: 'Erupción cutánea' },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },
            recordedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreatePrescriptionRequest: {
          type: 'object',
          required: ['patientId', 'diagnosis', 'medications'],
          properties: {
            patientId: { type: 'string' },
            diagnosticId: { type: 'string' },
            diagnosis: { type: 'string' },
            medications: {
              type: 'array',
              items: {
                type: 'object',
                required: ['name', 'dosage', 'frequency', 'duration'],
                properties: {
                  name: { type: 'string' },
                  dosage: { type: 'string' },
                  frequency: { type: 'string' },
                  duration: { type: 'string' },
                  instructions: { type: 'string' },
                },
              },
            },
            notes: { type: 'string' },
          },
        },
        CreateAllergyRequest: {
          type: 'object',
          required: ['patientId', 'allergen', 'severity'],
          properties: {
            patientId: { type: 'string' },
            allergen: { type: 'string' },
            reaction: { type: 'string' },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/v1/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
