import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertsComponent } from '@app/core/alerts';
import { ConfirmDialogComponent } from '@app/shared/ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-test-wrapper',
  standalone: true,
  imports: [AlertsComponent, ConfirmDialogComponent],
  template: `
    <app-confirm-dialog />
    <app-alerts />
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestWrapperComponent {}
