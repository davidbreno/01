export { default } from 'next-auth/middleware';

export const config = {
  // Exclui rotas públicas de autenticação para evitar loops de redirecionamento
  matcher: [
    '/((?!auth|api/auth|login|reset|_next/static|_next/image|favicon.ico).*)'
  ]
};
