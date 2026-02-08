import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/angular';
import { MainComponent } from './main.component';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import { userMock } from 'testing/mocks/user/user.mock';
import { messagesMock, messagesMockChunk } from 'testing/mocks/messages/messages.mock';
import { TestBed } from '@angular/core/testing';
import { MessagesService } from './data-access/messages/messages.service';
import { getSharedProviders } from 'testing/get-shared-providers';
import { provideRouter } from '@angular/router';
import { mainRoutes } from './main.routes';
import { ConfirmDialogComponent } from '@app/shared/ui/confirm-dialog/confirm-dialog.component';
import userEvent from '@testing-library/user-event';

type NavigateCb = (
  elementOrPath: string | Element,
  basePath?: string | undefined,
) => Promise<boolean>;

describe('MainComponent', () => {
  let navigateByUrl: NavigateCb;

  beforeEach(async () => {
    const { navigate } = await render(
      `
      <app-confirm-dialog />
      <div class="h-230 overflow-hidden flex">
        <app-main />
      </div>`,
      {
        providers: [...getSharedProviders(), provideRouter(mainRoutes)],
        imports: [MainComponent, ConfirmDialogComponent],
      },
    );

    navigateByUrl = navigate;
  });

  it('should create', async () => {
    expect(screen.getAllByTestId('contacts-list-item').length).toBe(contactsMock.length);
    expect(screen.getByText(userMock.firstName + ' ' + userMock.lastName)).toBeInTheDocument();
  });

  it('show messages list', async () => {
    await navigateByUrl('/dialog/0');
    expect(screen.getAllByTestId('message-card').length).toBe(messagesMockChunk);
  });

  it('delete message', async () => {
    const messagesService = TestBed.inject(MessagesService);

    await navigateByUrl('/dialog/0');

    const messageCards = screen.getAllByTestId('message-card');

    await userEvent.click(messageCards[messageCards.length - 2]);
    expect(screen.getByText('Удалить')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Удалить'));

    await waitForElementToBeRemoved(() => screen.queryByText('Удалить'));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Отменить' })).toBeInTheDocument(),
    );

    expect(screen.getByRole('button', { name: 'Подтвердить' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Отменить' }));
    expect(screen.queryByRole('button', { name: 'Подтвердить' })).not.toBeInTheDocument();

    await userEvent.click(messageCards[messagesMockChunk - 2]);
    await userEvent.click(screen.getByText('Удалить'));

    await waitForElementToBeRemoved(() => screen.queryByText('Удалить'));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Подтвердить' })).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));

    expect(messagesService.delete).toHaveBeenCalledOnceWith({
      id: messagesMock[messagesMockChunk - 2].id,
    });

    expect(screen.getAllByTestId('message-card').length).toBe(messagesMockChunk - 1);
  });

  it('edit message', async () => {
    const messagesService = TestBed.inject(MessagesService);
    await navigateByUrl('/dialog/0');

    expect(screen.getByTestId('send-message-btn').querySelector('button')).toHaveAttribute(
      'disabled',
    );

    const messageCards = screen.getAllByTestId('message-card');

    await userEvent.click(messageCards[messagesMockChunk - 2]);
    expect(screen.getByText('Редактировать')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Редактировать'));
    await waitForElementToBeRemoved(() => screen.queryByText('Редактировать'));

    expect(screen.getByPlaceholderText<HTMLInputElement>('Введите сообщение').value).toBe(
      messagesMock[messagesMockChunk - 2].text,
    );

    expect(screen.getByTestId('edit-message-btn').querySelector('button')).toHaveAttribute(
      'disabled',
    );

    expect(
      screen.getByTestId('reset-edit-message-btn').querySelector('button'),
    ).not.toHaveAttribute('disabled');

    await userEvent.click(screen.getByTestId('reset-edit-message-btn'));
    expect(screen.queryByTestId('reset-edit-message-btn')).not.toBeInTheDocument();

    await userEvent.click(messageCards[messagesMockChunk - 2]);
    expect(screen.getByText('Редактировать')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Редактировать'));
    await waitForElementToBeRemoved(() => screen.queryByText('Редактировать'));

    expect(screen.getByPlaceholderText<HTMLInputElement>('Введите сообщение').value).toBe(
      messagesMock[messagesMockChunk - 2].text,
    );

    await userEvent.type(
      screen.getByPlaceholderText<HTMLInputElement>('Введите сообщение'),
      ' edit',
    );

    expect(screen.getByPlaceholderText<HTMLInputElement>('Введите сообщение').value).toBe(
      messagesMock[messagesMockChunk - 2].text + ' edit',
    );

    expect(screen.getByTestId('edit-message-btn').querySelector('button')).not.toHaveAttribute(
      'disabled',
    );

    await userEvent.click(screen.getByTestId('edit-message-btn'));

    expect(messagesService.edit).toHaveBeenCalledWith({
      id: messagesMock[messagesMockChunk - 2].id,
      text: messagesMock[messagesMockChunk - 2].text + ' edit',
    });

    expect(
      screen.getByText(messagesMock[messagesMockChunk - 2].text + ' edit'),
    ).toBeInTheDocument();

    expect(screen.queryByTestId('edit-message-btn')).not.toBeInTheDocument();
  });

  it('save input message state change dialog id', async () => {
    const messagesService = TestBed.inject(MessagesService);

    await navigateByUrl('/dialog/0');

    const messageCards = screen.getAllByTestId('message-card');

    await userEvent.click(messageCards[messagesMockChunk - 2]);
    await userEvent.click(screen.getByText('Редактировать'));

    expect(screen.getByPlaceholderText<HTMLInputElement>('Введите сообщение').value).toBe(
      messagesMock[messagesMockChunk - 2].text,
    );

    await userEvent.type(
      screen.getByPlaceholderText<HTMLInputElement>('Введите сообщение'),
      ' edit',
    );

    expect(screen.getByPlaceholderText<HTMLInputElement>('Введите сообщение').value).toBe(
      messagesMock[messagesMockChunk - 2].text + ' edit',
    );

    await navigateByUrl('/dialog/1');

    expect(messagesService.getAll).toHaveBeenCalledWith(1);

    expect(screen.getByPlaceholderText<HTMLInputElement>('Введите сообщение').value).toBe('');

    await userEvent.clear(screen.getByPlaceholderText<HTMLInputElement>('Введите сообщение'));
    await userEvent.type(
      screen.getByPlaceholderText<HTMLInputElement>('Введите сообщение'),
      'some send message',
    );

    await navigateByUrl('/dialog/0');

    expect(screen.getByPlaceholderText<HTMLInputElement>('Введите сообщение').value).toBe(
      messagesMock[messagesMockChunk - 2].text + ' edit',
    );

    await navigateByUrl('/dialog/1');

    expect(screen.getByPlaceholderText<HTMLInputElement>('Введите сообщение').value).toBe(
      'some send message',
    );
  });
});
