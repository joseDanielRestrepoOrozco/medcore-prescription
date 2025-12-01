import { Router } from 'express';
import { requireRoles, authenticateUser } from '../middlewares/auth.js';
import * as controller from '../controllers/prescriptions.controller.js';

const router = Router();

// Crear prescripción (solo MEDICO)
router.post('/', requireRoles(['MEDICO']), controller.createPrescription);

// Obtener prescripciones por paciente
router.get(
  '/patient/:patientId',
  authenticateUser(),
  controller.getPrescriptionsByPatient
);

// Obtener prescripciones del médico autenticado
router.get('/doctor/me', requireRoles(['MEDICO']), controller.getMyPrescriptions);

// Obtener prescripción por ID
router.get('/:id', authenticateUser(), controller.getPrescriptionById);

// Actualizar estado de prescripción
router.patch(
  '/:id/status',
  requireRoles(['MEDICO', 'ADMINISTRADOR']),
  controller.updatePrescriptionStatus
);

// Descargar PDF de prescripción
router.get('/:id/pdf', authenticateUser(), controller.downloadPrescriptionPDF);

export default router;
