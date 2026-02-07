import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  GuardResult,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { publicGuard } from './public.guard';
import { getSharedProviders } from 'testing/get-shared-providers';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { UserService } from '../store/user/user.service';

describe('publicGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...getSharedProviders(),
        { provide: Router, useValue: { createUrlTree: jasmine.createSpy('createUrlTree') } },
      ],
    });
  });

  it('should be redirect to main', async () => {
    const router = TestBed.inject(Router);

    await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        publicGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      ) as Observable<UrlTree>,
    );

    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/']);
  });

  it('should return true', async () => {
    const userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    userService.getUserData.and.returnValue(throwError(() => new Error('Unauthorized')));

    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        publicGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      ) as Observable<GuardResult>,
    );

    expect(result).toBeTrue();
  });
});
