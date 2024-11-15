import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScoutService {
  private urlScoutApi: string;

  constructor(private http: HttpClient) {
    this.urlScoutApi =
      'https://manag3r.metasoccer.com/api/2024/scouts/owner/0x644fa8aa088cad5bcdf78bb0e7c1bf1cb399e475?includeScoutings=true';
  }

  getScouts(): Observable<any> {
    return this.http.get(this.urlScoutApi);
  }
}
