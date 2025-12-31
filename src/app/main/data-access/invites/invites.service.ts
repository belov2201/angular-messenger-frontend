import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InviteDto } from './invites.interface';

@Injectable({
  providedIn: 'root',
})
export class InvitesService {
  private http = inject(HttpClient);

  getAll(): Observable<InviteDto[]> {
    return this.http.get<InviteDto[]>('/invites');
  }
}
