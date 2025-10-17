# Dashboard Interativo — Versão Estática

Este diretório contém a entrega em HTML, CSS e JavaScript puro do **Dashboard Interativo | Finanças & Saúde**.

## Estrutura
- `index.html` — marcação do dashboard, sidebar colapsável e seções SPA.
- `styles.css` — temas dark/light, gradientes neon, layout responsivo e componentes customizados.
- `app.js` — lógica para gráficos Chart.js, CRUD com `localStorage`, calendário, exportações e preferências.

## Pré-requisitos
Nenhuma compilação é necessária. Basta abrir o `index.html` em um navegador moderno com acesso à internet para carregar os CDNs do Chart.js e Day.js.

## Desenvolvimento
1. Abra o arquivo `index.html` em um servidor local (por exemplo, `npx serve .` ou a extensão "Live Server" do VSCode).
2. As alterações em CSS/JS são refletidas automaticamente após recarregar a página.

## Testes manuais sugeridos
- Validar os fluxos CRUD em todas as seções (transações, contas, peso, água, ciclo e exames).
- Confirmar persistência após recarregar a página.
- Verificar exportação/importação de dados, alternância de tema/fonte e responsividade (desktop/tablet/mobile).

## Observações
- Os dados iniciais são preenchidos automaticamente via seeds para demonstrar o layout.
- As importações de exames devem seguir o formato `nome;valor;unidade;ref_min;ref_max`.
- O aviso legal em "Exames" é obrigatório: “Este recurso é informativo e **não** substitui avaliação médica.”
