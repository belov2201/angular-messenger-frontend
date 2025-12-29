import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelInputComponent } from '@app/shared/ui';
import { validators } from '@app/shared/libs';
import { FieldErrorValidationDirective } from '@app/core/form-validation';
import { AuthLayoutComponent } from '@app/shared/layouts';

@Component({
  selector: 'app-auth',
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
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  fb = inject(FormBuilder);

  authForm = this.fb.group(
    {
      username: ['', validators.username],
      password: ['', validators.password],
    },
    { updateOn: 'change' },
  );

  auth(formDirective: FormGroupDirective) {
    formDirective.resetForm();
    (document.activeElement as HTMLElement)?.blur();
  }
}
