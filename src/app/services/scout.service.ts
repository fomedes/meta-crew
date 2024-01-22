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
      'https://api.metasoccer.com/v2/scouts/owned/0x644FA8aa088caD5BcDf78bB0E7C1bF1cB399e475';
  }

  getScouts(): Observable<any> {
    return this.http.get(this.urlScoutApi);
  }
}
