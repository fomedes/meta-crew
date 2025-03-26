import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TournamentsService {
  constructor(private http: HttpClient) {}

  getTeamProp(): Observable<any> {
    return this.http.get('/assets/teams/teams_id.json');
  }

  getGroupData(team: any): Observable<any> {
    const apiUrl = `https://play.metasoccer.com/api/2024/msl?teamId=${team.id}`;
    if (!team.id) {
      return of(null);
    }
    return this.http.get(apiUrl).pipe(timeout(180000));
  }
}
