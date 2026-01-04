import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmModalService } from '@app/core/providers';
import { UserStore } from '@app/core/store/user';
import { AvatarComponent, IconComponent } from '@app/shared/ui';
import { MenuItem } from 'primeng/api';
import { Badge } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-user-bar',
  imports: [AvatarComponent, Badge, MenuModule, ButtonModule, IconComponent],
  templateUrl: './user-bar.component.html',
  styleUrl: './user-bar.component.css',
  host: {
    class: 'py-3 px-2 border-b border-surface-300',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserBarComponent {
  protected readonly userStore = inject(UserStore);
  private readonly confirmModalService = inject(ConfirmModalService);

  protected readonly menuItems: MenuItem[] = [
    {
      label: 'Выйти',
      command: () => this.openLogoutDialog(),
    },
  ];

  private openLogoutDialog() {
    this.confirmModalService.open({
      message: 'Вы уверены, что хотите выйти из учетной записи?',
      accept: () => this.userStore.logout(),
    });
  }
}
