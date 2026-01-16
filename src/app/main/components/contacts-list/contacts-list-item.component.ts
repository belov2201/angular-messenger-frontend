import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ContactEntity } from '../../data-access/contacts/contacts.interface';
import { DateToStrPipe } from '@app/main/pipes/date-to-str';
import { IconComponent } from '@app/shared/ui';
import { AvatarComponent } from '@app/shared/ui';
import { UserStore } from '@app/core/store/user';
import { mapToContactView } from '@app/main/data-access/contacts/contacts.mapper';
import { Badge } from 'primeng/badge';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-contacts-list-item',
  imports: [DateToStrPipe, IconComponent, AvatarComponent, Badge],
  host: { 'data-testid': 'contacts-list-item' },
  templateUrl: './contacts-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsListItemComponent {
  private readonly userStore = inject(UserStore);
  readonly contactEntity = input.required<ContactEntity>();

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly contact = computed(() =>
    mapToContactView(this.contactEntity(), this.userStore.user()),
  );

  protected readonly activeDialogId = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        if (!this.activatedRoute.firstChild) return null;
        const dialogId = this.activatedRoute.firstChild.snapshot.paramMap.get('dialogId');
        return dialogId !== null ? Number(dialogId) : null;
      }),
      distinctUntilChanged(),
    ),
  );

  protected readonly isActivatedRouteContact = computed(() => {
    const contact = this.contact();
    if (!this.activatedRoute.firstChild) return false;
    const activateDialog = this.activeDialogId();
    return contact?.id === activateDialog;
  });
}
