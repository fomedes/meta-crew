import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { WalletDto } from 'src/app/models/walletProperties.dto';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { PlayerService } from 'src/app/services/player.service';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
})
export class AdminPanelComponent implements OnInit {
  isLoading = false;

  wallets: WalletDto[] = [];
  isDbUpdated = false

  globalError: string | null = null;

  constructor(
    private playerService: PlayerService, 
    private localStorageService: LocalStorageService, 
    private supabase: SupabaseService) {}


  ngOnInit(): void {
    this.getWallets()
  }  

  private getWallets(): void {
    const storedWallets = this.localStorageService.getWallets();
    this.wallets = storedWallets.map(wallet => ({
      ...wallet,
      loading: false,
      progress: 0,
      totalPlayers: 0,
      players: [],
      error: undefined
    }));
  }

  async updatePlayerDB() {
    this.globalError = null;
    this.isLoading = true;

    for (const wallet of this.wallets) {
      try {
        await this.processWallet(wallet);
      } catch (err) {
        console.error(`Failed to process wallet ${wallet.address}:`, err);
        // wallet.error = err;
      }
    }

    this.isLoading = false;
  }

  private async processWallet(wallet: any) {
    wallet.loading = true;
    wallet.error = undefined;
    wallet.players = [];
    wallet.progress = 0;

    try {
      const players$ = this.playerService.getPlayers(wallet.address);
      const players = await lastValueFrom(players$);
      
      if (!players?.length) {
        wallet.error = 'No players found in this wallet';
        return;
      }

      wallet.totalPlayers = players.length;

      for (const player of players) {
        try {
          const exists = await this.supabase.playerExists(player.id);
          if (exists) {
            console.log(`Player ${player.id} exists, skipping...`);
            wallet.progress++;
            continue;
          }
          console.log(player)
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
            player_skill_1: player.specialAbilities?.[0] || '',
            player_skill_2: player.specialAbilities?.[1] || '',
            owner: wallet.address
          });

          await this.insertAbilitiesData(player);
          wallet.players.push(insertedPlayer);
          
        } catch (err) {
          console.error(`Error processing player ${player.id}:`, err);
        } finally {
          wallet.progress++;
        }
      }

    } catch (err) {
      wallet.error = err;
      throw err;
    } finally {
      wallet.loading = false;
      this.isDbUpdated = true
    }
  }

  private async insertAbilitiesData(player: any) {
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

      if (![0, 1, 2].includes(footIndex)) {
        console.warn(`Unknown foot value: ${footIndex}`)
        return ''
      }

      return footOutput[footIndex]      
  }
}
