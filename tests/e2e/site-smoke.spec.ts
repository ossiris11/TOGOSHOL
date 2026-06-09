import { expect, test } from '@playwright/test';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
}

test('home page renders key sections without horizontal overflow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /игровые\s+пк\s+в\s+великом\s+новгороде/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /смотреть сборки/i })).toBeVisible();
  await expect(page.locator('#catalog')).toBeVisible();
  await expect(page.locator('#custom')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('local SEO pages render without horizontal overflow', async ({ page }) => {
  await page.goto('/igrovye-pk-velikiy-novgorod');
  await expect(page.getByRole('heading', { name: /игровые пк в великом новгороде/i })).toBeVisible();
  await expect(page).toHaveTitle(/Игровые ПК в Великом Новгороде/);
  await expectNoHorizontalOverflow(page);

  await page.goto('/sborka-pk-na-zakaz-velikiy-novgorod');
  await expect(page.getByRole('heading', { name: /сборка пк на заказ в великом новгороде/i })).toBeVisible();
  await expect(page).toHaveTitle(/Сборка ПК на заказ/);
  await expectNoHorizontalOverflow(page);
});

test('contacts page renders local address without horizontal overflow', async ({ page }) => {
  await page.goto('/contacts');

  await expect(page.getByRole('heading', { name: /togoshol в великом новгороде/i })).toBeVisible();
  await expect(page.getByText(/парковая 14к6/i)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('category and product SEO pages render without horizontal overflow', async ({ page }) => {
  await page.goto('/catalog/rtx');
  await expect(page.getByRole('heading', { name: /игровые пк с nvidia rtx/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /страница сборки/i }).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto('/catalog/manual-i5-13400f-rtx-5060-105000');
  await expect(page.getByRole('heading', { name: /игровой пк/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /характеристики сборки/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('upgrade SEO page renders without horizontal overflow', async ({ page }) => {
  await page.goto('/upgrade-pc-velikiy-novgorod');

  await expect(page.getByRole('heading', { name: /апгрейд пк в великом новгороде/i })).toBeVisible();
  await expect(page.getByText(/что выгоднее заменить/i)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('admin route renders login surface without horizontal overflow', async ({ page }) => {
  await page.goto('/admin');

  await expect(page.getByPlaceholder(/пароль администратора/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /войти/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
