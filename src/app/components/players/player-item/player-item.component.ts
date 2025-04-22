import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { playerDTO } from 'src/app/models/player.dto';
import { PlayerMarketService } from 'src/app/services/market_player.service';
import { SupabaseService } from 'src/app/services/supabase.service';

interface MarketAnalysis {
  minPrice: number;
  recommendedPrice: number;
  averagePrice: number;
  playerCount: number;
  priceDistribution: number[];
}

@Component({
  selector: 'app-player-item',
  templateUrl: './player-item.component.html',
  styleUrls: ['./player-item.component.scss']
})
export class PlayerItemComponent implements OnInit {
  player!: playerDTO;
  isLoading = true;

  marketAnalysis: any;
  marketLoading = false;
  priceError?: string;
  
  // Ability arrays for template iteration
  conditionAbilities: any[] = [];
  technicalAbilities: any[] = [];
  tacticalAbilities: any[] = [];
  goalkeepingAbilities: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private marketService: PlayerMarketService,
    private supabase: SupabaseService
  ) {}

  ngOnInit(): void {
    const playerId = this.route.snapshot.paramMap.get('id');
    if (playerId) {
      this.loadPlayer(+playerId);
    }
  }

  async loadPlayer(playerId: number): Promise<void> {
    this.isLoading = true;
    try {
      const playerData = await this.supabase.getPlayerById(playerId);
      
      if (playerData) {
        this.player = playerData;
        this.prepareAbilityData();
        console.log('Player loaded successfully:', this.player);
        await this.analyzeMarketPrices();
      }
    } catch (error) {
      console.error('Error loading player:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private prepareAbilityData(): void {
    // Condition Abilities
    this.conditionAbilities = [
      { name: 'Fitness', value: this.player.condition_abilities.fitness, potential: this.player.condition_abilities.fitness_potential },
      { name: 'Strength', value: this.player.condition_abilities.strength, potential: this.player.condition_abilities.strength_potential },
      { name: 'Speed', value: this.player.condition_abilities.speed, potential: this.player.condition_abilities.speed_potential },
      { name: 'Concentration', value: this.player.condition_abilities.concentration, potential: this.player.condition_abilities.concentration_potential },
      { name: 'Aggression', value: this.player.condition_abilities.aggression, potential: this.player.condition_abilities.aggression_potential },
      { name: 'Creativity', value: this.player.condition_abilities.creativity, potential: this.player.condition_abilities.creativity_potential }
    ];

    // Technical Abilities
    this.technicalAbilities = [
      { name: 'Passing', value: this.player.technical_abilities.passing, potential: this.player.technical_abilities.passing_potential },
      { name: 'Dribbling', value: this.player.technical_abilities.dribbling, potential: this.player.technical_abilities.dribbling_potential },
      { name: 'Crossing', value: this.player.technical_abilities.crossing, potential: this.player.technical_abilities.crossing_potential },
      { name: 'Shooting', value: this.player.technical_abilities.shooting, potential: this.player.technical_abilities.shooting_potential },
      { name: 'Finishing', value: this.player.technical_abilities.finishing, potential: this.player.technical_abilities.finishing_potential },
      { name: 'Heading', value: this.player.technical_abilities.heading, potential: this.player.technical_abilities.heading_potential }
    ];

    // Tactical Abilities
    this.tacticalAbilities = [
      { name: 'Vision', value: this.player.tactical_abilities.vision, potential: this.player.tactical_abilities.vision_potential },
      { name: 'Bravery', value: this.player.tactical_abilities.bravery, potential: this.player.tactical_abilities.bravery_potential },
      { name: 'Positioning', value: this.player.tactical_abilities.positioning, potential: this.player.tactical_abilities.positioning_potential },
      { name: 'Marking', value: this.player.tactical_abilities.marking, potential: this.player.tactical_abilities.marking_potential },
      { name: 'Sliding Tackle', value: this.player.tactical_abilities.sliding_tackle, potential: this.player.tactical_abilities.sliding_tackle_potential },
      { name: 'Standing Tackle', value: this.player.tactical_abilities.standing_tackle, potential: this.player.tactical_abilities.standing_tackle_potential }
    ];

    // Goalkeeping Abilities (only for goalkeepers)
    this.goalkeepingAbilities = [
      { name: 'Diving', value: this.player.goalkeeping_abilities.diving, potential: this.player.goalkeeping_abilities.diving_potential },
      { name: 'Handling', value: this.player.goalkeeping_abilities.handling, potential: this.player.goalkeeping_abilities.handling_potential },
      { name: 'Kicking', value: this.player.goalkeeping_abilities.kicking, potential: this.player.goalkeeping_abilities.kicking_potential },
      { name: 'Punching', value: this.player.goalkeeping_abilities.punching, potential: this.player.goalkeeping_abilities.punching_potential },
      { name: 'Throwing', value: this.player.goalkeeping_abilities.throwing, potential: this.player.goalkeeping_abilities.throwing_potential },
      { name: 'Reflexes', value: this.player.goalkeeping_abilities.reflexes, potential: this.player.goalkeeping_abilities.reflexes_potential }
    ];    
  }

  private async analyzeMarketPrices(): Promise<void> {
    this.marketLoading = true;
    this.priceError = undefined;
    
    try {
      const response = await this.marketService.getSimilarPlayers(this.player).toPromise();
      
      if (response?.length) {
        const validPlayers = response.filter(p => 
          p.nft?.currentPrice && 
          this.isValidComparison(p)
        );

        if (validPlayers.length > 0) {
          this.marketAnalysis = this.calculateMarketAnalysis(validPlayers);
          console.log('market Analysis: ', this.marketAnalysis)
        } else {
          this.priceError = 'No valid comparable players found';
        }
      } else {
        this.priceError = 'No market data available';
      }
    } catch (error) {
      console.error('Market analysis error:', error);
      this.priceError = 'Failed to analyze market data';
    } finally {
      this.marketLoading = false;
    }
  }

  private isValidComparison(player: any): boolean {
    return Math.abs(player.overall - this.player.overall) <= 3 &&
           Math.abs(player.potential - this.player.potential) <= 5 &&
           Math.abs(player.age - this.player.age) <= 3 &&
           player.playerSpecialSkill.specialSkillCount === this.player.player_special_skills;
  }

  private calculateMarketAnalysis(players: any[]): MarketAnalysis {
    const prices = players.map(p => p.nft.currentPrice).filter(price => price > 0);
    const minPrice = Math.min(...prices);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    // Weighted average (older players get 5% discount per year over 25)
    const weightedPrices = prices.map((price, index) => {
      const playerAge = players[index].age;
      return playerAge > 25 ? price * (0.95 ** (playerAge - 25)) : price;
    });
    
    const recommendedPrice = Math.max(
      minPrice * 0.95, // Never undercut by more than 5%
      weightedPrices.reduce((a, b) => a + b, 0) / weightedPrices.length
    );

    return {
      minPrice,
      recommendedPrice: Number(recommendedPrice.toFixed(2)),
      averagePrice: Number(averagePrice.toFixed(2)),
      playerCount: prices.length,
      priceDistribution: prices.sort((a, b) => a - b)
    };
  }


}