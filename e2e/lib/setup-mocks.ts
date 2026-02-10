import { Page } from '@playwright/test';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import { messagesMock, messagesMockChunk } from 'testing/mocks/messages/messages.mock';
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

  await page.route('**/messages/**', async (route) => {
    const start = +(new URL(route.request().url()).searchParams.get('start') ?? 0);

    await route.fulfill({
      json: messagesMock.slice(
        start,
        start + (start === 100 ? messagesMockChunk - 20 : messagesMockChunk),
      ),
    });
  });

  await page.route('**/messages', async (route) => {
    if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
      await route.fulfill({ status: 201 });
      return;
    }
  });
};
