import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Verifica si un paciente tiene alergias a alguno de los medicamentos prescritos
 */
export async function checkPatientAllergies(
  patientId: string,
  medications: string[]
): Promise<{ hasAllergies: boolean; warnings: string[] }> {
  const allergies = await prisma.patientAllergy.findMany({
    where: { patientId },
  });

  const warnings: string[] = [];

  for (const medName of medications) {
    for (const allergy of allergies) {
      const medLower = medName.toLowerCase();
      const allergenLower = allergy.allergen.toLowerCase();

      // Verificar si hay coincidencia entre medicamento y alérgeno
      if (medLower.includes(allergenLower) || allergenLower.includes(medLower)) {
        warnings.push(
          `ALERTA: Paciente alérgico a ${allergy.allergen} - Severidad: ${allergy.severity}. ${allergy.reaction ? `Reacción: ${allergy.reaction}` : ''}`
        );
      }
    }
  }

  return {
    hasAllergies: warnings.length > 0,
    warnings,
  };
}

/**
 * Registra una nueva alergia para un paciente
 */
export async function addPatientAllergy(data: {
  patientId: string;
  allergyType: string;
  allergen: string;
  severity: string;
  reaction?: string;
  diagnosedDate?: Date;
}) {
  return await prisma.patientAllergy.create({
    data,
  });
}

/**
 * Obtiene todas las alergias de un paciente
 */
export async function getPatientAllergies(patientId: string) {
  return await prisma.patientAllergy.findMany({
    where: { patientId },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Elimina una alergia específica
 */
export async function deletePatientAllergy(allergyId: string) {
  return await prisma.patientAllergy.delete({
    where: { id: allergyId },
  });
}
