import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  getSquadInfo(wallet: string, teamId: string, token: string): Observable<any> {
    const apiUrl = `https://api.metasoccer.com/teams/lineup-with-skill/${wallet}/${teamId}`;

    const headers = new HttpHeaders({ Authorization: token });
    return this.http.get(apiUrl, { headers: headers });
  }
}
