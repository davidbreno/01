import { Role } from '@prisma/client';
import { can } from '@/lib/rbac';

describe('RBAC permissions', () => {
  it('admin deve ter todas as permissões', () => {
    expect(can(Role.ADMIN, 'patients.read')).toBe(true);
    expect(can(Role.ADMIN, 'consultas.write')).toBe(true);
    expect(can(Role.ADMIN, 'prontuario.write')).toBe(true);
  });

  it('médico não pode gerenciar admin', () => {
    expect(can(Role.MEDICO, 'admin.manage')).toBe(false);
    expect(can(Role.MEDICO, 'prontuario.write')).toBe(true);
  });

  it('recepção não cria prontuário', () => {
    expect(can(Role.RECEPCAO, 'prontuario.write')).toBe(false);
    expect(can(Role.RECEPCAO, 'patients.write')).toBe(true);
  });
});
