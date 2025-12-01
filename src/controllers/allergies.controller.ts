import { type Request, type Response } from 'express';
import * as service from '../services/allergies.service.js';
import { createAllergySchema } from '../schemas/Prescription.js';

/**
 * POST /api/v1/allergies
 * Registra una nueva alergia para un paciente
 */
export async function createAllergy(req: Request, res: Response) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Solo MEDICO, ENFERMERA o ADMINISTRADOR pueden registrar alergias
    if (!['MEDICO', 'ENFERMERA', 'ADMINISTRADOR'].includes(user.role)) {
      return res.status(403).json({
        error: 'No tiene permisos para registrar alergias',
      });
    }

    // Validar datos
    const validatedData = createAllergySchema.parse(req.body);

    const allergy = await service.addPatientAllergy(validatedData);

    return res.status(201).json({
      message: 'Alergia registrada exitosamente',
      allergy,
    });
  } catch (err: any) {
    console.error('[allergies.create] error', err);

    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: 'Datos inválidos',
        issues: err.errors,
      });
    }

    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * GET /api/v1/allergies/patient/:patientId
 * Obtiene todas las alergias de un paciente
 */
export async function getPatientAllergies(req: Request, res: Response) {
  try {
    const user = req.user;
    const { patientId } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!patientId) {
      return res.status(400).json({ error: 'patientId es requerido' });
    }

    // PACIENTE solo puede ver sus propias alergias
    if (user.role === 'PACIENTE' && user.id !== patientId) {
      return res.status(403).json({
        error: 'No tiene permisos para ver estas alergias',
      });
    }

    const allergies = await service.getPatientAllergies(patientId);

    return res.json({
      allergies,
      total: allergies.length,
    });
  } catch (err: any) {
    console.error('[allergies.getByPatient] error', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * DELETE /api/v1/allergies/:id
 * Elimina una alergia
 */
export async function deleteAllergy(req: Request, res: Response) {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!id) {
      return res.status(400).json({ error: 'id es requerido' });
    }

    // Solo MEDICO o ADMINISTRADOR pueden eliminar alergias
    if (user.role !== 'MEDICO' && user.role !== 'ADMINISTRADOR') {
      return res.status(403).json({
        error: 'No tiene permisos para eliminar alergias',
      });
    }

    await service.deletePatientAllergy(id);

    return res.json({
      message: 'Alergia eliminada exitosamente',
    });
  } catch (err: any) {
    console.error('[allergies.delete] error', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
