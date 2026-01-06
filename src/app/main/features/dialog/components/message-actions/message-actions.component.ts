import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { validators } from '@app/shared/libs';
import { IconComponent } from '@app/shared/ui';
import { Button } from 'primeng/button';

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

  protected readonly sendMessageForm = this.fb.group(
    {
      text: ['', validators.message],
    },
    { updateOn: 'change' },
  );
}
