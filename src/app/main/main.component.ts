import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ContactsStore } from './data-access/contacts';
import { InvitesStore } from './data-access/invites';
import { AppService } from '@app/app.service';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  private readonly appService = inject(AppService);
  private readonly contactsStore = inject(ContactsStore);
  private readonly invitesStore = inject(InvitesStore);

  protected readonly isLoadedInitData = computed(
    () => this.contactsStore.isLoaded() && this.invitesStore.isLoaded(),
  );

  private readonly isLoadingInitData = computed(
    () => this.contactsStore.isLoading() || this.invitesStore.isLoading(),
  );

  private readonly isErrorInitData = computed(
    () => this.contactsStore.isError() || this.invitesStore.isError(),
  );

  private readonly changeIsLoadingInitData = effect(() => {
    this.appService.isLoadingInitData.set(this.isLoadingInitData());
  });

  private readonly changeIsLoadedInitData = effect(() => {
    this.appService.isLoadedInitData.set(this.isLoadedInitData());
  });

  private readonly changeIsErrorInitData = effect(() => {
    this.appService.isErrorInitData.set(this.isErrorInitData());
  });
}
