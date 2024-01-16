import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { marketPlayerDTO } from '../models/market_player.dto';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private urlPlayerApi: string;

  constructor(private http: HttpClient) {
    this.urlPlayerApi = 'https://app.metasoccer.com/market/api/players/116365';
  }

  getPlayers(): Observable<marketPlayerDTO[]> {
    return this.http.get<marketPlayerDTO[]>(this.urlPlayerApi);
  }
}
