import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactDto, DeleteContactDto } from './contacts.interface';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<ContactDto[]> {
    console.log('get all');

    return this.http.get<ContactDto[]>('/contacts');
  }

  delete(body: DeleteContactDto) {
    return this.http.delete<void>(`/contacts/${body.id}`);
  }
}
