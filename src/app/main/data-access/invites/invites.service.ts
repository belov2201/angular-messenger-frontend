import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApproveInviteDto, CreateInviteDto, DeleteInviteDto, InviteDto } from './invites.interface';
import { ContactDto } from '../contacts/contacts.interface';

@Injectable({
  providedIn: 'root',
})
export class InvitesService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<InviteDto[]> {
    return this.http.get<InviteDto[]>('/invites');
  }

  create(body: CreateInviteDto): Observable<InviteDto> {
    return this.http.post<InviteDto>('/invites', body);
  }

  approve(body: ApproveInviteDto) {
    return this.http.get<ContactDto>(`/invites/approve/${body.id}`);
  }

  delete(body: DeleteInviteDto) {
    return this.http.delete<void>(`/invites/${body.id}`);
  }
}
