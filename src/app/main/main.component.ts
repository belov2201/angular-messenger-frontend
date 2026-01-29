import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ContactsStore } from './data-access/contacts';
import { InvitesStore } from './data-access/invites';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { WsService } from '@app/main/providers/ws/ws.service';
import { UserStore } from '@app/core/store/user';
import { AppStatusStore } from '@app/core/store/app-status/app-status.store';

@Component({
  selector: 'app-main',
  imports: [SidebarComponent, RouterModule],
  templateUrl: './main.component.html',
  providers: [ContactsStore, InvitesStore, WsService],
  host: { class: 'h-full flex' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit, OnDestroy {
  protected readonly wsService = inject(WsService);
  protected readonly userStore = inject(UserStore);
  protected readonly appStatusStore = inject(AppStatusStore);

  constructor() {
    [ContactsStore, InvitesStore].forEach((s) => inject(s));
  }

  ngOnInit(): void {
    this.wsService.socket.connect();
  }

  ngOnDestroy(): void {
    setTimeout(() => this.wsService.socket.disconnect(), 0);
  }
}
