import { Component } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { PlayerService } from 'src/app/services/player.service';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
})
export class AdminPanelComponent {
  isLoading = false;

  players: any[] | null = null;
  errorMessage: string | null = null;
  progress = 0;
  totalPlayers = 0;

  constructor(private playerService: PlayerService, private supabase: SupabaseService) {}

  async updatePlayerDB(){
    this.isLoading = true;
    this.errorMessage = null;
    this.players = null;
    this.progress = 0;

    try {
      const players$ = this.playerService.getPlayers();
      this.players = await lastValueFrom(players$)
      
      if (!this.players || this.players.length === 0) {
        throw new Error('No players found in API response');
      }

      this.totalPlayers = this.players.length;
      const insertedPlayers = [];

      for (const player of this.players) {
        try {
          // Check if player exists
          const exists = await this.supabase.playerExists(player.id);
          if (exists) {
            console.log(`Player ${player.id} already exists, skipping...`);
            this.progress++;
            continue;
          }

          // Insert main player data
          const insertedPlayer = await this.supabase.insertPlayer({
            id: player.id,
            name: player.name,
            last_name: player.lastName,
            age: player.age,
            role: player.role,
            specific_role: player.specificRole,
            overall: player.overall,
            potential: player.potential,
            preferred_foot: this.getPreferredFoot(player.preferredFoot),
            image_url: player.imageName,
            height: player.height,
            weight: player.weight,
            market_price: 0,
            player_special_skills: player.specialAbilities?.length || 0,
            player_skill_1:player.specialAbilities?.[0] || '',
            player_skill_2:player.specialAbilities?.[1] || ''
          });

          await this.insertRelatedData(player);
          
          insertedPlayers.push(insertedPlayer);
          this.progress++;
          
        } catch (err) {
          console.error(`Error processing player ${player.id}:`, err);
        }
      }

      console.log('Successfully inserted:', insertedPlayers);
      this.players = insertedPlayers;

    } catch (err) {
      // this.errorMessage = err;
      console.error('Update failed:', err);
    } finally {
      this.isLoading = false;
    }
  }

  private async insertRelatedData(player: any) {
    // Condition Abilities
    await this.supabase.insertConditionAbilities({
      player_id: player.id,
      overall: player.sections.condition.overall,
      fitness: player.sections.condition.abilities.Fitness,
      strength: player.sections.condition.abilities.Strength,
      speed: player.sections.condition.abilities.Speed,
      creativity: player.sections.condition.abilities.Creativity,
      concentration: player.sections.condition.abilities.Concentration,
      aggression: player.sections.condition.abilities.Aggression,

    });

    // Tactical Abilities
    await this.supabase.insertTacticalAbilities({
      player_id: player.id,
      overall: player.sections.tactical.overall,
      standing_tackle: player.sections.tactical.abilities['Standing Tackle'],
      sliding_tackle: player.sections.tactical.abilities['Sliding Tackle'],
      marking: player.sections.tactical.abilities.Marking,
      positioning: player.sections.tactical.abilities.Positioning,
      vision: player.sections.tactical.abilities.Vision,
      bravery: player.sections.tactical.abilities.Bravery,
    });

    // Technical Abilities
    await this.supabase.insertTechnicalAbilities({
      player_id: player.id,
      overall: player.sections.technical.overall,
      passing: player.sections.technical.abilities.Passing,
      dribbling: player.sections.technical.abilities.Dribbling,
      crossing: player.sections.technical.abilities.Crossing,
      shooting: player.sections.technical.abilities.Shooting,
      finishing: player.sections.technical.abilities.Finishing,
      heading: player.sections.technical.abilities.Heading,
    });

    // Goalkeeping Abilities
    await this.supabase.insertGoalkeepingAbilities({
      player_id: player.id,
      overall: player.sections.goalkeeping.overall,
      diving: player.sections.goalkeeping.abilities.Diving,
      handling: player.sections.goalkeeping.abilities.Handling,
      kicking: player.sections.goalkeeping.abilities.Kicking,
      punching: player.sections.goalkeeping.abilities.Punching,
      throwing: player.sections.goalkeeping.abilities.Throwing,
      reflexes: player.sections.goalkeeping.abilities.Reflexes,
    });
  }

  private getPreferredFoot(footIndex: number) {
      const footOutput = ['Right', 'Left', 'Both']

      if (footIndex!) {
        console.warn(`Unknown foot value: ${footIndex}`)
        return ''
      }

      return footOutput[footIndex]      
  }
}
