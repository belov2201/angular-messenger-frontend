import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppConfig } from '@app/core/config';
import { UserStore } from '@app/core/store/user';
import { AvatarModule } from 'primeng/avatar';
import { Badge } from 'primeng/badge';

@Component({
  selector: 'app-user-bar',
  imports: [AvatarModule, Badge],
  templateUrl: './user-bar.component.html',
  styleUrl: './user-bar.component.css',
  host: {
    class: 'py-3 px-2 border-b border-surface-300',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserBarComponent {
  protected readonly appConfig = inject(AppConfig);
  protected readonly userStore = inject(UserStore);
}
