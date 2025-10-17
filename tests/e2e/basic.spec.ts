import { test, expect } from '@playwright/test';

test('fluxo principal', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[type="email"]', 'david@example.com');
  await page.fill('input[type="password"]', 'senha123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');
  await expect(page.locator('text=Saldo semanal')).toBeVisible();
});
