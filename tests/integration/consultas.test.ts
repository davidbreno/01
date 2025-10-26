import { POST } from '@/app/api/consultas/route';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';
import { writeAuditLog } from '@/lib/audit';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    consulta: {
      findFirst: jest.fn(),
      create: jest.fn()
    }
  }
}));

jest.mock('@/lib/auth-helpers', () => ({
  requireAbility: jest.fn(() => Promise.resolve({ user: { id: 'admin', role: 'ADMIN' } }))
}));

jest.mock('@/lib/audit', () => ({
  writeAuditLog: jest.fn()
}));

describe('POST /api/consultas', () => {
  afterEach(() => {
    (prisma.consulta.findFirst as jest.Mock).mockReset();
    (prisma.consulta.create as jest.Mock).mockReset();
  });

  it('bloqueia conflito de agenda', async () => {
    (prisma.consulta.findFirst as jest.Mock).mockResolvedValue({ id: 'conflict' });
    const request = new Request('http://localhost/api/consultas', {
      method: 'POST',
      body: JSON.stringify({
        pacienteId: 'paciente',
        medicoId: 'medico',
        inicio: new Date().toISOString(),
        fim: new Date(Date.now() + 3600000).toISOString(),
        status: 'AGENDADA'
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
  });

  it('cria consulta quando não há conflito', async () => {
    (prisma.consulta.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.consulta.create as jest.Mock).mockResolvedValue({ id: 'nova' });
    const request = new Request('http://localhost/api/consultas', {
      method: 'POST',
      body: JSON.stringify({
        pacienteId: 'paciente',
        medicoId: 'medico',
        inicio: new Date().toISOString(),
        fim: new Date(Date.now() + 3600000).toISOString(),
        status: 'AGENDADA'
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(prisma.consulta.create).toHaveBeenCalled();
  });
});
