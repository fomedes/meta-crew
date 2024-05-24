import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  constructor(private http: HttpClient) {}

  getManagedTeams(wallet: string, token: string): Observable<any> {
    const apiUrl = `https://api.metasoccer.com/teams/managed/${wallet}`;
    const headers = new HttpHeaders({ Authorization: token });
    return this.http.get(apiUrl, { headers: headers });
  }
  getTeamPlayers(teamId: any): Observable<any> {
    const apiUrl = `https://api.metasoccer.com/v2/players/team/${teamId}`;
    return this.http.get(apiUrl).pipe(timeout(15000));
  }

  getSquadInfo(wallet: string, teamId: string, token: string): Observable<any> {
    const apiUrl = `https://api.metasoccer.com/teams/lineup-with-skill/${wallet}/${teamId}`;
    const cardsUrl = `https://api.metasoccer.com/v2/players/team/${teamId}/cards`;
    const injuriesUrl = `https://api.metasoccer.com/v2/players/team/${teamId}/locked`;
    const infoUrl = `https://api.metasoccer.com/home/teamInfo/${teamId}`;
    const headers = new HttpHeaders({ Authorization: token });

    const ovr$ = this.http.get(apiUrl, { headers: headers });
    const cards$ = this.http.get(cardsUrl, { headers: headers });
    const injuries$ = this.http.get(injuriesUrl, { headers: headers });
    const teamInfo$ = this.http.get(infoUrl, { headers: headers });

    return forkJoin({
      ovr: ovr$,
      cards: cards$,
      injuries: injuries$,
      info: teamInfo$,
    });
  }
}
