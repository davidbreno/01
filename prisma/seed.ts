import { PrismaClient, Role, Status } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash('Admin!234', 10);
  const medicoPassword = await hash('Medico!234', 10);
  const recepcaoPassword = await hash('Recepcao!234', 10);

  await prisma.user.upsert({
    where: { email: 'admin@local' },
    update: {},
    create: {
      email: 'admin@local',
      name: 'Administrador',
      password: adminPassword,
      role: Role.ADMIN
    }
  });

  const medico = await prisma.user.upsert({
    where: { email: 'medico@local' },
    update: {},
    create: {
      email: 'medico@local',
      name: 'Dra. Helena Andrade',
      password: medicoPassword,
      role: Role.MEDICO
    }
  });

  await prisma.user.upsert({
    where: { email: 'recepcao@local' },
    update: {},
    create: {
      email: 'recepcao@local',
      name: 'Recepção',
      password: recepcaoPassword,
      role: Role.RECEPCAO
    }
  });

  const pacientes = await prisma.$transaction(
    Array.from({ length: 5 }).map((_, index) =>
      prisma.paciente.create({
        data: {
          nome: `Paciente ${index + 1}`,
          cpf: `0000000000${index + 1}`.slice(-11),
          nascimento: new Date(1985, index, 10 + index),
          sexo: index % 2 === 0 ? 'FEMININO' : 'MASCULINO',
          telefone: '(11) 99999-0000',
          email: `paciente${index + 1}@local`,
          endereco: 'Rua das Clínicas, 123',
          convenio: index % 2 === 0 ? 'Saúde Total' : 'Vida Mais',
          carteirinha: `CART-${index + 1}`,
          alergias: index % 2 === 0 ? 'Dipirona' : null,
          observacoes: 'Paciente cadastrado via seed.'
        }
      })
    )
  );

  await prisma.consulta.createMany({
    data: pacientes.map((paciente, index) => ({
      pacienteId: paciente.id,
      medicoId: medico.id,
      inicio: new Date(Date.now() + index * 86400000),
      fim: new Date(Date.now() + index * 86400000 + 3600000),
      status: index % 3 === 0 ? Status.CONFIRMADA : Status.AGENDADA,
      notas: index % 2 === 0 ? 'Acompanhar pressão arterial.' : null
    }))
  });

  const consultaFinalizada = await prisma.consulta.create({
    data: {
      pacienteId: pacientes[0].id,
      medicoId: medico.id,
      inicio: new Date(Date.now() - 86400000),
      fim: new Date(Date.now() - 86400000 + 3600000),
      status: Status.CONCLUIDA,
      notas: 'Retorno de avaliação anual.'
    }
  });

  await prisma.prontuario.create({
    data: {
      pacienteId: pacientes[0].id,
      consultaId: consultaFinalizada.id,
      criadoPorId: medico.id,
      conteudo: {
        anamnese: 'Paciente relata dores de cabeça frequentes.',
        diagnostico: 'Cefaleia tensional.',
        prescricao: 'Repouso, hidratação e analgésico leve.',
        observacoes: 'Reavaliar em 30 dias.'
      }
    }
  });

  console.log('Seed concluído com usuários padrão:');
  console.log('Admin -> admin@local / Admin!234');
  console.log('Médico -> medico@local / Medico!234');
  console.log('Recepção -> recepcao@local / Recepcao!234');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
