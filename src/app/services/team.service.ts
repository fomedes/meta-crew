import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  constructor(private http: HttpClient) {}

  getTeamPlayers(teamId: any): Observable<any> {
    const apiUrl = `https://api.metasoccer.com/v2/players/team/${teamId}`;
    return this.http.get(apiUrl).pipe(timeout(15000));
  }
}
