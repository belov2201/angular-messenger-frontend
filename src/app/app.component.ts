import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AlertsComponent } from './core/alerts';
import { UserStore } from './core/store/user';
import { LoaderComponent } from './shared/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, AlertsComponent, LoaderComponent],
  template: `
    @if (showLoader()) {
      <app-loader />
    }
    <app-alerts />
    <router-outlet />
  `,
  host: { class: 'block h-full' },
})
export class AppComponent {
  userStore = inject(UserStore);

  showLoader = computed(() => this.userStore.isLoading() || !this.userStore.isLoaded());
}
