import { expect, test } from '@playwright/test';
import { setupMocks } from './lib/setup-mocks';
import { userMock } from 'testing/mocks/user/user.mock';

test('auth', async ({ page }) => {
  setupMocks(page);

  await page.route('**/auth', async (route) => {
    await new Promise((r) => setTimeout(() => r(null), 500));
    await route.continue();
  });

  await page.goto('/');

  await expect(page.getByText('Авторизация')).toBeVisible();

  const loginField = page.getByLabel('Логин');
  const passwordField = page.getByLabel('Пароль');
  const loginBtn = page.getByRole('button', { name: 'Войти' });

  await expect(loginBtn).toBeDisabled();

  await loginField.fill('sgreen');
  await passwordField.fill('12345678');
  await loginBtn.click();

  await expect(page.getByTestId('loader')).toBeVisible();

  await expect(page.getByText(`${userMock.firstName} ${userMock.lastName}`)).toBeVisible();
});
