import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { UserStore } from '@app/core/store/user';
import { InviteEntity } from '@app/main/data-access/invites/invites.interface';
import { mapToInviteView } from '@app/main/data-access/invites/invites.mapper';
import { UserCardComponent, IconComponent } from '@app/shared/ui';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-invite-card',
  imports: [UserCardComponent, IconComponent, Button],
  templateUrl: './invite-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteCardComponent {
  private readonly userStore = inject(UserStore);

  readonly inviteEntity = input.required<InviteEntity>();
  protected readonly approve = output<number>();
  protected readonly decline = output<number>();

  protected readonly inviteView = computed(() =>
    mapToInviteView(this.inviteEntity(), this.userStore.user()),
  );

  protected approveInvite(id: number) {
    this.approve.emit(id);
  }

  protected declineInvite(id: number) {
    this.decline.emit(id);
  }
}
