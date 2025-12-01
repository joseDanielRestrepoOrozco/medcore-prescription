import PDFDocument from 'pdfkit';
import { fetchUserInfo } from '../libs/usersClient.js';
import { getPrescriptionById } from './prescriptions.service.js';

/**
 * Genera un PDF de una prescripción médica
 */
export async function generatePrescriptionPDF(prescriptionId: string): Promise<Buffer> {
  const prescription = await getPrescriptionById(prescriptionId);

  if (!prescription) {
    throw new Error('Prescripción no encontrada');
  }

  // Obtener datos completos del doctor y paciente
  const [doctor, patient] = await Promise.all([
    fetchUserInfo(prescription.doctorId),
    fetchUserInfo(prescription.patientId),
  ]);

  if (!doctor || !patient) {
    throw new Error('No se pudo obtener información del doctor o paciente');
  }

  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  // ===== ENCABEZADO =====
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('PRESCRIPCIÓN MÉDICA', { align: 'center' });
  doc
    .fontSize(10)
    .font('Helvetica')
    .text('MedCore - Sistema Integral de Salud', { align: 'center' });
  doc.moveDown(2);

  // Número de prescripción
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`No. ${prescription.prescriptionNumber}`, { align: 'right' });
  doc.moveDown();

  // Línea separadora
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // ===== INFORMACIÓN DEL MÉDICO =====
  doc.fontSize(14).font('Helvetica-Bold').text('Información del Médico:', {
    underline: true,
  });
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(`Nombre: ${doctor.fullname}`)
    .text(`Licencia: ${doctor.medico?.license_number || 'N/A'}`)
    .text(`Especialidad: ${doctor.medico?.specialtyId || 'General'}`);
  doc.moveDown();

  // ===== INFORMACIÓN DEL PACIENTE =====
  doc.fontSize(14).font('Helvetica-Bold').text('Información del Paciente:', {
    underline: true,
  });
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(`Nombre: ${patient.fullname}`)
    .text(`Documento: ${patient.documentNumber || 'N/A'}`)
    .text(`Edad: ${patient.age || 'N/A'} años`);
  doc.moveDown();

  // Línea separadora
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // ===== DIAGNÓSTICO =====
  doc.fontSize(14).font('Helvetica-Bold').text('Diagnóstico:', { underline: true });
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(prescription.diagnosis, { align: 'justify' });
  doc.moveDown();

  // ===== ADVERTENCIAS DE ALERGIAS =====
  if (prescription.allergyWarnings.length > 0) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('red')
      .text('ADVERTENCIAS DE ALERGIAS:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    prescription.allergyWarnings.forEach((warning: string) => {
      doc.text(`• ${warning}`);
    });
    doc.fillColor('black');
    doc.moveDown();
  }

  // ===== MEDICAMENTOS PRESCRITOS =====
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('black')
    .text('Medicamentos Prescritos:', { underline: true });
  doc.moveDown(0.5);

  prescription.medications.forEach((med: any, idx: number) => {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`${idx + 1}. ${med.name} - ${med.dosage}`, {
        underline: true,
      });
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`   Nombre genérico: ${med.genericName || 'N/A'}`)
      .text(`   Frecuencia: ${med.frequency}`)
      .text(`   Duración: ${med.duration} ${med.durationType}`)
      .text(`   Vía de administración: ${med.administrationRoute}`);

    if (med.instructions) {
      doc.text(`   Instrucciones: ${med.instructions}`);
    }
    if (med.warnings) {
      doc.fillColor('red').text(`   ⚠️ Advertencias: ${med.warnings}`).fillColor('black');
    }
    doc.moveDown();
  });

  // ===== OBSERVACIONES =====
  if (prescription.observations) {
    doc.fontSize(12).font('Helvetica-Bold').text('Observaciones:', {
      underline: true,
    });
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(prescription.observations, { align: 'justify' });
    doc.moveDown();
  }

  // Línea separadora final
  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // ===== FOOTER =====
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(
      `Fecha de emisión: ${new Date(prescription.createdAt).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      {
        align: 'left',
      }
    );

  doc.moveDown(3);
  doc.text('_____________________________', { align: 'right' });
  doc.text('Firma del Médico', { align: 'right' });
  doc.text(doctor.fullname, { align: 'right' });

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}
