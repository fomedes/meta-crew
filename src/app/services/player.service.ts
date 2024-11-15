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
    this.urlPlayerApi = 'https://manag3r.metasoccer.com/api/2024/players/';
    this.ownedPlayers = 'owner/0x644fa8aa088cad5bcdf78bb0e7c1bf1cb399e475';
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
