import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { marketPlayerDTO } from "../models/market_player.dto";
import { playerDTO } from '../models/player.dto';

interface MarketFilter {
  filterOrderField: string;
  filterOrderType: string;
  filterOverallGTE: number;
  filterOverallLTE: number;
  filterPotentialGTE: number;
  filterPotentialLTE: number;
  filterAgeGTE: number;
  filterAgeLTE: number;
  filterSpecificRole: string;
  filterCovering: string;
  filterPlayerSpecialSkillCountGTE: number;
}

interface MarketRequest {
  filter: MarketFilter;
  order: {
    direction: string;
    field: string;
  };
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class PlayerMarketService {
  private apiUrl = 'https://play.metasoccer.com/api/2024/market/searchPlayers';

  constructor(private http: HttpClient) {}

  getSimilarPlayers(targetPlayer: playerDTO): Observable<marketPlayerDTO[]> {
    const requestBody: MarketRequest = this.createRequestBody(targetPlayer);

    console.log('Request Body:', requestBody)
    
    return this.http.post<{ items: marketPlayerDTO[] }>(this.apiUrl, requestBody).pipe(
      map(response => this.processResults(response.items, targetPlayer))
    );
  }

  private createRequestBody(targetPlayer: playerDTO): MarketRequest {
    return {
      filter: {
        filterOrderField: 'nft.currentPrice',
        filterOrderType: 'ASC',
        filterOverallGTE: Math.max(0, targetPlayer.overall - 3),
        filterOverallLTE: Math.min(100, targetPlayer.overall + 3),
        filterPotentialGTE: Math.max(0, targetPlayer.potential - 5),
        filterPotentialLTE: Math.min(100, targetPlayer.potential + 5),
        filterAgeGTE: Math.max(14, targetPlayer.age - 3),
        filterAgeLTE: Math.min(38, targetPlayer.age + 3),
        filterSpecificRole: targetPlayer.specific_role,
        filterCovering: targetPlayer.role,
        filterPlayerSpecialSkillCountGTE: targetPlayer.player_special_skills,
      },
      order: { 
        "direction": "ASC",
        "field": "nft.currentPrice" 
      },
      page: 1,
      pageSize: 10
    };
  }

  private processResults(players: marketPlayerDTO[], target: playerDTO): marketPlayerDTO[] {
    return players.filter(player => 
      player.nft?.currentPrice &&
      player.playerSpecialSkill.specialSkillCount === target.player_special_skills
    ).sort((a, b) => this.calculateSimilarityScore(b, target) - this.calculateSimilarityScore(a, target));
  }

  private calculateSimilarityScore(player: marketPlayerDTO, target: playerDTO): number {
    // New normalized differences based on filter ranges
    const overallDiff = 1 - Math.abs(player.overall - target.overall)/6; // Max diff 6 (3±3)
    const potentialDiff = 1 - Math.abs(player.potential - target.potential)/10; // Max diff 10 (5±5)
    const ageDiff = 1 - Math.abs(player.age - target.age)/6; // Max diff 6 (3±3)
    
    // Skills are exact match due to filtering, so always 1
    const skillDiff = 1;

    return (overallDiff * 0.4) + (potentialDiff * 0.3) + (ageDiff * 0.2) + (skillDiff * 0.1);
  }
}