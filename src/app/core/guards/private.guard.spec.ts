import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  GuardResult,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { privateGuard } from './private.guard';
import { getSharedProviders } from 'testing/get-shared-providers';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { UserService } from '../store/user/user.service';

describe('privateGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...getSharedProviders(),
        { provide: Router, useValue: { createUrlTree: jasmine.createSpy('createUrlTree') } },
      ],
    });
  });

  it('should be return true', async () => {
    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        privateGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      ) as Observable<GuardResult>,
    );

    expect(result).toBeTrue();
  });

  it('should be redirect to auth', async () => {
    const router = TestBed.inject(Router);
    const userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    userService.getUserData.and.returnValue(throwError(() => new Error('Unauthorized')));

    await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        privateGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      ) as Observable<UrlTree>,
    );

    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/auth']);
  });
});
