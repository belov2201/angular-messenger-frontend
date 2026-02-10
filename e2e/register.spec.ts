import { expect, test } from '@playwright/test';

test('register form', async ({ page }) => {
  await page.route('**/user', async (route) => {
    await new Promise((r) => setTimeout(() => r(null), 500));
    await route.fulfill();
  });

  await page.goto('/register');

  await expect(page.getByText('Регистрация')).toBeVisible();

  const loginField = page.getByLabel('Логин');
  const passwordField = page.getByRole('textbox', { name: 'Пароль', exact: true });
  const repeatPasswordField = page.getByLabel('Повторите пароль');
  const firstNameField = page.getByLabel('Имя');
  const lastNameField = page.getByLabel('Фамилия');
  const registerBtn = page.getByRole('button', { name: 'Зарегистрироваться' });

  await expect(registerBtn).toBeDisabled();

  await loginField.fill('test123//');
  await passwordField.fill('12345678');
  await expect(page.getByText('Введенное значение содержит недопустимые символы')).toBeVisible();
  await loginField.fill('test123');
  await repeatPasswordField.fill('123456789');

  await expect(
    page.getByText('Введенное значение содержит недопустимые символы'),
  ).not.toBeVisible();

  await firstNameField.fill('Firstname');

  await expect(page.getByText('Введенные пароли не совпадают')).toBeVisible();

  await repeatPasswordField.fill('12345678');
  await expect(page.getByText('Введенные пароли не совпадают')).not.toBeVisible();
  await lastNameField.fill('Lastname');

  await expect(registerBtn).not.toBeDisabled();
});
