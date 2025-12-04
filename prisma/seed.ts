import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding medication templates...');

  const templates = [
    // ANALGÉSICOS
    {
      code: 'MED-001',
      name: 'Acetaminofén',
      genericName: 'Paracetamol',
      category: 'Analgésico',
      commonDiagnosis: ['Cefalea', 'Fiebre', 'Dolor leve a moderado', 'Malestar general'],
      dosage: '500mg',
      frequency: 'Cada 6-8 horas',
      duration: 5,
      durationType: 'días',
      administrationRoute: 'oral',
      instructions: 'Tomar con o sin alimentos. No exceder 4 gramos al día.',
      warnings: 'No consumir con alcohol. Precaución en pacientes con enfermedad hepática.',
    },
    {
      code: 'MED-002',
      name: 'Ibuprofeno',
      genericName: 'Ibuprofeno',
      category: 'Antiinflamatorio',
      commonDiagnosis: ['Dolor muscular', 'Cefalea', 'Dolor dental', 'Artritis', 'Fiebre'],
      dosage: '400mg',
      frequency: 'Cada 8 horas',
      duration: 7,
      durationType: 'días',
      administrationRoute: 'oral',
      instructions: 'Tomar con alimentos para reducir irritación gástrica.',
      warnings: 'Contraindicado en úlcera péptica activa. Precaución en pacientes con enfermedad renal.',
    },

    // ANTIBIÓTICOS
    {
      code: 'MED-003',
      name: 'Amoxicilina',
      genericName: 'Amoxicilina',
      category: 'Antibiótico',
      commonDiagnosis: ['Faringitis bacteriana', 'Otitis media', 'Sinusitis', 'Infección urinaria'],
      dosage: '500mg',
      frequency: 'Cada 8 horas',
      duration: 7,
      durationType: 'días',
      administrationRoute: 'oral',
      instructions: 'Completar el tratamiento completo incluso si los síntomas mejoran.',
      warnings: 'Contraindicado en alergia a penicilinas. Puede causar diarrea.',
    },
    {
      code: 'MED-004',
      name: 'Azitromicina',
      genericName: 'Azitromicina',
      category: 'Antibiótico',
      commonDiagnosis: ['Infección respiratoria', 'Faringitis', 'Bronquitis', 'Neumonía leve'],
      dosage: '500mg',
      frequency: 'Una vez al día',
      duration: 3,
      durationType: 'días',
      administrationRoute: 'oral',
      instructions: 'Tomar 1 hora antes o 2 horas después de las comidas.',
      warnings: 'No usar en pacientes con prolongación del intervalo QT.',
    },

    // ANTIHIPERTENSIVOS
    {
      code: 'MED-005',
      name: 'Losartán',
      genericName: 'Losartán',
      category: 'Antihipertensivo',
      commonDiagnosis: ['Hipertensión arterial', 'Protección renal en diabetes'],
      dosage: '50mg',
      frequency: 'Una vez al día',
      duration: 30,
      durationType: 'días',
      administrationRoute: 'oral',
      instructions: 'Tomar a la misma hora cada día. Controlar presión arterial regularmente.',
      warnings: 'Contraindicado en embarazo. Puede causar mareos al inicio del tratamiento.',
    },
    {
      code: 'MED-006',
      name: 'Enalapril',
      genericName: 'Enalapril',
      category: 'Antihipertensivo',
      commonDiagnosis: ['Hipertensión arterial', 'Insuficiencia cardíaca'],
      dosage: '10mg',
      frequency: 'Una vez al día',
      duration: 30,
      durationType: 'días',
      administrationRoute: 'oral',
      instructions: 'Tomar preferiblemente en la mañana.',
      warnings: 'Puede causar tos seca. Contraindicado en embarazo.',
    },

    // ANTIDIABÉTICOS
    {
      code: 'MED-007',
      name: 'Metformina',
      genericName: 'Metformina',
      category: 'Antidiabético',
      commonDiagnosis: ['Diabetes mellitus tipo 2', 'Prediabetes'],
      dosage: '850mg',
      frequency: 'Cada 12 horas con alimentos',
      duration: 30,
      durationType: 'días',
      administrationRoute: 'oral',
      instructions: 'Tomar con las comidas. Monitorear niveles de glucosa.',
      warnings: 'Puede causar malestar gastrointestinal. Suspender antes de procedimientos con contraste.',
    },

    // GASTROPROTECTORES
    {
      code: 'MED-008',
      name: 'Omeprazol',
      genericName: 'Omeprazol',
      category: 'Gastroprotector',
      commonDiagnosis: ['Gastritis', 'Reflujo gastroesofágico', 'Úlcera péptica'],
      dosage: '20mg',
      frequency: 'Una vez al día en ayunas',
      duration: 14,
      durationType: 'días',
      administrationRoute: 'oral',
      instructions: 'Tomar 30 minutos antes del desayuno.',
      warnings: 'No se recomienda uso prolongado sin supervisión médica.',
    },

    // ANTIHISTAMÍNICOS
    {
      code: 'MED-009',
      name: 'Loratadina',
      genericName: 'Loratadina',
      category: 'Antihistamínico',
      commonDiagnosis: ['Rinitis alérgica', 'Urticaria', 'Alergia estacional'],
      dosage: '10mg',
      frequency: 'Una vez al día',
      duration: 7,
      durationType: 'días',
      administrationRoute: 'oral',
      instructions: 'Puede tomarse con o sin alimentos.',
      warnings: 'No produce somnolencia en la mayoría de pacientes.',
    },

    // BRONCODILATADORES
    {
      code: 'MED-010',
      name: 'Salbutamol',
      genericName: 'Salbutamol',
      category: 'Broncodilatador',
      commonDiagnosis: ['Asma', 'EPOC', 'Broncoespasmo'],
      dosage: '100mcg',
      frequency: '2 inhalaciones cada 4-6 horas según necesidad',
      duration: 30,
      durationType: 'días',
      administrationRoute: 'inhalatoria',
      instructions: 'Agitar antes de usar. Enjuagar boca después de la inhalación.',
      warnings: 'Puede causar temblor y taquicardia. No exceder dosis recomendada.',
    },

    // ANTIEMÉTICOS
    {
      code: 'MED-011',
      name: 'Metoclopramida',
      genericName: 'Metoclopramida',
      category: 'Antiemético',
      commonDiagnosis: ['Náuseas', 'Vómito', 'Gastroparesia'],
      dosage: '10mg',
      frequency: 'Cada 8 horas antes de las comidas',
      duration: 5,
      durationType: 'días',
      administrationRoute: 'oral',
      instructions: 'Tomar 30 minutos antes de las comidas.',
      warnings: 'No usar por más de 12 semanas. Puede causar somnolencia.',
    },

    // ESTATINAS
    {
      code: 'MED-012',
      name: 'Atorvastatina',
      genericName: 'Atorvastatina',
      category: 'Hipolipemiante',
      commonDiagnosis: ['Hipercolesterolemia', 'Dislipidemia', 'Prevención cardiovascular'],
      dosage: '20mg',
      frequency: 'Una vez al día en la noche',
      duration: 30,
      durationType: 'días',
      administrationRoute: 'oral',
      instructions: 'Tomar preferiblemente en la noche. Monitorear perfil lipídico.',
      warnings: 'Evitar consumo excesivo de alcohol. Reportar dolor muscular.',
    },
  ];

  for (const template of templates) {
    const existing = await prisma.medicationTemplate.findUnique({
      where: { code: template.code },
    });

    if (!existing) {
      await prisma.medicationTemplate.create({ data: template });
      console.log(`✓ Created: ${template.name} (${template.code})`);
    } else {
      console.log(`- Skipped (already exists): ${template.name}`);
    }
  }

  console.log('\n✅ Seeding completed!');
  console.log(`📊 Total templates: ${templates.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
