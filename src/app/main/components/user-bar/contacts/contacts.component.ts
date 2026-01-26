import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FloatLabelInputComponent } from '@app/shared/ui';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { CreateInviteDto } from '@app/main/data-access/invites/invites.interface';
import { FieldErrorValidationDirective } from '@app/core/form-validation';
import { validators } from '@app/shared/libs';
import { ConfirmModalService } from '@app/core/providers';
import { InviteCardComponent } from './invite-card/invite-card.component';
import { ContactCardComponent } from './contact-card/contact-card.component';
import { modalMessages } from '@app/shared/constants/modal-messages';

@Component({
  selector: 'app-contacts',
  imports: [
    Button,
    FloatLabelInputComponent,
    ReactiveFormsModule,
    FieldErrorValidationDirective,
    InviteCardComponent,
    ContactCardComponent,
  ],
  templateUrl: './contacts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsComponent {
  private readonly config = inject(DynamicDialogConfig);
  private readonly fb = inject(FormBuilder);
  private readonly confirmModalService = inject(ConfirmModalService);

  protected readonly contactsStore = this.config.data.contactsStore;
  protected readonly invitesStore = this.config.data.invitesStore;

  protected readonly sendInviteForm = this.fb.group(
    {
      inviteCode: ['', validators.inviteCode],
    },
    { updateOn: 'change' },
  );

  protected openApproveInviteDialog(id: number) {
    this.confirmModalService.open({
      message: modalMessages.approveInvite,
      accept: () => this.invitesStore.approveInvite({ id }),
    });
  }

  protected openDeclineInviteDialog(id: number) {
    this.confirmModalService.open({
      message: modalMessages.declineInvite,
      accept: () => this.invitesStore.declineInvite({ id }),
    });
  }

  protected openDeleteContactDialog(id: number) {
    this.confirmModalService.open({
      message: modalMessages.deleteContact,
      accept: () => this.contactsStore.deleteContact({ id }),
    });
  }

  protected sendInvite(formDirective: FormGroupDirective) {
    if (!this.sendInviteForm.valid) return;
    this.invitesStore.sendInvite(this.sendInviteForm.value as CreateInviteDto);
    formDirective.resetForm();
  }
}
