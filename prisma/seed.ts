require('dotenv/config');
const { PrismaClient, Role, Status } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash('Admin!234', 10);
  const medicoPassword = await hash('Medico!234', 10);
  const gestorPassword = await hash('11507727607dD@', 10);
  const recepcaoPassword = await hash('Recepcao!234', 10);
  const davidPassword = await hash('3137221629', 10);
  await prisma.user.upsert({
    where: { email: 'david@clinica.com' },
    update: {
      name: 'David Breno',
      password: davidPassword,
      role: Role.ADMIN
    },
    create: {
      email: 'david@clinica.com',
      name: 'David Breno',
      password: davidPassword,
      role: Role.ADMIN
    }
  });

  await prisma.user.upsert({
    where: { email: 'admin@local' },
    update: {
      name: 'Administrador',
      password: adminPassword,
      role: Role.ADMIN
    },
    create: {
      email: 'admin@local',
      name: 'Administrador',
      password: adminPassword,
      role: Role.ADMIN
    }
  });

  const medico = await prisma.user.upsert({
    where: { email: 'medico@local' },
    update: {
      name: 'Dra. Helena Andrade',
      password: medicoPassword,
      role: Role.MEDICO
    },
    create: {
      email: 'medico@local',
      name: 'Dra. Helena Andrade',
      password: medicoPassword,
      role: Role.MEDICO
    }
  });

  await prisma.user.upsert({
    where: { email: 'recepcao@local' },
    update: {
      name: 'Recepcao',
      password: recepcaoPassword,
      role: Role.RECEPCAO
    },
    create: {
      email: 'recepcao@local',
      name: 'Recepcao',
      password: recepcaoPassword,
      role: Role.RECEPCAO
    }
  });

  await prisma.user.upsert({
    where: { email: 'gestor@clinica.com' },
    update: {
      name: 'Gestor',
      password: gestorPassword,
      role: Role.ADMIN
    },
    create: {
      email: 'gestor@clinica.com',
      name: 'Gestor',
      password: gestorPassword,
      role: Role.ADMIN
    }
  });

  const pacientes = await prisma.$transaction(
    Array.from({ length: 5 }).map((_, index: any) =>
      prisma.paciente.create({
        data: {
          nome: `Paciente ${index + 1}`,
          cpf: `0000000000${index + 1}`.slice(-11),
          nascimento: new Date(1985, index, 10 + index),
          sexo: index % 2 === 0 ? 'FEMININO' : 'MASCULINO',
          telefone: '(11) 99999-0000',
          email: `paciente${index + 1}@local`,
          endereco: 'Rua das Clinicas, 123',
          convenio: index % 2 === 0 ? 'Saude Total' : 'Vida Mais',
          carteirinha: `CART-${index + 1}`,
          alergias: index % 2 === 0 ? 'Dipirona' : null,
          observacoes: 'Paciente cadastrado via seed.'
        }
      })
    )
  );

  await prisma.consulta.createMany({
    data: pacientes.map((paciente: any, index: any) => ({
      pacienteId: paciente.id,
      medicoId: medico.id,
      inicio: new Date(Date.now() + index * 86400000),
      fim: new Date(Date.now() + index * 86400000 + 3600000),
      status: index % 3 === 0 ? Status.CONFIRMADA : Status.AGENDADA,
      notas: index % 2 === 0 ? 'Acompanhar pressao arterial.' : null
    }))
  });

  const consultaFinalizada = await prisma.consulta.create({
    data: {
      pacienteId: pacientes[0].id,
      medicoId: medico.id,
      inicio: new Date(Date.now() - 86400000),
      fim: new Date(Date.now() - 86400000 + 3600000),
      status: Status.CONCLUIDA,
      notas: 'Retorno de avaliacao anual.'
    }
  });

  await prisma.prontuario.create({
    data: {
      pacienteId: pacientes[0].id,
      consultaId: consultaFinalizada.id,
      criadoPorId: medico.id,
      conteudo: {
        anamnese: 'Paciente relata dores de cabeca frequentes.',
        diagnostico: 'Cefaleia tensional.',
        prescricao: 'Repouso, hidratacao e analgesico leve.',
        observacoes: 'Reavaliar em 30 dias.'
      }
    }
  });

  const prismaAny = prisma as any;

  const perguntasBase = [
    { pergunta: 'Você faz uso contínuo de medicamentos?', categoria: 'Histórico clínico', ordem: 1 },
    { pergunta: 'Possui alergia a algum medicamento ou material odontológico?', categoria: 'Alergias', ordem: 2 },
    { pergunta: 'Teve cirurgias ou hospitalizações nos últimos 5 anos?', categoria: 'Cirurgias', ordem: 3 },
    { pergunta: 'Sente dores frequentes na articulação temporomandibular?', categoria: 'ATM', ordem: 4 },
    { pergunta: 'Gestantes ou lactantes?', categoria: 'Condições específicas', ordem: 5 }
  ];

  await prismaAny.anamnesePergunta.createMany({ data: perguntasBase, skipDuplicates: true });

  const perguntas = await prismaAny.anamnesePergunta.findMany({ orderBy: { ordem: 'asc' } });
  if (perguntas.length) {
    await prismaAny.anamneseResposta.createMany({
      data: perguntas.slice(0, 3).map((pergunta: any, index: number) => ({
        pacienteId: pacientes[0].id,
        perguntaId: pergunta.id,
        resposta:
          index === 0
            ? 'Utiliza anti-hipertensivo diariamente.'
            : index === 1
              ? 'Alergia conhecida a látex.'
              : 'Nenhuma cirurgia recente.'
      })),
      skipDuplicates: true
    });
  }

  await prismaAny.pacienteDocumento.createMany({
    data: [
      {
        pacienteId: pacientes[0].id,
        titulo: 'Radiografia panorâmica 2024',
        tipo: 'RADIOGRAFIA',
        arquivoUrl: '/uploads/sample-rx.png',
        arquivoNome: 'rx_panorama.png',
        mimeType: 'image/png',
        tamanho: 120394,
        observacoes: 'Verificar evolução óssea em 6 meses.'
      },
      {
        pacienteId: pacientes[1].id,
        titulo: 'Ficha de anamnese assinada',
        tipo: 'PRONTUARIO',
        arquivoUrl: '/uploads/anamnese.pdf',
        arquivoNome: 'anamnese.pdf',
        mimeType: 'application/pdf',
        tamanho: 45012,
        observacoes: null
      }
    ],
    skipDuplicates: true
  });

  await prismaAny.implanteEstoqueItem.createMany({
    data: [
      {
        categoria: 'CMI',
        modelo: 'Cone Morse CMI 3.5',
        tamanho: '11.5mm',
        marca: 'Neodent',
        quantidade: 12,
        imagemUrl: '/uploads/implante-cmi.png'
      },
      {
        categoria: 'HE',
        modelo: 'HE Arcsys 4.3',
        tamanho: '9mm',
        marca: 'Straumann',
        quantidade: 8,
        imagemUrl: '/uploads/implante-he.png'
      },
      {
        categoria: 'HI_TAPA',
        modelo: 'HI Tapa Titanium 3.8',
        tamanho: '13mm',
        marca: 'SIN',
        quantidade: 5,
        imagemUrl: '/uploads/implante-hi.png'
      }
    ],
    skipDuplicates: true
  });

  await prismaAny.materialEstoqueItem.createMany({
    data: [
      {
        nome: 'Resina Filtek Z350 XT',
        categoria: 'Dentística',
        marca: '3M',
        modelo: 'A2E',
        unidade: 'seringa',
        quantidade: 15
      },
      {
        nome: 'Adesivo Single Bond Universal',
        categoria: 'Dentística',
        marca: '3M',
        modelo: 'Universal',
        unidade: 'frasco 5ml',
        quantidade: 10
      },
      {
        nome: 'Luva de procedimento',
        categoria: 'Descartáveis',
        marca: 'Supermax',
        modelo: 'M',
        unidade: 'caixa com 100',
        quantidade: 24
      }
    ],
    skipDuplicates: true
  });

  console.log('Seed concluido com usuarios padrao:');
  console.log('Admin -> admin@local / Admin!234');
  console.log('Medico -> medico@local / Medico!234');
  console.log('Recepcao -> recepcao@local / Recepcao!234');
  console.log('Gestor -> gestor@local / Gestor!234');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
