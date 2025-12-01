import { Router } from 'express';
import { requireRoles, authenticateUser } from '../middlewares/auth.js';
import * as controller from '../controllers/prescriptions.controller.js';

const router = Router();

/**
 * @openapi
 * /prescriptions:
 *   post:
 *     tags: [Prescriptions]
 *     summary: Crear prescripción (Solo MEDICO)
 *     description: Crea una nueva prescripción con validación automática de alergias
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePrescriptionRequest'
 *     responses:
 *       201:
 *         description: Prescripción creada exitosamente
 *       400:
 *         description: Paciente alérgico a uno o más medicamentos
 *       403:
 *         description: No autorizado (requiere rol MEDICO)
 */
router.post('/', requireRoles(['MEDICO']), controller.createPrescription);

/**
 * @openapi
 * /prescriptions/patient/{patientId}:
 *   get:
 *     tags: [Prescriptions]
 *     summary: Obtener prescripciones de un paciente
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de prescripciones
 */
router.get(
  '/patient/:patientId',
  authenticateUser(),
  controller.getPrescriptionsByPatient
);

router.get('/doctor/me', requireRoles(['MEDICO']), controller.getMyPrescriptions);

/**
 * @openapi
 * /prescriptions/{id}:
 *   get:
 *     tags: [Prescriptions]
 *     summary: Obtener prescripción por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescripción encontrada
 */
router.get('/:id', authenticateUser(), controller.getPrescriptionById);

router.patch(
  '/:id/status',
  requireRoles(['MEDICO', 'ADMINISTRADOR']),
  controller.updatePrescriptionStatus
);

/**
 * @openapi
 * /prescriptions/{id}/pdf:
 *   get:
 *     tags: [Prescriptions]
 *     summary: Descargar PDF de prescripción
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:id/pdf', authenticateUser(), controller.downloadPrescriptionPDF);

export default router;
