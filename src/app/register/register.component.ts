import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FieldErrorValidationDirective } from '@app/core/form-validation';
import { validators } from '@app/shared/libs';
import { FloatLabelInputComponent } from '@app/shared/ui';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { AuthLayoutComponent } from '@app/shared/layouts';
import { comparePasswordValidator } from '@app/shared/libs/validators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { RegisterDto, UserStore } from '@app/core/store/user';

@Component({
  selector: 'app-register',
  imports: [
    RouterModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    FloatLabelModule,
    ReactiveFormsModule,
    FloatLabelInputComponent,
    FieldErrorValidationDirective,
    AuthLayoutComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userStore = inject(UserStore);

  protected readonly registerForm = this.fb.group(
    {
      username: ['', validators.username],
      password: ['', validators.password],
      repeatPassword: ['', [comparePasswordValidator]],
      firstName: ['', validators.firstName],
      lastName: ['', validators.lastName],
    },
    { updateOn: 'change' },
  );

  constructor() {
    this.registerForm.controls.password.valueChanges
      .pipe(
        tap(() => this.registerForm.controls.repeatPassword.updateValueAndValidity()),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  register() {
    if (!this.registerForm.valid) return;
    this.userStore.register(this.registerForm.value as RegisterDto);
  }
}
