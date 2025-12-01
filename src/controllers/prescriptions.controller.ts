import { type Request, type Response } from 'express';
import * as service from '../services/prescriptions.service.js';
import * as pdfService from '../services/pdf.service.js';
import { fetchUserInfo, fetchDoctorName } from '../libs/usersClient.js';
import {
  createPrescriptionSchema,
  updatePrescriptionStatusSchema,
} from '../schemas/Prescription.js';

/**
 * POST /api/v1/prescriptions
 * Crea una nueva prescripción médica
 */
export async function createPrescription(req: Request, res: Response) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Solo MEDICO puede crear prescripciones
    if (user.role !== 'MEDICO') {
      return res.status(403).json({
        error: 'Solo los médicos pueden crear prescripciones',
      });
    }

    // Validar datos de entrada
    const validatedData = createPrescriptionSchema.parse(req.body);

    // Crear prescripción
    const result = await service.createPrescription(user.id, validatedData);

    return res.status(201).json({
      message: 'Prescripción creada exitosamente',
      prescription: result.prescription,
      allergyWarnings: result.allergyWarnings,
      hasAllergies: result.hasAllergies,
    });
  } catch (err: any) {
    console.error('[prescriptions.create] error', err);

    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        issues: err.errors,
      });
    }

    return res.status(400).json({
      error: err.message || 'No se pudo crear la prescripción',
    });
  }
}

/**
 * GET /api/v1/prescriptions/patient/:patientId
 * Obtiene prescripciones de un paciente
 */
export async function getPrescriptionsByPatient(req: Request, res: Response) {
  try {
    const user = req.user;
    const { patientId } = req.params;
    const {
      page = '1',
      limit = '10',
      status,
    } = req.query;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!patientId) {
      return res.status(400).json({ error: 'patientId es requerido' });
    }

    // PACIENTE solo puede ver sus propias prescripciones
    if (user.role === 'PACIENTE' && user.id !== patientId) {
      return res.status(403).json({
        error: 'No tiene permisos para ver estas prescripciones',
      });
    }

    const result = await service.getPrescriptionsByPatient(patientId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as any,
    });

    // Enriquecer con datos del doctor
    const enrichedPrescriptions = await Promise.all(
      result.prescriptions.map(async (prescription: any) => {
        const doctor = await fetchDoctorName(prescription.doctorId);
        return {
          ...prescription,
          doctorName: doctor?.fullname || 'Desconocido',
        };
      })
    );

    return res.json({
      prescriptions: enrichedPrescriptions,
      pagination: result.pagination,
    });
  } catch (err: any) {
    console.error('[prescriptions.getByPatient] error', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * GET /api/v1/prescriptions/:id
 * Obtiene una prescripción específica
 * MEDICO: puede ver solo las que él creó
 * PACIENTE: puede ver solo las suyas
 * ADMINISTRADOR: puede ver todas
 */
export async function getPrescriptionById(req: Request, res: Response) {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!id) {
      return res.status(400).json({ error: 'id es requerido' });
    }

    const prescription = await service.getPrescriptionById(id);

    if (!prescription) {
      return res.status(404).json({ error: 'Prescripción no encontrada' });
    }

    // Validar permisos según el rol
    if (user.role === 'MEDICO' && prescription.doctorId !== user.id) {
      return res.status(403).json({
        error: 'No tiene permisos para ver esta prescripción',
      });
    }

    if (user.role === 'PACIENTE' && prescription.patientId !== user.id) {
      return res.status(403).json({
        error: 'No tiene permisos para ver esta prescripción',
      });
    }

    // Enriquecer con datos del doctor y paciente
    const [doctor, patient] = await Promise.all([
      fetchUserInfo(prescription.doctorId),
      fetchUserInfo(prescription.patientId),
    ]);

    return res.json({
      ...prescription,
      doctorName: doctor?.fullname || 'Desconocido',
      patientName: patient?.fullname || 'Desconocido',
    });
  } catch (err: any) {
    console.error('[prescriptions.getById] error', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * GET /api/v1/prescriptions/doctor/me
 * Obtiene prescripciones creadas por el médico autenticado
 */
export async function getMyPrescriptions(req: Request, res: Response) {
  try {
    const user = req.user;
    const {
      page = '1',
      limit = '10',
      status,
    } = req.query;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (user.role !== 'MEDICO') {
      return res.status(403).json({
        error: 'Solo los médicos pueden usar este endpoint',
      });
    }

    const result = await service.getPrescriptionsByDoctor(user.id, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as any,
    });

    // Enriquecer con datos del paciente
    const enrichedPrescriptions = await Promise.all(
      result.prescriptions.map(async (prescription: any) => {
        const patient = await fetchUserInfo(prescription.patientId);
        return {
          ...prescription,
          patientName: patient?.fullname || 'Desconocido',
        };
      })
    );

    return res.json({
      prescriptions: enrichedPrescriptions,
      pagination: result.pagination,
    });
  } catch (err: any) {
    console.error('[prescriptions.getMyPrescriptions] error', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * PATCH /api/v1/prescriptions/:id/status
 * Actualiza el estado de una prescripción
 */
export async function updatePrescriptionStatus(req: Request, res: Response) {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!id) {
      return res.status(400).json({ error: 'id es requerido' });
    }

    // Solo MEDICO o ADMINISTRADOR pueden actualizar el estado
    if (user.role !== 'MEDICO' && user.role !== 'ADMINISTRADOR') {
      return res.status(403).json({
        error: 'No tiene permisos para actualizar prescripciones',
      });
    }

    // Validar datos
    const validatedData = updatePrescriptionStatusSchema.parse(req.body);

    // Verificar que la prescripción existe
    const prescription = await service.getPrescriptionById(id);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescripción no encontrada' });
    }

    // MEDICO solo puede actualizar sus propias prescripciones
    if (user.role === 'MEDICO' && prescription.doctorId !== user.id) {
      return res.status(403).json({
        error: 'Solo puede actualizar sus propias prescripciones',
      });
    }

    const updated = await service.updatePrescriptionStatus(prescription.id, validatedData.status);

    return res.json({
      message: 'Estado actualizado exitosamente',
      prescription: updated,
    });
  } catch (err: any) {
    console.error('[prescriptions.updateStatus] error', err);

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
 * GET /api/v1/prescriptions/:id/pdf
 * Genera y descarga el PDF de la prescripción
 */
export async function downloadPrescriptionPDF(req: Request, res: Response) {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!id) {
      return res.status(400).json({ error: 'id es requerido' });
    }

    // Verificar permisos
    const prescription = await service.getPrescriptionById(id);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescripción no encontrada' });
    }

    if (user.role === 'MEDICO' && prescription.doctorId !== user.id) {
      return res.status(403).json({
        error: 'No tiene permisos para descargar esta prescripción',
      });
    }

    if (user.role === 'PACIENTE' && prescription.patientId !== user.id) {
      return res.status(403).json({
        error: 'No tiene permisos para descargar esta prescripción',
      });
    }

    // Generar PDF
    const pdfBuffer = await pdfService.generatePrescriptionPDF(prescription.id);

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="prescripcion-${prescription.prescriptionNumber}.pdf"`
    );

    return res.send(pdfBuffer);
  } catch (err: any) {
    console.error('[prescriptions.downloadPDF] error', err);
    return res.status(500).json({ error: 'Error al generar el PDF' });
  }
}
