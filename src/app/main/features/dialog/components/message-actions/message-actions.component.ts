import { ChangeDetectionStrategy, Component, effect, inject, viewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { validators } from '@app/shared/libs';
import { IconComponent } from '@app/shared/ui';
import { Button } from 'primeng/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { InputMessagesStateStore } from '../../data-access/input-messages';
import { MessagesStateStore } from '../../data-access/messages';
import { WsService } from '@app/main/providers/ws/ws.service';
import { WsEvents } from '@app/main/providers/ws/ws-events';

@Component({
  selector: 'app-message-actions',
  imports: [ReactiveFormsModule, TextareaModule, IconComponent, Button],
  templateUrl: './message-actions.component.html',
  host: {
    class: 'bg-surface-100 border-t border-surface-300 p-2 max-h-[15vh] relative',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageActionsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly messagesStateStore = inject(MessagesStateStore);
  private readonly inputMessagesStateStore = inject(InputMessagesStateStore);
  private readonly wsService = inject(WsService);

  private readonly formDirective = viewChild.required(FormGroupDirective);

  protected readonly currentInputMessagesState = this.inputMessagesStateStore.currentState;
  protected readonly currentTypingContact = this.messagesStateStore.currentTypingContact;

  protected readonly sendMessageForm = this.fb.group({
    text: ['', validators.message],
  });

  constructor() {
    this.sendMessageForm.valueChanges
      .pipe(
        tap(({ text }) => {
          const currentState = this.currentInputMessagesState();
          if (!currentState) return;

          const editState = currentState.edit;

          if (editState && text) {
            this.inputMessagesStateStore.changeEditStateValue(text || '');
          } else {
            if (text) {
              this.wsService.socket.emit(WsEvents.typing, { contactId: currentState.id });
            }

            this.inputMessagesStateStore.changeSendStateValue(text || '');
          }
        }),
        takeUntilDestroyed(),
      )
      .subscribe();

    effect(() => {
      const inputMessageState = this.currentInputMessagesState();

      if (inputMessageState?.edit?.message) {
        this.sendMessageForm.reset({ text: inputMessageState?.edit?.value }, { emitEvent: false });
      } else {
        this.sendMessageForm.reset({ text: inputMessageState?.send }, { emitEvent: false });
      }
    });
  }

  protected onEnterHandler(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) return;
    event.preventDefault();
    if (!this.sendMessageForm.valid) return;
    this.formDirective().onSubmit(event);
  }

  protected sendMessage() {
    const text = this.sendMessageForm.value.text || '';
    const currentState = this.currentInputMessagesState();
    if (!this.sendMessageForm.valid || !currentState) return;

    this.messagesStateStore.sendMessage({
      text,
      contactId: currentState.id,
    });

    this.formDirective().resetForm();
  }

  protected resetEditItem() {
    const inputMessageState = this.currentInputMessagesState();
    const editMessage = inputMessageState?.edit?.message;
    if (!editMessage) return;
    this.inputMessagesStateStore.resetEditState();
    this.sendMessageForm.reset({ text: inputMessageState.send });
  }

  protected editMessage() {
    const editState = this.currentInputMessagesState()?.edit;

    if (editState) {
      this.messagesStateStore.editMessage({ message: editState.message, text: editState.value });
    }

    this.resetEditItem();
  }
}
