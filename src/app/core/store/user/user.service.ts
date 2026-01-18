import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AuthDto,
  EditUserAvatarDto,
  EditUserAvatarResponse,
  EditUserDto,
  RegisterDto,
  UserDto,
} from './user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  getUserData(): Observable<UserDto> {
    return this.http.get<UserDto>('/user');
  }

  auth(authDto: AuthDto): Observable<UserDto> {
    return this.http.post<UserDto>('/auth', authDto);
  }

  register(createUserDto: RegisterDto): Observable<void> {
    return this.http.post<void>('/auth/register', createUserDto);
  }

  logout(): Observable<void> {
    return this.http.get<void>('/auth/logout');
  }

  editUserData(data: EditUserDto): Observable<void> {
    return this.http.patch<void>('/user', data);
  }

  editUserAvatar(data: EditUserAvatarDto): Observable<EditUserAvatarResponse> {
    const body = new FormData();
    body.append('avatar', data.avatar as Blob);

    return this.http.patch<EditUserAvatarResponse>('/user/updateAvatar', body);
  }

  deleteUserAvatar(): Observable<void> {
    return this.http.delete<void>('/user/updateAvatar');
  }
}
