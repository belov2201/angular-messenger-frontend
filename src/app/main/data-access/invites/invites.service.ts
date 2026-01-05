import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateInviteDto, InviteDto } from './invites.interface';

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
}
