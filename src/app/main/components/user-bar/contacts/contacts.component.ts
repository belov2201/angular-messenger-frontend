import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { IconComponent, UserCardComponent, FloatLabelInputComponent } from '@app/shared/ui';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { validators } from '@app/shared/libs';

@Component({
  selector: 'app-contacts',
  imports: [
    Button,
    IconComponent,
    UserCardComponent,
    FloatLabelInputComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsComponent {
  private readonly config = inject(DynamicDialogConfig);
  private readonly fb = inject(FormBuilder);
  protected readonly contactsStore = this.config.data.contactsStore;
  protected readonly invitesStore = this.config.data.invitesStore;

  protected readonly sendInviteForm = this.fb.group(
    {
      inviteCode: ['', validators.inviteCode],
    },
    { updateOn: 'change' },
  );

  protected sendInvite(formDirective: FormGroupDirective) {
    if (!this.sendInviteForm.valid) return;
    formDirective.resetForm();
  }
}
