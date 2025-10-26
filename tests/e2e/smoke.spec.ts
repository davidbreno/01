import { test, expect } from '@playwright/test';

function formatDateTime(date: Date) {
  const iso = date.toISOString();
  return iso.slice(0, 16);
}

test('@smoke fluxo principal', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('admin@local');
  await page.getByLabel('Senha').fill('Admin!234');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('/dashboard');

  // cria paciente
  await page.goto('/pacientes');
  await page.getByRole('button', { name: 'Novo paciente' }).click();
  await page.getByLabel('Nome completo').fill('Paciente Playwright');
  await page.getByLabel('CPF').fill('98765432100');
  await page.getByLabel('Nascimento').fill('1995-05-20');
  await page.getByLabel('Sexo').selectOption('FEMININO');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Paciente cadastrado com sucesso.')).toBeVisible();

  // agenda consulta
  await page.goto('/consultas');
  await page.getByRole('button', { name: 'Nova consulta' }).click();
  await page.getByLabel('Paciente').selectOption({ label: 'Paciente Playwright' });
  await page.getByLabel('Médico').selectOption({ index: 1 });
  const inicio = new Date(Date.now() + 2 * 3600000);
  const fim = new Date(Date.now() + 3 * 3600000);
  await page.getByLabel('Início').fill(formatDateTime(inicio));
  await page.getByLabel('Fim').fill(formatDateTime(fim));
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Consulta criada.')).toBeVisible();

  // adiciona prontuário
  await page.goto('/pacientes');
  await page.getByRole('link', { name: 'Paciente Playwright' }).first().click();
  await page.getByLabel('Anamnese').fill('Paciente apresenta dores lombares.');
  const filePath = 'tests/fixtures/exame.pdf';
  await page.setInputFiles('#anexos', filePath);
  await page.getByRole('button', { name: 'Salvar registro' }).click();
  await expect(page.getByText('Prontuário registrado com sucesso.')).toBeVisible();
});
