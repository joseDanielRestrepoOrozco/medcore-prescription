import { Router } from 'express';
import { requireRoles, authenticateUser } from '../middlewares/auth.js';
import * as controller from '../controllers/allergies.controller.js';

const router = Router();

/**
 * @openapi
 * /allergies:
 *   post:
 *     tags: [Allergies]
 *     summary: Registrar alergia del paciente
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAllergyRequest'
 *     responses:
 *       201:
 *         description: Alergia registrada exitosamente
 *       403:
 *         description: No autorizado
 */
router.post(
  '/',
  requireRoles(['MEDICO', 'ENFERMERA', 'ADMINISTRADOR']),
  controller.createAllergy
);

/**
 * @openapi
 * /allergies/patient/{patientId}:
 *   get:
 *     tags: [Allergies]
 *     summary: Obtener alergias de un paciente
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de alergias del paciente
 */
router.get('/patient/:patientId', authenticateUser(), controller.getPatientAllergies);

/**
 * @openapi
 * /allergies/{id}:
 *   delete:
 *     tags: [Allergies]
 *     summary: Eliminar registro de alergia
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alergia eliminada
 *       403:
 *         description: No autorizado
 */
router.delete('/:id', requireRoles(['MEDICO', 'ADMINISTRADOR']), controller.deleteAllergy);

export default router;
