import { PrismaClient, CategoryKind, TransactionType, BillStatus, ExportStatus, ExportFormat, ExportType } from '@prisma/client';
import { addDays, subDays } from 'date-fns';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('senha123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'david@example.com' },
    update: {},
    create: {
      email: 'david@example.com',
      name: 'David',
      hashedPassword: password
    }
  });

  const categories = await Promise.all(
    [
      { name: 'Salário', kind: CategoryKind.IN },
      { name: 'Investimentos', kind: CategoryKind.IN },
      { name: 'Alimentação', kind: CategoryKind.OUT },
      { name: 'Saúde', kind: CategoryKind.OUT },
      { name: 'Lazer', kind: CategoryKind.OUT }
    ].map((category) =>
      prisma.category.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: category.name
          }
        },
        update: {},
        create: {
          userId: user.id,
          name: category.name,
          kind: category.kind
        }
      })
    )
  );

  const inCategory = categories.find((c) => c.kind === CategoryKind.IN) ?? categories[0];
  const outCategory = categories.find((c) => c.kind === CategoryKind.OUT) ?? categories[2];

  const today = new Date();

  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        type: TransactionType.IN,
        amount: 8500,
        categoryId: inCategory.id,
        date: subDays(today, 10),
        note: 'Salário mensal'
      },
      {
        userId: user.id,
        type: TransactionType.OUT,
        amount: 1200,
        categoryId: outCategory.id,
        date: subDays(today, 8),
        note: 'Supermercado'
      },
      {
        userId: user.id,
        type: TransactionType.OUT,
        amount: 300,
        categoryId: outCategory.id,
        date: subDays(today, 3),
        note: 'Farmácia'
      },
      {
        userId: user.id,
        type: TransactionType.IN,
        amount: 1500,
        categoryId: inCategory.id,
        date: subDays(today, 2),
        note: 'Freelancer'
      }
    ]
  });

  await prisma.bill.createMany({
    data: [
      {
        userId: user.id,
        title: 'Plano de saúde',
        amount: 450,
        dueDate: addDays(today, 5),
        status: BillStatus.PENDING
      },
      {
        userId: user.id,
        title: 'Academia',
        amount: 180,
        dueDate: addDays(today, 2),
        status: BillStatus.PENDING
      },
      {
        userId: user.id,
        title: 'Cartão de crédito',
        amount: 3200,
        dueDate: subDays(today, 4),
        status: BillStatus.PAID
      }
    ]
  });

  const weightEntries = Array.from({ length: 6 }).map((_, index) => ({
    userId: user.id,
    date: subDays(today, index * 7),
    weightKg: 88 - index * 0.5
  }));

  await prisma.weightLog.createMany({ data: weightEntries });

  const waterEntries = Array.from({ length: 7 }).flatMap((_, index) => {
    const date = subDays(today, index);
    return [
      { userId: user.id, date, ml: 500 },
      { userId: user.id, date, ml: 1000 },
      { userId: user.id, date, ml: 750 }
    ];
  });

  await prisma.waterLog.createMany({ data: waterEntries });

  const cycle = await prisma.steroidCycle.create({
    data: {
      userId: user.id,
      name: 'Ciclo Cutting 2024',
      startDate: subDays(today, 14),
      endDate: addDays(today, 70),
      notes: 'Monitorar marcadores hepáticos',
      doses: {
        create: [
          {
            compound: 'Testosterona Enantato',
            dosageMgPerWeek: 500,
            scheduleJson: { monday: '250mg', thursday: '250mg' }
          },
          {
            compound: 'Oxandrolona',
            dosageMgPerWeek: 210,
            scheduleJson: { daily: '30mg' }
          }
        ]
      }
    }
  });

  const exam = await prisma.examFile.create({
    data: {
      userId: user.id,
      filename: 'exame-labs.pdf',
      mimetype: 'application/pdf',
      bytes: 1024,
      storagePath: 'uploads/exame-labs.pdf',
      textExtracted: `Hemoglobina: 16 g/dL\nHematócrito: 49 %\nLeucócitos: 6500 /mm3\nGlicemia: 70 mg/dL\nTGO/AST: 42 U/L\nTGP/ALT: 45 U/L\nCreatinina: 1.0 mg/dL\nColesterol Total: 210 mg/dL\nHDL: 45 mg/dL\nLDL: 150 mg/dL\nTriglicerídeos: 180 mg/dL\nTSH: 2.4 uUI/mL`
    }
  });

  await prisma.examResult.createMany({
    data: [
      {
        examFileId: exam.id,
        marker: 'Hemoglobina',
        value: 16,
        unit: 'g/dL',
        referenceMin: 13.5,
        referenceMax: 17.5,
        isOutOfRange: false
      },
      {
        examFileId: exam.id,
        marker: 'LDL',
        value: 150,
        unit: 'mg/dL',
        referenceMin: 0,
        referenceMax: 129,
        isOutOfRange: true
      }
    ]
  });

  await prisma.exportJob.create({
    data: {
      userId: user.id,
      type: ExportType.FINANCE,
      format: ExportFormat.CSV,
      status: ExportStatus.COMPLETED,
      filePath: 'exports/financeiro.csv'
    }
  });

  await prisma.examFile.update({
    where: { id: exam.id },
    data: {
      cycles: {
        connect: { id: cycle.id }
      }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
