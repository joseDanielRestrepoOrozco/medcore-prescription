import { Router } from 'express';
import { requireRoles, authenticateUser } from '../middlewares/auth.js';
import * as controller from '../controllers/allergies.controller.js';

const router = Router();

// Registrar nueva alergia
router.post(
  '/',
  requireRoles(['MEDICO', 'ENFERMERA', 'ADMINISTRADOR']),
  controller.createAllergy
);

// Obtener alergias de un paciente
router.get('/patient/:patientId', authenticateUser(), controller.getPatientAllergies);

// Eliminar alergia
router.delete('/:id', requireRoles(['MEDICO', 'ADMINISTRADOR']), controller.deleteAllergy);

export default router;
