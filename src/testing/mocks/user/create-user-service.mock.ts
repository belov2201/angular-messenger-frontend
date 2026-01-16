import { UserService } from '@app/core/store/user/user.service';
import { of } from 'rxjs';
import { userMock } from './user.mock';

export const createUserServiceMock = () => {
  const userServiceSpy: jasmine.SpyObj<UserService> = jasmine.createSpyObj('UserService', [
    'auth',
    'getUserData',
    'register',
  ]);

  userServiceSpy.auth.and.returnValue(of(userMock));
  userServiceSpy.register.and.returnValue(of(undefined));
  userServiceSpy.getUserData.and.returnValue(of(userMock));

  return userServiceSpy;
};
