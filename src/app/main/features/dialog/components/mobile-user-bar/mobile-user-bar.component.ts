import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AvatarComponent, IconComponent } from '@app/shared/ui';
import { Badge } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { DialogsStateStore } from '@app/main/data-access/dialogs-state';

@Component({
  selector: 'app-mobile-user-bar',
  imports: [IconComponent, Badge, AvatarComponent, ButtonModule, RouterModule],
  templateUrl: './mobile-user-bar.component.html',
  host: {
    class: 'flex md:hidden px-4 py-3 items-center shadow-xl bg-surface-0',
    'data-testid': 'mobile-user-bar',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileUserBarComponent {
  protected readonly currentContact = inject(DialogsStateStore).currentContact;
  protected readonly currentParticipant = inject(DialogsStateStore).currentParticipant;
}
