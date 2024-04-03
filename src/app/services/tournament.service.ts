import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TournamentsService {
  constructor(private http: HttpClient) {}

  getTeamIds(): Observable<any> {
    return this.http.get('/assets/teams/teams_id.json');
  }

  getGroupData(teamId: any): Observable<any> {
    const apiUrl = `https://api.metasoccer.com/msl/group/${teamId.groupId}`;
    return this.http.get(apiUrl).pipe(timeout(50000));
  }
}
