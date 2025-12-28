import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  template: '<ng-content/>',
  host: {
    class: 'h-full flex justify-center items-center',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {}
