import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateMessageDto,
  DeleteMessageDto,
  DeleteMessageResponseDto,
  MessageDto,
  UpdateMessageDto,
} from './messages.interface';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private readonly http = inject(HttpClient);

  getAll(contactId: number, start?: number): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`/messages/${contactId}?start=${start || 0}`);
  }

  create(body: CreateMessageDto) {
    return this.http.post<MessageDto>('/messages', body);
  }

  edit(body: UpdateMessageDto) {
    return this.http.patch<void>(`/messages/${body.id}`, body);
  }

  delete(body: DeleteMessageDto) {
    return this.http.delete<DeleteMessageResponseDto>(`/messages/${body.id}`);
  }
}
