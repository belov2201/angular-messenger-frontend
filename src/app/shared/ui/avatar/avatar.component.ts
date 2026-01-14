import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AppConfig } from '@app/core/config';
import { UserDto } from '@app/core/store/user';
import { Avatar } from 'primeng/avatar';
import { stringToColor } from './string-to-color';

@Component({
  selector: 'app-avatar',
  imports: [Avatar],
  template: `
    <div class="flex">
      <p-avatar
        [image]="appConfig.apiUrl + '/avatars/' + avatar()"
        [size]="size()"
        [label]="initials()"
        [style.background]="bgColor()"
        shape="circle"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  protected readonly appConfig = inject(AppConfig);

  readonly params = input.required<Pick<UserDto, 'avatar' | 'firstName' | 'lastName'>>();

  protected readonly avatar = computed(() => {
    return this.params().avatar;
  });

  protected readonly initials = computed(() => {
    const { firstName, lastName, avatar } = this.params();
    if (avatar) return;
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  });

  protected readonly bgColor = computed(() => {
    const initials = this.initials();
    if (!initials) return;
    const { firstName, lastName } = this.params();
    return stringToColor(firstName + lastName);
  });

  readonly size = input<'normal' | 'large' | 'xlarge'>('normal');
}
