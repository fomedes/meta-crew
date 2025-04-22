import { Injectable } from '@angular/core';
import { ApiMatchResponse, TeamConfig } from '../models/match_data.dto';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class DBMatchSavingService {
  constructor(private supabase: SupabaseService) {}

  async saveMatches(apiMatches: ApiMatchResponse[]): Promise<void> {
    for (const match of apiMatches) {
      try {
        // 1. Normalize team setups
        const homeConfigHash = await this.normalizeTeamSetup(match.team_home);
        const awayConfigHash = await this.normalizeTeamSetup(match.team_away);

        // 2. Store match data
        await this.storeMatch({
          team_home: { config_hash: homeConfigHash, internal_ovr: match.team_home.internal_ovr },
          team_away: { config_hash: awayConfigHash, internal_ovr: match.team_away.internal_ovr },
          result: match.result
        });
        
      } catch (error) {
        console.error('Error ingesting match:', error);
        // Implement retry logic here if needed
      }
    }
  }

  private async normalizeTeamSetup(config: TeamConfig): Promise<string> {
    const { data, error } = await this.supabase.client
      .from('team_setups')
      .upsert(
        {
          formation: config.formation,
          mentality: config.strategy.mentality,
          passing_style: config.strategy.passing,
          playzone: config.strategy.playzone,
          internal_ovr: config.internal_ovr
        },
        { onConflict: 'formation,mentality,passing_style,playzone' }
      )
      .select('config_hash')
      .single();

    if (error) throw new Error(`Setup normalization failed: ${error.message}`);
    return data.config_hash;
  }

  // Store normalized match data
  private async storeMatch(normalizedMatch: any): Promise<void> {
    const { error } = await this.supabase.client
      .from('matches')
      .insert([{
        team_home: normalizedMatch.team_home,
        team_away: normalizedMatch.team_away,
        result: normalizedMatch.result
      }]);

    if (error) throw new Error(`Match storage failed: ${error.message}`);
  }
}