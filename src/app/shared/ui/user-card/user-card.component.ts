import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar.component';
import { ParticipantDto } from '@app/core/store/user';

@Component({
  selector: 'app-user-card',
  imports: [AvatarComponent],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  user = input.required<ParticipantDto>();
  title = input.required<string>();
  subtitle = input.required<string>();
}
