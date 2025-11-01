require('dotenv/config');
const { PrismaClient, Role, Status, ImplantCategory, DocumentType } = require('@prisma/client');
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

  const perguntas = [
    { pergunta: 'Sente dor ou sensibilidade em algum dente atualmente?', categoria: 'Sintomas' },
    { pergunta: 'Realizou cirurgias recentes ou tratamentos médicos em andamento?', categoria: 'Histórico' },
    { pergunta: 'Utiliza algum medicamento contínuo?', categoria: 'Histórico' },
    { pergunta: 'Apresenta alergia a algum medicamento ou material odontológico?', categoria: 'Alergias' },
    { pergunta: 'Há histórico de doenças sistêmicas (diabetes, cardiopatias)?', categoria: 'Condições sistêmicas' }
  ];

  await prisma.anamneseQuestion.createMany({ data: perguntas });

  await prisma.implantItem.createMany({
    data: [
      {
        nome: 'Implante Prime 3.5',
        categoria: ImplantCategory.CMI,
        modelo: 'Prime',
        tamanho: '3.5 x 11.5 mm',
        marca: 'Neodent',
        quantidade: 8,
        descricao: 'Implante cônico com conexão Cone Morse.'
      },
      {
        nome: 'Implante Drive HE 4.0',
        categoria: ImplantCategory.HE,
        modelo: 'Drive',
        tamanho: '4.0 x 10 mm',
        marca: 'S.I.N',
        quantidade: 12,
        descricao: 'Indicado para regiões posteriores com alto torque.'
      },
      {
        nome: 'Implante HI TAPA 3.75',
        categoria: ImplantCategory.HI_TAPA,
        modelo: 'HI Tapa',
        tamanho: '3.75 x 11 mm',
        marca: 'ImplantDirect',
        quantidade: 6,
        descricao: 'Acabamento anodizado para gengiva delicada.'
      }
    ]
  });

  await prisma.materialItem.createMany({
    data: [
      { nome: 'Anestésico Articaína 4%', marca: 'DFL', unidade: 'tubetes', quantidade: 48 },
      { nome: 'Luvas de Procedimento M', marca: 'Supermax', unidade: 'caixas', quantidade: 10 },
      { nome: 'Resina Filtek Z350 XT A2', marca: '3M', unidade: 'seringas', quantidade: 5 }
    ]
  });

  await prisma.documentRecord.createMany({
    data: [
      {
        titulo: 'Receita antibiótico Paciente 1',
        tipo: DocumentType.RECEITA,
        arquivoUrl: '/uploads/exemplo-receita.pdf',
        arquivoMime: 'application/pdf',
        pacienteId: pacientes[0].id,
        notas: 'Administrar de 8 em 8 horas por 7 dias.'
      },
      {
        titulo: 'Radiografia panorâmica Paciente 2',
        tipo: DocumentType.RADIOGRAFIA,
        arquivoUrl: '/uploads/exemplo-rx.jpg',
        arquivoMime: 'image/jpeg',
        pacienteId: pacientes[1].id,
        notas: 'Avaliar reabsorção óssea.'
      },
      {
        titulo: 'Política LGPD da clínica',
        tipo: DocumentType.DOCUMENTO_PESSOAL,
        arquivoUrl: '/uploads/politica-lgpd.pdf',
        arquivoMime: 'application/pdf'
      }
    ]
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
