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
