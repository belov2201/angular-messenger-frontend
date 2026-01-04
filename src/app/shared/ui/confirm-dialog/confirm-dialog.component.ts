import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-confirm-dialog',
  imports: [ConfirmDialog, Button],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {}
