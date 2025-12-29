import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RegisterDto } from './user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  register(createUserDto: RegisterDto): Observable<object> {
    return this.http.post('/auth/register', createUserDto);
  }
}
