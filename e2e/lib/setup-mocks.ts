import { Page } from '@playwright/test';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import { e2eMessagesMock, messagesMockChunk } from 'testing/mocks/messages/messages.mock';
import { participantsMock } from 'testing/mocks/participants/participants.mock';
import { userMock } from 'testing/mocks/user/user.mock';

export const setupMocks = async (page: Page) => {
  await page.route('**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    await route.continue();
  });

  await page.route('**/auth', async (route) => {
    await route.fulfill({ json: userMock });
  });

  await page.route('**/user', async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({ json: undefined });
      return;
    }

    await route.fulfill({ status: 401 });
  });

  await page.route('**/contacts', async (route) => {
    await route.fulfill({ json: contactsMock });
  });

  await page.route('**/contacts/**', async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({ json: undefined });
    }
  });

  await page.route('**/invites', async (route) => {
    await route.fulfill({ json: [] });
  });

  await page.route('**/invites/approve/**', async (route) => {
    await route.fulfill({
      json: {
        id: participantsMock.length,
        noReadCount: 0,
        online: false,
        lastMessage: null,
        participants: [participantsMock[participantsMock.length - 1], participantsMock[0]],
      },
    });
  });

  await page.route('**/messages/**', async (route) => {
    const start = +(new URL(route.request().url()).searchParams.get('start') ?? 0);

    const segments = new URL(page.url()).pathname.split('/');
    const contactId = +(segments[segments.length - 1] ?? 0);

    await route.fulfill({
      json: e2eMessagesMock[contactId].slice(
        start,
        start + (start === 100 ? messagesMockChunk - 20 : messagesMockChunk),
      ),
    });
  });

  await page.route('**/messages', async (route) => {
    if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
      await route.fulfill({
        status: 201,
        json: {
          id: 123456789,
        },
      });
      return;
    }
  });
};
