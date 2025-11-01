import { getServerSession } from 'next-auth';
import type { Ability } from './rbac';
import { can } from './rbac';
import { authOptions } from './auth';

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const error = new Error('Não autenticado');
    error.name = 'UnauthorizedError';
    throw error;
  }
  return session;
}

export async function requireAbility(ability: Ability) {
  const session = await requireSession();
  if (!can(session.user.role, ability)) {
    const error = new Error('Acesso negado');
    error.name = 'ForbiddenError';
    throw error;
  }
  return session;
}

export async function requireAnyAbility(abilities: Ability[]) {
  const session = await requireSession();
  if (!abilities.some((ability) => can(session.user.role, ability))) {
    const error = new Error('Acesso negado');
    error.name = 'ForbiddenError';
    throw error;
  }
  return session;
}
