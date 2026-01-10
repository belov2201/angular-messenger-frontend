import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Message } from '../../../data-access/messages/messages.interface';
import { DatePipe, NgClass } from '@angular/common';
import { IconComponent } from '@app/shared/ui';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-message-card',
  imports: [NgClass, IconComponent, DatePipe, ProgressSpinner],
  templateUrl: './message-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageCardComponent {
  message = input.required<Message>();
}
