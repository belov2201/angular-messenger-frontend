import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  imports: [
    RouterModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    FloatLabelModule,
    ReactiveFormsModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-full flex justify-center items-center',
  },
})
export class AuthComponent {
  fb = inject(FormBuilder);

  authForm = this.fb.group(
    {
      login: [''],
      password: [''],
    },
    { updateOn: 'change' },
  );

  auth(formDirective: FormGroupDirective) {
    formDirective.resetForm();
    (document.activeElement as HTMLElement)?.blur();
  }
}
