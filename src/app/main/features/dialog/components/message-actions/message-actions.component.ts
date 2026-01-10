import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { validators } from '@app/shared/libs';
import { IconComponent } from '@app/shared/ui';
import { Button } from 'primeng/button';
import { MessagesStateStore } from '../../data-access/messages';

@Component({
  selector: 'app-message-actions',
  imports: [ReactiveFormsModule, TextareaModule, IconComponent, Button],
  templateUrl: './message-actions.component.html',
  host: {
    class: 'bg-surface-100 border-t border-surface-300 p-2 max-h-[15vh]',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageActionsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly messagesStateStore = inject(MessagesStateStore);

  private readonly formDirective = viewChild.required(FormGroupDirective);

  protected readonly sendMessageForm = this.fb.group({
    text: ['', validators.message],
  });

  protected onEnterHandler(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) return;
    event.preventDefault();
    this.formDirective().onSubmit(event);
  }

  protected sendMessage() {
    const text = this.sendMessageForm.value.text || '';
    const currentState = this.messagesStateStore.currentState();
    if (!this.sendMessageForm.valid || !currentState) return;

    this.messagesStateStore.sendMessage({
      text,
      contactId: currentState.id,
    });

    this.formDirective().resetForm();
  }
}
