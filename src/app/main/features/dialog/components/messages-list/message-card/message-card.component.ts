import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MessageEntity } from '../../../data-access/messages/messages.interface';
import { UserStore } from '@app/core/store/user';

@Component({
  selector: 'app-message-card',
  imports: [],
  templateUrl: './message-card.component.html',
  styleUrl: './message-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageCardComponent {
  userStore = inject(UserStore);

  message = input.required<MessageEntity>();
}
