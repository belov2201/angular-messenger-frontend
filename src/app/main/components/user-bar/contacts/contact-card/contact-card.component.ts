import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { UserStore } from '@app/core/store/user';
import { ContactEntity } from '@app/main/data-access/contacts/contacts.interface';
import { mapToContactView } from '@app/main/data-access/contacts/contacts.mapper';
import { UserCardComponent, IconComponent } from '@app/shared/ui';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-contact-card',
  imports: [UserCardComponent, Button, IconComponent],
  templateUrl: './contact-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactCardComponent {
  private readonly userStore = inject(UserStore);

  readonly contactEntity = input.required<ContactEntity>();
  protected readonly delete = output<number>();

  protected readonly contact = computed(() =>
    mapToContactView(this.contactEntity(), this.userStore.user()),
  );

  protected deleteContact(id: number) {
    this.delete.emit(id);
  }
}
