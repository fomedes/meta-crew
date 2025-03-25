import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  constructor(private http: HttpClient) {}

  getManagedTeams(wallet: string, token: string): Observable<any> {
    const apiUrl = `https://play.metasoccer.com/api/2024/teams/manager/${wallet}`;
    const headers = new HttpHeaders({ Authorization: token });
    return this.http.get(apiUrl, { headers: headers });
  }
  getTeamPlayers(teamId: any): Observable<any> {
    const apiUrl = `https://play.metasoccer.com/api/2024/players/team/${teamId}`;
    return this.http.get(apiUrl).pipe(timeout(15000));
  }

  getSquadInfo(wallet: string, teamId: string, token: string): Observable<any> {
    const apiUrl = `https://play.metasoccer.com/api/2024/lineups/team/${teamId}`;
    const cardsUrl = `hhttps://play.metasoccer.com/api/2024/tournamentCards/team/${teamId}`;
    const injuriesUrl = `https://play.metasoccer.com/api/2024/lockedPlayers/team/${teamId}`;
    const infoUrl = `https://play.metasoccer.com/api/2024/msl?teamId=${teamId}`;
    const headers = new HttpHeaders({ Authorization: token });

    const ovr$ = this.http.get(apiUrl, { headers: headers });
    const cards$ = this.http.get(cardsUrl, { headers: headers });
    const injuries$ = this.http.get(injuriesUrl, { headers: headers });
    // const teamInfo$ = this.http.get(infoUrl, { headers: headers });

    return forkJoin({
      ovr: ovr$,
      cards: cards$,
      injuries: injuries$,
      // info: teamInfo$,
    });
  }

  lockedPlayers(team: any, token: string): Observable <any> {
    const lockedPlayersUrl = `https://play.metasoccer.com/api/2024/lockedPlayers/team/${team.id}`;

    const headers = new HttpHeaders({ Authorization: token });
    
    return this.http.get<any>(lockedPlayersUrl, { headers }).pipe(
      timeout(15000)
    );
  }

  
}
