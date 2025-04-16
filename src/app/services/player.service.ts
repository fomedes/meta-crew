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
    this.urlPlayerApi = 'https://play.metasoccer.com/api/2024/players/owner/';
    this.ownedPlayers = 'owner/0x644fa8aa088cad5bcdf78bb0e7c1bf1cb399e475';
  }

  getPlayers(address: string): Observable<any> {
    return this.http.get(this.urlPlayerApi + address);
  }
  getAuctionPlayers(): Observable<any> {
    return this.http.get(this.jsonFilePath);
  }

  getPlayerById(id: number): Observable<any> {
    return this.http.get(this.urlPlayerApi + id);
  }
}
