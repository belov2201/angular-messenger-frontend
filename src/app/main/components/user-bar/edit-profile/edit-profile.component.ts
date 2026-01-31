import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Signal,
  viewChild,
} from '@angular/core';
import { Button } from 'primeng/button';
import { FloatLabelInputComponent, AvatarComponent } from '@app/shared/ui';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { validators } from '@app/shared/libs';
import { UserStore } from '@app/core/store/user';
import { Menu } from 'primeng/menu';
import { Popover } from 'primeng/popover';
import { MenuItem } from 'primeng/api';
import { ConfirmModalService } from '@app/core/providers';
import { EditUserDto } from '@app/core/store/user/user.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { FieldErrorValidationDirective } from '@app/core/form-validation';

@Component({
  selector: 'app-edit-profile',
  imports: [
    Button,
    FloatLabelInputComponent,
    ReactiveFormsModule,
    AvatarComponent,
    Popover,
    Menu,
    FieldErrorValidationDirective,
  ],
  templateUrl: './edit-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileComponent {
  protected readonly userStore = inject(UserStore);
  private readonly fb = inject(FormBuilder);
  private readonly confirmModalService = inject(ConfirmModalService);

  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly menuItems: Signal<MenuItem[]> = computed(() => {
    const avatar = this.userStore.user()?.avatar;

    return [
      {
        label: 'Редактировать',
        command: () => this.fileInput()?.nativeElement.click(),
      },
      {
        label: 'Удалить',
        command: () => this.openDeleteAvatarDialog(),
        disabled: avatar ? false : true,
      },
    ];
  });

  protected readonly editUserForm = this.fb.group(
    {
      firstName: [this.userStore.user()?.firstName, validators.firstName],
      lastName: [this.userStore.user()?.lastName, validators.lastName],
    },
    { updateOn: 'change' },
  );

  private readonly formValuesSignal = toSignal(this.editUserForm.valueChanges);

  protected readonly isEqualInit = computed(() => {
    const user = this.userStore.user();
    const formValues = this.formValuesSignal();
    return user?.firstName === formValues?.firstName && user?.lastName === formValues?.lastName;
  });

  protected edit() {
    if (!this.editUserForm.valid) return;
    this.userStore.editUser(this.editUserForm.value as EditUserDto);
  }

  private openDeleteAvatarDialog() {
    this.confirmModalService.open({
      message: 'Вы уверены, что хотите удалить аватар?',
      accept: () => this.userStore.deleteAvatar(),
    });
  }

  changeFile(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    if (!file) return;
    this.userStore.editAvatar({ avatar: file });
  }
}
