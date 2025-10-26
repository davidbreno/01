import { POST } from '@/app/api/pacientes/route';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';
import { requireAbility } from '@/lib/auth-helpers';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    paciente: {
      create: jest.fn()
    }
  }
}));

jest.mock('@/lib/audit', () => ({
  writeAuditLog: jest.fn()
}));

jest.mock('@/lib/auth-helpers', () => ({
  requireAbility: jest.fn(() => Promise.resolve({ user: { id: 'admin', role: 'ADMIN' } }))
}));

describe('POST /api/pacientes', () => {
  it('cria paciente com sucesso', async () => {
    (prisma.paciente.create as jest.Mock).mockResolvedValue({ id: '1', nome: 'Paciente Teste' });
    const request = new Request('http://localhost/api/pacientes', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Paciente Teste',
        cpf: '12345678901',
        nascimento: '1990-01-01',
        sexo: 'MASCULINO'
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(prisma.paciente.create).toHaveBeenCalled();
    expect(writeAuditLog).toHaveBeenCalled();
  });
});
