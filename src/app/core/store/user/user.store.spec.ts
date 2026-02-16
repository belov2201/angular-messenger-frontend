import { userMock } from 'testing/mocks/user/user.mock';
import { UserStore } from './user.store';
import { setupProviders } from 'testing/setup-providers';
import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { EditUserAvatarDto, EditUserDto, RegisterDto } from './user.interface';
import { throwError } from 'rxjs';

describe('UserStore', () => {
  let store: InstanceType<typeof UserStore>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    store = setupProviders(UserStore);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should be created', () => {
    expect(store.isLoading()).toBeFalse();
    expect(store.isError()).toBeFalse();
    expect(store.isLoaded()).toBeTrue();
    expect(store.user()).toEqual(userMock);
    expect(userService.getUserData).toHaveBeenCalled();
  });

  it('auth', () => {
    store.logout();
    expect(store.user()).toBeNull();
    store.auth({ username: 'test', password: '12345678' });
    expect(userService.auth).toHaveBeenCalled();
    expect(store.user()).toEqual(userMock);
  });

  it('get user data error', () => {
    store.logout();
    expect(store.user()).toBeNull();

    userService.getUserData.and.returnValue(
      throwError(() => ({ status: 401, message: 'Unauthorized' })),
    );

    store.getUserData();
    expect(userService.getUserData).toHaveBeenCalledTimes(2);
    expect(store.user()).toBeNull();
    expect(store.isLoaded()).toBeTrue();
    expect(store.isError()).toBeFalse();
  });

  it('register', () => {
    store.logout();
    expect(store.user()).toBeNull();

    const registerDto: RegisterDto = {
      username: 'test',
      password: '12345678',
      repeatPassword: '12345678',
      firstName: 'some firstname',
      lastName: 'some lastname',
    };

    store.register(registerDto);
    expect(userService.register).toHaveBeenCalledOnceWith(registerDto);
  });

  it('logout', () => {
    expect(store.user()).not.toBeNull();
    store.logout();
    expect(userService.logout).toHaveBeenCalled();
    expect(store.user()).toBeNull();
  });

  it('logout error', () => {
    userService.logout.and.returnValue(throwError(() => new Error()));
    expect(store.user()).not.toBeNull();
    store.logout();
    expect(userService.logout).toHaveBeenCalled();
    expect(store.user()).toEqual(userMock);
  });

  it('edit user', () => {
    const editUserDto: EditUserDto = {
      firstName: 'some edit firstname',
      lastName: 'some edit lastname',
    };

    expect(store.user()).not.toBeNull();
    store.editUser(editUserDto);
    expect(userService.editUserData).toHaveBeenCalledOnceWith(editUserDto);
    expect(store.user()?.firstName).toBe(editUserDto.firstName);
    expect(store.user()?.lastName).toBe(editUserDto.lastName);
  });

  it('edit user with null value', () => {
    const editUserDto: EditUserDto = {
      firstName: 'some edit firstname',
      lastName: 'some edit lastname',
    };

    store.logout();
    expect(store.user()).toBeNull();
    store.editUser(editUserDto);
    expect(userService.editUserData).toHaveBeenCalledOnceWith(editUserDto);
    expect(store.user()).toBeNull();
  });

  it('edit user error', () => {
    userService.editUserData.and.returnValue(throwError(() => new Error()));

    const editUserDto: EditUserDto = {
      firstName: 'some edit firstname',
      lastName: 'some edit lastname',
    };

    expect(store.user()).not.toBeNull();
    store.editUser(editUserDto);
    expect(userService.editUserData).toHaveBeenCalledOnceWith(editUserDto);
    expect(store.user()?.firstName).toBe(userMock.firstName);
    expect(store.user()?.lastName).toBe(userMock.lastName);
  });

  it('edit avatar', () => {
    expect(store.user()?.avatar).toBeNull();

    const editUserAvatarDto: EditUserAvatarDto = {
      avatar: new File([], 'some filename'),
    };

    store.editAvatar(editUserAvatarDto);
    expect(userService.editUserAvatar).toHaveBeenCalledOnceWith(editUserAvatarDto);
    expect(store.user()?.avatar).toBe('some-test-file.jpg');
  });

  it('edit avatar with null value', () => {
    store.logout();
    expect(store.user()).toBeNull();

    const editUserAvatarDto: EditUserAvatarDto = {
      avatar: new File([], 'some filename'),
    };

    store.editAvatar(editUserAvatarDto);
    expect(userService.editUserAvatar).toHaveBeenCalledOnceWith(editUserAvatarDto);
    expect(store.user()).toBeNull();
  });

  it('edit avatar error', () => {
    userService.editUserAvatar.and.returnValue(throwError(() => new Error()));
    expect(store.user()?.avatar).toBeNull();

    const editUserAvatarDto: EditUserAvatarDto = {
      avatar: new File([], 'some filename'),
    };

    store.editAvatar(editUserAvatarDto);
    expect(userService.editUserAvatar).toHaveBeenCalledOnceWith(editUserAvatarDto);
    expect(store.user()?.avatar).toBeNull();
  });

  it('delete avatar', async () => {
    store.logout();
    expect(store.user()).toBeNull();

    const editUserAvatarDto: EditUserAvatarDto = {
      avatar: new File([], 'some filename'),
    };

    store.editAvatar(editUserAvatarDto);
    expect(userService.editUserAvatar).toHaveBeenCalledOnceWith(editUserAvatarDto);

    store.deleteAvatar();
    expect(userService.deleteUserAvatar).toHaveBeenCalled();
    expect(store.user()).toBeNull();
  });

  it('delete avatar with null value', async () => {
    expect(store.user()?.avatar).toBeNull();

    const editUserAvatarDto: EditUserAvatarDto = {
      avatar: new File([], 'some filename'),
    };

    store.editAvatar(editUserAvatarDto);
    expect(userService.editUserAvatar).toHaveBeenCalledOnceWith(editUserAvatarDto);
    expect(store.user()?.avatar).toBe('some-test-file.jpg');

    store.deleteAvatar();
    expect(userService.deleteUserAvatar).toHaveBeenCalled();
    expect(store.user()?.avatar).toBeNull();
  });

  it('delete avatar error', async () => {
    userService.deleteUserAvatar.and.returnValue(throwError(() => new Error()));

    expect(store.user()?.avatar).toBeNull();

    const editUserAvatarDto: EditUserAvatarDto = {
      avatar: new File([], 'some filename'),
    };

    store.editAvatar(editUserAvatarDto);
    expect(userService.editUserAvatar).toHaveBeenCalledOnceWith(editUserAvatarDto);
    expect(store.user()?.avatar).toBe('some-test-file.jpg');

    store.deleteAvatar();
    expect(userService.deleteUserAvatar).toHaveBeenCalled();
    expect(store.user()?.avatar).toBe('some-test-file.jpg');
  });
});
