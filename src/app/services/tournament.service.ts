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

  getGroupData(teamId: any): Observable<any> {
    const apiUrl = `https://api.metasoccer.com/msl/group/${teamId.groupId}`;
    if (!teamId.groupId) {
      return of(null);
    }
    return this.http.get(apiUrl).pipe(timeout(60000));
  }
}
