import { Role } from '@prisma/client';

export type Ability = 'patients.read' | 'patients.write' | 'consultas.read' | 'consultas.write' | 'prontuario.write' | 'admin.manage';

const roleMap: Record<Role, Ability[]> = {
  [Role.ADMIN]: ['patients.read', 'patients.write', 'consultas.read', 'consultas.write', 'prontuario.write', 'admin.manage'],
  [Role.MEDICO]: ['patients.read', 'consultas.read', 'consultas.write', 'prontuario.write'],
  [Role.RECEPCAO]: ['patients.read', 'patients.write', 'consultas.read', 'consultas.write']
};

export function can(role: Role, ability: Ability) {
  return roleMap[role]?.includes(ability) ?? false;
}

export function protect(role: Role | undefined, ability: Ability) {
  if (!role || !can(role, ability)) {
    const error = new Error('Acesso negado');
    error.name = 'ForbiddenError';
    throw error;
  }
}

export function allowedRolesFor(ability: Ability): Role[] {
  return (Object.keys(roleMap) as Role[]).filter((role) => can(role, ability));
}
