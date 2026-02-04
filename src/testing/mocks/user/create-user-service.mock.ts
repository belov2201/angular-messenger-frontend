import { UserService } from '@app/core/store/user/user.service';
import { of } from 'rxjs';
import { userMock } from './user.mock';

export const createUserServiceMock = () => {
  const userServiceSpy: jasmine.SpyObj<UserService> = jasmine.createSpyObj('UserService', [
    'auth',
    'getUserData',
    'register',
    'editUserAvatar',
    'deleteUserAvatar',
    'editUserData',
    'logout',
  ]);

  userServiceSpy.auth.and.returnValue(of(userMock));
  userServiceSpy.register.and.returnValue(of(undefined));
  userServiceSpy.getUserData.and.returnValue(of(userMock));
  userServiceSpy.editUserAvatar.and.returnValue(of({ fileName: 'some-test-file.jpg' }));
  userServiceSpy.deleteUserAvatar.and.returnValue(of(undefined));
  userServiceSpy.editUserData.and.returnValue(of(undefined));
  userServiceSpy.logout.and.returnValue(of(undefined));

  return userServiceSpy;
};
