import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageDto } from './messages.interface';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private readonly http = inject(HttpClient);

  getAll(contactId: number, start?: number): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`/messages/${contactId}?start=${start || 0}`);
  }
}
