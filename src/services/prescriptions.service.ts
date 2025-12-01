import { PrismaClient, PrescriptionStatus } from '@prisma/client';
import { checkPatientAllergies } from './allergies.service.js';
import { fetchUserInfo } from '../libs/usersClient.js';
import type { CreatePrescriptionData } from '../schemas/Prescription.js';

const prisma = new PrismaClient();

/**
 * Genera un número único de prescripción
 * Formato: PRE-YYYYMMDD-XXXX
 */
async function generatePrescriptionNumber(): Promise<string> {
  const today = new Date();
  const dateStr = (today.toISOString().split('T')[0] ?? '').replace(/-/g, '');

  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const count = await prisma.prescription.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `PRE-${dateStr}-${sequence}`;
}

/**
 * Crea una nueva prescripción médica con validaciones
 */
export async function createPrescription(
  doctorId: string,
  data: CreatePrescriptionData
) {
  // 1. Validar que el paciente existe y es PACIENTE
  const patient = await fetchUserInfo(data.patientId);
  if (!patient || patient.role !== 'PACIENTE') {
    throw new Error('ID de paciente inválido o el usuario no es un paciente');
  }

  // 2. Validar que el doctor es MEDICO
  const doctor = await fetchUserInfo(doctorId);
  if (!doctor || doctor.role !== 'MEDICO') {
    throw new Error('Solo los médicos pueden crear prescripciones');
  }

  // 3. Verificar alergias del paciente
  const medicationNames = data.medications.map((m) => m.name);
  const allergyCheck = await checkPatientAllergies(data.patientId, medicationNames);

  // 4. Generar número de prescripción
  const prescriptionNumber = await generatePrescriptionNumber();

  // 5. Crear la prescripción con los medicamentos
  const prescription = await prisma.prescription.create({
    data: {
      prescriptionNumber,
      patientId: data.patientId,
      doctorId,
      appointmentId: data.appointmentId,
      diagnosticId: data.diagnosticId,
      diagnosis: data.diagnosis,
      observations: data.observations,
      allergiesChecked: true,
      allergyWarnings: allergyCheck.warnings,
      medications: {
        create: data.medications,
      },
    },
    include: {
      medications: true,
    },
  });

  return {
    prescription,
    allergyWarnings: allergyCheck.warnings,
    hasAllergies: allergyCheck.hasAllergies,
  };
}

/**
 * Obtiene prescripciones de un paciente específico
 */
export async function getPrescriptionsByPatient(
  patientId: string,
  filters: {
    page: number;
    limit: number;
    status?: PrescriptionStatus;
  }
) {
  const { page, limit, status } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = { patientId };
  if (status) {
    whereClause.status = status;
  }

  const [prescriptions, total] = await Promise.all([
    prisma.prescription.findMany({
      where: whereClause,
      include: {
        medications: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.prescription.count({ where: whereClause }),
  ]);

  return {
    prescriptions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtiene prescripciones creadas por un doctor específico
 */
export async function getPrescriptionsByDoctor(
  doctorId: string,
  filters: {
    page: number;
    limit: number;
    status?: PrescriptionStatus;
  }
) {
  const { page, limit, status } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = { doctorId };
  if (status) {
    whereClause.status = status;
  }

  const [prescriptions, total] = await Promise.all([
    prisma.prescription.findMany({
      where: whereClause,
      include: {
        medications: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.prescription.count({ where: whereClause }),
  ]);

  return {
    prescriptions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtiene una prescripción por ID
 */
export async function getPrescriptionById(id: string) {
  return await prisma.prescription.findUnique({
    where: { id },
    include: {
      medications: true,
    },
  });
}

/**
 * Actualiza el estado de una prescripción
 */
export async function updatePrescriptionStatus(
  id: string,
  status: PrescriptionStatus
) {
  return await prisma.prescription.update({
    where: { id },
    data: { status },
    include: {
      medications: true,
    },
  });
}
