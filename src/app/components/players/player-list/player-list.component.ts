import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { playerDTO } from 'src/app/models/player.dto';
import { WalletDto } from 'src/app/models/walletProperties.dto';
import { PlayerService } from 'src/app/services/player.service';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit {
  players!: any[];
  filterForm!: FormGroup;
  filteredPlayers: playerDTO[] = [];
  wallets: WalletDto[] = [];
  // defaultWallet: string = '0x644fa8aa088cad5bcdf78bb0e7c1bf1cb399e475';
  isLoading = false;
  errorMessage: string | null = null;
  

  constructor(
    private fb: FormBuilder, 
    private supabase: SupabaseService,
    private playerService: PlayerService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      role: [null],
      foot: [null],
      ovrMin: [0],
      potMin: [0]
    });

    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.filterPlayers());

    this.loadPlayers();
  }

  private async loadPlayers(): Promise<void> {
    // this.playerService.getPlayers(this.defaultWallet).subscribe((response) => {
    //   if (response) {
    //     this.players = response;
    //     console.log('Players loaded successfully:', this.players);
    //   } else {
    //     console.error('Error loading players:', response.error);
    //   }
    // });
    this.isLoading = true;
    this.errorMessage = null;
    
    try {
      this.players = await this.supabase.getAllPlayers();
      
      
      // this.players = players.map(player => ({
      //   ...player,
      //   // // Map any necessary fields to match your playerDTO structure
      //   // preferredFoot: this.mapFootValue(player.preferred_foot),
      //   // // Add other mappings if needed
      // }));
      
      this.filteredPlayers = this.players;
      console.log('Players loaded successfully from Supabase:', this.filteredPlayers);
    } catch (error) {
      console.error('Error loading players from Supabase:', error);
      this.errorMessage = 'Failed to load players. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  filterPlayers() {
    const filters = this.filterForm.value;
    this.filteredPlayers = this.players.filter(player => {
      return (
        (!filters.role || player.role === filters.role) &&
        (!filters.foot || player.preferredFoot?.toString() === filters.foot) &&
        player.overall >= filters.ovrMin &&
        player.potential >= filters.potMin
      );
    });
  }

  resetFilters() {
    this.filterForm.reset({
      role: null,
      foot: null,
      ovrMin: 0,
      potMin: 0
    });
  }
}
