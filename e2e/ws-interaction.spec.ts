import { test, expect, WebSocketRoute } from '@playwright/test';
import { setupMocks } from './lib/setup-mocks';
import { invitesMock } from 'testing/mocks/invites/invites.mock';
import { WsEvents } from '@app/main/providers/ws/ws-events';
import { participantsMock } from 'testing/mocks/participants/participants.mock';
import { alertMessages } from '@app/shared/constants/alert-messages';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import { MessageDto } from '@app/main/data-access/messages/messages.interface';
import { createMessageMock, e2eMessagesMock } from 'testing/mocks/messages/messages.mock';

test('ws-interaction', async ({ page }) => {
  setupMocks(page);

  let socketContainer: WebSocketRoute | null = null;

  await page.routeWebSocket('**/socket.io/**', (ws) => {
    socketContainer = ws;

    ws.send(
      '0' +
        JSON.stringify({
          sid: 'test-session-id',
          upgrades: [],
          pingInterval: 25000,
          pingTimeout: 5000,
        }),
    );

    ws.onMessage((message) => {
      if (message === '40') {
        ws.send('40{"sid":"test-session-id"}');
      }

      if (message === '2') ws.send('3');
    });
  });

  await page.goto('/');
  await expect(page.getByText('Авторизация')).toBeVisible();
  await page.getByLabel('Логин').fill('test3');
  await page.getByLabel('Пароль').fill('12345678');
  await page.getByRole('button', { name: 'Войти' }).click();

  await expect(page.getByTestId('open-userbar-menu-button')).toBeVisible();

  await expect(socketContainer).not.toBeNull();

  const eventData = [
    WsEvents.addInvite,
    {
      id: invitesMock.length,
      sender: participantsMock[participantsMock.length - 1],
      recipient: participantsMock[0],
    },
  ];

  // Получение заявки на добавление в список контактов
  await socketContainer!.send('42' + JSON.stringify(eventData));
  await expect(page.getByText(alertMessages.addInvite)).toBeVisible();
  await expect(page.getByTestId('incoming-invites-count')).toHaveText('1');

  // Добавление в список контактов
  await page.getByTestId('open-userbar-menu-button').click();
  await page.getByRole('menuitem', { name: 'Контакты' }).click();
  await expect(page.getByTestId('invite-card')).toHaveCount(1);
  await page.getByTestId('approve-invite-btn').click();
  await page.getByRole('button', { name: 'Подтвердить' }).click();
  await expect(page.getByTestId('incoming-invites-count')).not.toBeVisible();
  await expect(page.getByTestId('contact-card')).toHaveCount(contactsMock.length + 1);
  await expect(page.getByText(alertMessages.approveInviteSuccess)).toBeVisible();

  await page.waitForTimeout(250);
  await page.keyboard.press('Escape');
  await expect(page.getByText('Контакты')).toBeHidden();

  // Получение нового сообщения
  const message: MessageDto = createMessageMock(Date.now(), participantsMock.length);
  const eventData2 = [WsEvents.addMessage, message];

  if (!e2eMessagesMock[message.contact.id]) {
    e2eMessagesMock[message.contact.id] = [message];
  }

  await socketContainer!.send('42' + JSON.stringify(eventData2));
  await expect(page.getByTestId('contacts-list-item').first()).toContainText(message.text);
  await expect(page.getByTestId('contacts-list-item').first().locator('.no-read-count')).toHaveText(
    '1',
  );

  // Переход на страницу диалога
  await page.getByTestId('contacts-list-item').first().click();

  // Отправка сообщения
  await page
    .getByRole('textbox', { name: 'Введите сообщение' })
    .fill('some new message for dialog 5');

  await page.getByTestId('send-message-btn').click();
  await expect(page.getByTestId('message-card').last().getByText('some new message')).toBeVisible();

  // Обновление статуса сообщения
  await expect(page.getByTestId('message-card').last().getByText('done')).toBeVisible();

  const eventData3 = [
    WsEvents.updateReadStateMessage,
    { id: 123456789, contact: { id: 5 }, isRead: true },
  ];

  await socketContainer!.send('42' + JSON.stringify(eventData3));
  await expect(page.getByTestId('message-card').last().getByText('done_all')).toBeVisible();

  // Удаление контакта
  await page.getByTestId('open-userbar-menu-button').click();
  await page.getByRole('menuitem', { name: 'Контакты' }).click();
  await page.getByTestId('delete-contact-btn').last().click();
  await page.getByRole('button', { name: 'Подтвердить' }).click();
  await expect(page.getByTestId('contacts-list-item')).toHaveCount(contactsMock.length);
  await expect(page.getByText(alertMessages.deleteContactSuccess)).toBeVisible();

  await page.waitForTimeout(500);
});
