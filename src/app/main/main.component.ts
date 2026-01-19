import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ContactsStore } from './data-access/contacts';
import { InvitesStore } from './data-access/invites';
import { AppService } from '@app/app.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { WsService } from '@app/main/providers/ws/ws.service';
import { UserStore } from '@app/core/store/user';

@Component({
  selector: 'app-main',
  imports: [SidebarComponent, RouterModule],
  templateUrl: './main.component.html',
  providers: [ContactsStore, InvitesStore, WsService],
  host: {
    class: 'h-full flex',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit, OnDestroy {
  private readonly appService = inject(AppService);
  private readonly contactsStore = inject(ContactsStore);
  private readonly invitesStore = inject(InvitesStore);
  private readonly wsService = inject(WsService);
  private readonly userStore = inject(UserStore);

  protected readonly user = this.userStore.user;
  protected readonly wsStatus = this.wsService.status;

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

  ngOnInit(): void {
    this.wsService.socket.connect();
  }

  ngOnDestroy(): void {
    setTimeout(() => this.wsService.socket.disconnect(), 0);
  }
}
