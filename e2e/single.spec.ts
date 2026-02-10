import { test, expect, Page } from '@playwright/test';
import { setupMocks } from './lib/setup-mocks';
import { alertMessages } from '@app/shared/constants/alert-messages';
import { userMock } from 'testing/mocks/user/user.mock';
import { messagesMockChunk } from 'testing/mocks/messages/messages.mock';

const timeoutBeforeClose = 2000;

const getMessageListProperty = async (page: Page, property: string) => {
  return await page.$eval(
    '#messages-list',
    (el, property) => el[property as keyof typeof el],
    property,
  );
};

// Функционал авторизации пользователя перед каждым тестом
test.beforeEach(async ({ page }) => {
  setupMocks(page);

  await page.goto('/');
  await expect(page.getByText('Авторизация')).toBeVisible();
  await page.getByLabel('Логин').fill('test3');
  await page.getByLabel('Пароль').fill('12345678');
  await page.getByRole('button', { name: 'Войти' }).click();
});

test('auth', async ({ page }) => {
  // Проверка успешной авторизации
  await expect(page.getByTestId('open-userbar-menu-button')).toBeVisible();
});

test('edit profile', async ({ page }) => {
  // Переход в модальное окно редактирования информации о пользователе
  await page.getByTestId('open-userbar-menu-button').click();
  await page.getByRole('menuitem', { name: 'Профиль' }).click();
  await expect(page.getByRole('button', { name: 'Редактировать' })).toBeDisabled();

  // Ввод некорректного значения имени пользователя
  await page.getByRole('textbox', { name: 'Имя' }).fill(userMock.firstName + '123');
  await page.getByRole('textbox', { name: 'Имя' }).press('Tab');
  await expect(page.getByText('Введенное значение содержит недопустимые символы')).toBeVisible();

  // Вовращение изначального значения и проверка свойства disabled у кнопки редактировать
  await page.getByRole('textbox', { name: 'Имя' }).fill(userMock.firstName);
  await expect(page.getByRole('button', { name: 'Редактировать' })).toBeDisabled();

  // Изменение значения на корректное для редактирования имени и отправка запроса
  await page.getByRole('textbox', { name: 'Имя' }).fill(userMock.firstName + 'edit');
  await expect(page.getByRole('button', { name: 'Редактировать' })).not.toBeDisabled();
  await page.getByRole('button', { name: 'Редактировать' }).click();
  await expect(page.getByText(alertMessages.editUserDataSuccess)).toBeVisible();
  await expect(page.getByText(userMock.firstName + 'edit ' + userMock.lastName)).toHaveCount(2);

  // Возврат изначального имени пользователя
  await expect(page.getByRole('button', { name: 'Редактировать' })).toBeDisabled();
  await page.getByRole('textbox', { name: 'Имя' }).fill(userMock.firstName);
  await expect(page.getByRole('button', { name: 'Редактировать' })).not.toBeDisabled();
  await page.getByRole('button', { name: 'Редактировать' }).click();
  await expect(page.getByText(`${userMock.firstName} ${userMock.lastName}`)).toHaveCount(2);
});

test('send, edit, delete message', async ({ page }) => {
  // Переход на страницу диалога с пользователем
  await page.getByTestId('contacts-list-item').first().click();

  await expect(page.getByTestId('message-card')).toHaveCount(messagesMockChunk);

  await expect(page.getByTestId('send-message-btn').getByRole('button')).toHaveAttribute(
    'disabled',
  );

  // Отправка сообщения пользователю
  await page.getByRole('textbox', { name: 'Введите сообщение' }).fill('some new message');
  await expect(page.getByTestId('send-message-btn')).not.toBeDisabled();
  await page.getByTestId('send-message-btn').click();
  await expect(page.getByTestId('message-card').last().getByText('some new message')).toBeVisible();
  const scrollTop = await getMessageListProperty(page, 'scrollTop');
  const clientHeight = await getMessageListProperty(page, 'clientHeight');
  const scrollHeight = await getMessageListProperty(page, 'scrollHeight');

  // Проверка автоматической прокрутки страницы вниз при добавлении нового сообщения, за исключением случая, когда страница уже проскроллена вверх на какое-то значение
  await expect(scrollTop).toBe(scrollHeight - clientHeight);

  // Редактирование сообщения пользователя
  await page.getByTestId('message-card').last().click();
  await expect(page.getByRole('menuitem', { name: 'Редактировать' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Редактировать' }).click();

  // Проверка изменения введенного значения в поле, при установке редактируемого сообщения
  // и появления кнопок для отмены и подтверждения редактирования
  await expect(page.getByPlaceholder('Введите сообщение')).toHaveValue('some new message');

  await expect(page.getByTestId('edit-message-btn').getByRole('button')).toHaveAttribute(
    'disabled',
  );

  await expect(page.getByTestId('reset-edit-message-btn').getByRole('button')).not.toHaveAttribute(
    'disabled',
  );

  // Ввод нового значения редактируемого сообщения и подтверждение
  await page.getByRole('textbox', { name: 'Введите сообщение' }).fill('some new message edit');
  await page.getByTestId('edit-message-btn').click();

  // Проверка изменения текста редактируемого сообщения в списке
  await expect(
    page.getByTestId('message-card').last().getByText('some new message edit'),
  ).toBeVisible();

  await expect(page.getByText(alertMessages.messageEditSuccess)).toBeVisible();

  const prevCountMessageCard = await page.getByTestId('message-card').count();

  // Удаление сообщения
  await page.getByTestId('message-card').last().click();
  await expect(page.getByRole('menuitem', { name: 'Удалить' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Удалить' }).click();
  await page.getByRole('button', { name: 'Подтвердить' }).click();
  await expect(page.getByText(alertMessages.messageDeleteSuccess)).toBeVisible();

  // Проверка изменения количества сообщений в списке
  await expect(page.getByTestId('message-card')).toHaveCount(prevCountMessageCard - 1);
  await page.waitForTimeout(timeoutBeforeClose);
});

test('save dialog state switch edit message and change contact id', async ({ page }) => {
  // Проверка загрузки списка контактов для данного тестового пользователя
  await expect(page.getByTestId('contacts-list-item').first()).toBeVisible();
  await expect(page.getByTestId('contacts-list-item').last()).toBeVisible();

  // Переход на страницу диалога с 1 контактом и ввод сообщения
  await page.getByTestId('contacts-list-item').first().click();

  await expect(page.getByTestId('send-message-btn').getByRole('button')).toHaveAttribute(
    'disabled',
  );

  await page.getByPlaceholder('Введите сообщение').fill('some new message for first contact');

  // Переход на страницу диалога с последним контактом, проверка текущего значения поля ввода сообщения
  // ввод нового сообщения
  await page.getByTestId('contacts-list-item').last().click();
  await expect(page.getByPlaceholder('Введите сообщение')).toHaveValue('');
  await page.getByPlaceholder('Введите сообщение').fill('some new message for last contact');

  // Возврат к 1 контакту и проверка значения текстового поля, должно отображаться
  // значение, введенное в этом диалоге раннее
  await page.getByTestId('contacts-list-item').first().click();
  await expect(page.getByPlaceholder('Введите сообщение')).toHaveValue(
    'some new message for first contact',
  );

  // Установка редактируемого сообщения в диалоге с пользователем 4
  await page.getByTestId('message-card').locator('.bg-primary-500').last().click();
  await expect(page.getByRole('menuitem', { name: 'Редактировать' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Редактировать' }).click();

  await expect(page.getByPlaceholder('Введите сообщение')).toHaveValue(
    'some new message for first contact',
  );

  await page.getByRole('textbox', { name: 'Введите сообщение' }).fill('some new message edit');
  await expect(page.getByTestId('edit-message-btn').getByRole('button')).not.toHaveAttribute(
    'disabled',
  );

  // Переход на страницу диалога с пользователем 5 и проверка состояния поля ввода
  await page.getByTestId('contacts-list-item').last().click();

  await expect(page.getByPlaceholder('Введите сообщение')).toHaveValue(
    'some new message for last contact',
  );

  // Возврат к 1 контакту
  await page.getByTestId('contacts-list-item').first().click();
  await expect(page.getByTestId('edit-message-btn').getByRole('button')).not.toHaveAttribute(
    'disabled',
  );

  // Проверка сохраненного состояния диалога
  await expect(page.getByPlaceholder('Введите сообщение')).toHaveValue('some new message edit');

  // Отмена редактирования и проверка состояния поля ввода
  await page.getByTestId('reset-edit-message-btn').click();
  await expect(page.getByPlaceholder('Введите сообщение')).toHaveValue(
    'some new message for first contact',
  );

  await page.waitForTimeout(timeoutBeforeClose);
});

test('load messages and uploading messages by scrolling', async ({ page }) => {
  // Переход на страницу диалога с пользователем и ожидание получения сообщений (в данный момент они приходят по 50 за запрос)
  await expect(page.getByTestId('contacts-list-item').first()).toBeVisible();
  await page.getByTestId('contacts-list-item').first().click();
  await expect(page.getByTestId('message-card')).toHaveCount(50);

  // Проверка автоматического скролла страницы вниз при первоначальном получении сообщений
  await expect(
    (await getMessageListProperty(page, 'scrollHeight')) -
      (await getMessageListProperty(page, 'clientHeight')) -
      (await getMessageListProperty(page, 'scrollTop')),
  ).toBeLessThanOrEqual(1);

  const prevScrollHeight = await getMessageListProperty(page, 'scrollHeight');

  // Проверка функционала автоматической подгрузки сообщений пользователей при скролле страницы вверх
  await page.getByTestId('message-card').first().scrollIntoViewIfNeeded();

  await expect(page.getByTestId('message-card')).toHaveCount(messagesMockChunk * 2);

  const scrollHeight = await getMessageListProperty(page, 'scrollHeight');
  const scrollTop = await getMessageListProperty(page, 'scrollTop');

  // Проверка положения скролла после подгрузки сообщений
  await expect(scrollTop).toBe(scrollHeight - (prevScrollHeight || 0));

  // Проверка функционала для случая, когда все сообщения пользователей загружены
  await page.getByTestId('message-card').first().scrollIntoViewIfNeeded();
  await expect(page.getByTestId('message-card')).toHaveCount(messagesMockChunk * 3 - 20);
  await page.getByTestId('message-card').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(10);
  expect(await getMessageListProperty(page, 'scrollTop')).toBe(0);

  await page.waitForTimeout(timeoutBeforeClose);
});
