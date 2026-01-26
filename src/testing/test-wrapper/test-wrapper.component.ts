import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Type } from '@angular/core';
import { AlertsComponent } from '@app/core/alerts';
import { ConfirmDialogComponent } from '@app/shared/ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-test-wrapper',
  standalone: true,
  imports: [AlertsComponent, ConfirmDialogComponent, NgComponentOutlet],
  template: `
    <app-confirm-dialog />
    <app-alerts />
    <ng-container *ngComponentOutlet="component; inputs: componentInputs" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestWrapperComponent {
  @Input() component!: Type<unknown>;
  @Input() componentInputs: Record<string, unknown> = {};
}
