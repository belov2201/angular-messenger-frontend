import { MessagesListComponent } from '../messages-list.component';
import { render, screen, waitFor } from '@testing-library/angular';
import { messagesMockChunk } from 'testing/mocks/messages/messages.mock';
import { getSharedProviders } from 'testing/get-shared-providers';
import { CurrentDialogIdService } from '@app/main/providers/current-dialog-id';
import { ApplicationRef, signal } from '@angular/core';
import { IntersectionService } from '../providers/intersection.service';
import { MessagesStore } from '@app/main/data-access/messages';
import { TestBed } from '@angular/core/testing';
import { ScrollStateStore } from '@app/main/data-access/scroll';

describe('ScrollBottomDirective', () => {
  let mockObserver: jasmine.SpyObj<IntersectionObserver>;
  let intersectionObserverCb: IntersectionObserverCallback;

  beforeEach(async () => {
    mockObserver = jasmine.createSpyObj('IntersectionObserver', [
      'observe',
      'unobserve',
      'disconnect',
    ]);

    spyOn(window, 'IntersectionObserver').and.callFake(function (cb) {
      intersectionObserverCb = cb;
      return mockObserver;
    });

    await render(
      `<div class="h-230 overflow-hidden flex">
        <app-messages-list />
      </div>`,
      {
        providers: [
          ...getSharedProviders(),
          { provide: CurrentDialogIdService, useValue: { value: signal(0) } },
          IntersectionService,
        ],
        imports: [MessagesListComponent],
      },
    );

    const messageCards = screen.getAllByTestId('message-card');
    expect(messageCards.length).toBe(messagesMockChunk);
  });

  it('should scroll bottom', async () => {
    const container = screen.getByTestId('messages-list');
    expect(container.scrollTop).toBe(container.scrollHeight - container.clientHeight);
  });

  it('save scroll position when load additional messages', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const scrollStore = TestBed.inject(ScrollStateStore);

    const container = screen.getByTestId('messages-list');
    container.scrollTop = 0;

    const el = screen.getAllByTestId('message-card')[0];

    const mockEntry = { target: el, isIntersecting: true } as unknown as IntersectionObserverEntry;
    intersectionObserverCb([mockEntry], mockObserver);
    const prevScrollHeight = scrollStore.currentState()?.prevScrollHeight;

    appRef.tick();

    await waitFor(() =>
      expect(screen.getAllByTestId('message-card').length).toBe(messagesMockChunk * 2),
    );

    expect(container.scrollHeight - (prevScrollHeight || 0)).toBe(container.scrollTop);
  });

  it('scroll to bottom when add message', async () => {
    const messagesStore = TestBed.inject(MessagesStore);
    const container = screen.getByTestId('messages-list');

    messagesStore.sendMessage({ contactId: 0, text: 'some new message' });

    expect(messagesStore.entities().length).toBe(messagesMockChunk + 1);
    expect(container.scrollTop).toBe(container.scrollHeight - container.clientHeight);

    container.scrollTop -= 350;

    messagesStore.sendMessage({ contactId: 0, text: 'some new message' });
    expect(messagesStore.entities().length).toBe(messagesMockChunk + 2);
    expect(container.scrollTop).toBe(container.scrollHeight - container.clientHeight - 350);
  });
});
