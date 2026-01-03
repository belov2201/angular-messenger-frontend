import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AppConfig } from '@app/core/config';
import { Avatar } from 'primeng/avatar';

@Component({
  selector: 'app-avatar',
  imports: [Avatar],
  template: `
    <div class="flex">
      <p-avatar
        [image]="appConfig.apiUrl + '/avatars/' + avatar()"
        shape="circle"
        [size]="size()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  protected readonly appConfig = inject(AppConfig);

  avatar = input.required<string>();
  size = input<'normal' | 'large' | 'xlarge'>('normal');
}
