import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AlertsComponent } from './core/alerts';
import { LoaderComponent } from './shared/ui';
import { ConfirmDialogComponent } from './shared/ui/confirm-dialog/confirm-dialog.component';
import { AppStatusStore } from './core/store/app-status/app-status.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, AlertsComponent, LoaderComponent, ConfirmDialogComponent],
  template: `
    <app-confirm-dialog />
    <app-alerts />

    @if (appStatusStore.isLoading()) {
      <app-loader />
    }

    @if (!appStatusStore.isError()) {
      <router-outlet />
    } @else {
      <div class="h-full flex justify-center items-center">
        Ошибка загрузки данных, перезапустите приложение
      </div>
    }
  `,
  host: { class: 'block h-full min-w-[375px]' },
})
export class AppComponent {
  protected readonly appStatusStore = inject(AppStatusStore);
}
