import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthDto, RegisterDto, UserDto } from './user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  getUserData(): Observable<UserDto> {
    return this.http.get<UserDto>('/user');
  }

  auth(authDto: AuthDto): Observable<UserDto> {
    return this.http.post<UserDto>('/auth', authDto);
  }

  register(createUserDto: RegisterDto): Observable<void> {
    return this.http.post<void>('/auth/register', createUserDto);
  }
}
