import { getSharedProviders } from 'testing/get-shared-providers';
import { render, screen } from '@testing-library/angular';
import { CurrentDialogIdService } from '@app/main/providers/current-dialog-id';
import { MessagesListComponent } from '../messages-list.component';
import { ApplicationRef, signal } from '@angular/core';
import { messagesMock, messagesMockChunk } from 'testing/mocks/messages/messages.mock';
import { IntersectionService } from '../providers/intersection.service';
import { TestBed } from '@angular/core/testing';
import { MessagesStore } from '@app/main/data-access/messages';
import { mapToMessageView } from '@app/main/data-access/messages/messages.mapper';
import { userMock } from 'testing/mocks/user/user.mock';
import { waitFor } from '@testing-library/dom';
import { DialogsStateStore } from '@app/main/data-access/dialogs-state';
import userEvent from '@testing-library/user-event';

describe('VisibilityDirective', () => {
  beforeEach(async () => {
    const intersectionMock = jasmine.createSpyObj('IntersectionService', ['observe', 'unobserve']);

    await render(MessagesListComponent, {
      providers: [
        ...getSharedProviders(),
        { provide: CurrentDialogIdService, useValue: { value: signal(0) } },
      ],
      componentProviders: [{ provide: IntersectionService, useValue: intersectionMock }],
    });

    const messageCards = screen.getAllByTestId('message-card');
    expect(messageCards.length).toBe(messagesMockChunk);
  });

  it('call observable', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const messagesStore = TestBed.inject(MessagesStore);

    const intersectionService = TestBed.inject(
      IntersectionService,
    ) as jasmine.SpyObj<IntersectionService>;

    expect(intersectionService.observe).toHaveBeenCalledTimes(
      2 + Math.floor(messagesMockChunk / 3),
    );

    const prevUnobserveCalls = intersectionService.unobserve.calls.count();

    messagesStore.deleteMessage(mapToMessageView(messagesMock[1], userMock)!);

    appRef.tick();

    await waitFor(() =>
      expect(screen.getAllByTestId('message-card').length).toBe(messagesMockChunk - 1),
    );

    expect(intersectionService.unobserve).toHaveBeenCalledTimes(prevUnobserveCalls + 1);
  });

  it('call unobservable when delete', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const messagesStore = TestBed.inject(MessagesStore);

    const intersectionService = TestBed.inject(
      IntersectionService,
    ) as jasmine.SpyObj<IntersectionService>;

    const prevUnobserveCalls = intersectionService.unobserve.calls.count();
    messagesStore.deleteMessage(mapToMessageView(messagesMock[1], userMock)!);
    appRef.tick();

    await waitFor(() =>
      expect(screen.getAllByTestId('message-card').length).toBe(messagesMockChunk - 1),
    );

    expect(intersectionService.unobserve).toHaveBeenCalledTimes(prevUnobserveCalls + 1);
  });

  it('call unobservable when change is enabled visibility', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const messagesStore = TestBed.inject(MessagesStore);

    const intersectionService = TestBed.inject(
      IntersectionService,
    ) as jasmine.SpyObj<IntersectionService>;

    const prevUnobserveCalls = intersectionService.unobserve.calls.count();

    messagesStore.sendMessage({ contactId: 0, text: 'some new message' });
    messagesStore.sendMessage({ contactId: 0, text: 'some new message2' });

    appRef.tick();

    await waitFor(() =>
      expect(screen.getAllByTestId('message-card').length).toBe(messagesMockChunk + 2),
    );

    expect(intersectionService.unobserve).toHaveBeenCalledTimes(prevUnobserveCalls + 1);
  });

  it('call unobservable when change is read message', async () => {
    const dialogsStateStore = TestBed.inject(DialogsStateStore);
    const messagesStore = TestBed.inject(MessagesStore);
    const intersectionService = TestBed.inject(
      IntersectionService,
    ) as jasmine.SpyObj<IntersectionService>;

    const prevUnobserveCalls = intersectionService.unobserve.calls.count();
    const cb = intersectionService.observe.calls.all()[2].args[1];
    cb(true);

    const updatedMessage = (dialogsStateStore?.currentUpdateReadState() || [])[0];
    expect(updatedMessage.isRead).toBeFalse();

    expect(dialogsStateStore.currentUpdateReadState()?.length).toBeGreaterThan(0);
    await userEvent.hover(screen.getAllByTestId('message-card')[0]);
    expect(dialogsStateStore.currentUpdateReadState()?.length).toBe(0);
    expect(messagesStore.entityMap()[updatedMessage.id].isRead).toBeTrue();
    expect(intersectionService.unobserve.calls.count()).toBe(prevUnobserveCalls + 1);
  });
});
