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
  appService = inject(AppService);
  contactsStore = inject(ContactsStore);
  invitesStore = inject(InvitesStore);

  isLoadedInitData = computed(() => this.contactsStore.isLoaded() && this.invitesStore.isLoaded());

  isLoadingInitData = computed(
    () => this.contactsStore.isLoading() || this.invitesStore.isLoading(),
  );

  isErrorInitData = computed(() => this.contactsStore.isError() || this.invitesStore.isError());

  changeIsLoadingInitData = effect(() => {
    this.appService.isLoadingInitData.set(this.isLoadingInitData());
  });

  changeIsLoadedInitData = effect(() => {
    this.appService.isLoadedInitData.set(this.isLoadedInitData());
  });

  changeIsErrorInitData = effect(() => {
    this.appService.isErrorInitData.set(this.isErrorInitData());
  });
}
