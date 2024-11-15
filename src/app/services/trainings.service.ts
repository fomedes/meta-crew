import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrainingsService {
  constructor(private http: HttpClient) {}
  getLastDrills(teamId: string, token: string): Observable<any> {
    // const apiUrl = `https://api.metasoccer.com/training/${teamId}/last`;
    const apiUrl = `https://manag3r.metasoccer.com/api/2024/trainingsHistory/team/${teamId}`;
    const headers = new HttpHeaders({ Authorization: token });
    return this.http.get(apiUrl, { headers: headers }).pipe(timeout(15000));
  }

  executeTraining(teamId: string, token: string, payload: any): Observable<any> {
    const apiUrl = `https://manag3r.metasoccer.com/api/2024/trainings/executePlan`;
    const headers = new HttpHeaders({ Authorization: token });
    return this.http
      .post(apiUrl, payload, { headers: headers })
      .pipe(timeout(15000));
  }

  playPve(token: string, payload: any):
  Observable<any> {
    const apiUrl = `https://manag3r.metasoccer.com/api/2024/play/pve`;
    const headers = new HttpHeaders({ Authorization: token });
    return this.http
      .post(apiUrl, payload, { headers: headers })
      .pipe(timeout(15000));
  }
}
