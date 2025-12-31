import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactDto } from './contacts.interface';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  private http = inject(HttpClient);

  getAll(): Observable<ContactDto[]> {
    return this.http.get<ContactDto[]>('/contacts');
  }
}
