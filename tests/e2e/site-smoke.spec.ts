import { expect, test } from '@playwright/test';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
}

test('home page renders key sections without horizontal overflow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /игровые/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /смотреть сборки/i })).toBeVisible();
  await expect(page.locator('#catalog')).toBeVisible();
  await expect(page.locator('#custom')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('admin route renders login surface without horizontal overflow', async ({ page }) => {
  await page.goto('/admin');

  await expect(page.getByPlaceholder(/пароль администратора/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /войти/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
