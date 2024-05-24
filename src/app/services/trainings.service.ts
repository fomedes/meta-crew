import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrainingsService {
  constructor(private http: HttpClient) {}
  getLastDrills(teamId: string, token: string): Observable<any> {
    const apiUrl = `https://api.metasoccer.com/training/${teamId}/last`;
    const headers = new HttpHeaders({ Authorization: token });
    return this.http.get(apiUrl, { headers: headers }).pipe(timeout(15000));
  }

  executeTraining(teamId: string, token: string, drills: any): Observable<any> {
    const apiUrl = `https://api.metasoccer.com/training/${teamId}/execute-plan`;
    const headers = new HttpHeaders({ Authorization: token });
    return this.http
      .post(apiUrl, drills, { headers: headers })
      .pipe(timeout(15000));
  }
}
