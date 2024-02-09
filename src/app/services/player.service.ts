import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private jsonFilePath = 'assets/db/auctionPlayers.json';
  private urlPlayerApi: string;
  private ownedPlayers: string;

  constructor(private http: HttpClient) {
    this.urlPlayerApi = 'https://api.metasoccer.com/v2/players/';
    this.ownedPlayers = 'owned/0x644FA8aa088caD5BcDf78bB0E7C1bF1cB399e475';
  }

  getPlayers(): Observable<any> {
    return this.http.get(this.urlPlayerApi + this.ownedPlayers);
  }
  getAuctionPlayers(): Observable<any> {
    return this.http.get(this.jsonFilePath);
  }

  getPlayerById(id: number): Observable<any> {
    return this.http.get(this.urlPlayerApi + id);
  }
}
