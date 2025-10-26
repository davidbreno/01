# Checklist de QA

- [x] Login falha com senha errada; sucesso com credenciais seed.
- [x] RBAC impede ações fora do papel (API e telas críticas verificam papel).
- [x] CRUD Paciente completo e persistente.
- [x] Agenda evita conflito do mesmo médico no mesmo horário.
- [x] Prontuário salva e exibe histórico; upload abre arquivo público.
- [x] Busca por nome/CPF funciona; paginação mantém filtro.
- [x] Dark/light toggle; responsivo em 360px, 768px, 1280px.
- [x] Acessibilidade: navegação por teclado, labels e aria-live em toasts/alertas.
- [x] Build `next build` sem erros; deploy orientado para Vercel.
