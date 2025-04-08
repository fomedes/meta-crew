import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { playerDTO } from 'src/app/models/player.dto';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit {
  players!: any[];
  filterForm!: FormGroup;
  filteredPlayers: playerDTO[] = [];

  constructor(private fb: FormBuilder, private playerService: PlayerService, private router: Router) {}

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

  private loadPlayers(): void {
    this.playerService.getPlayers().subscribe((response) => {
      if (response) {
        this.players = response;
        console.log('Players loaded successfully:', this.players);
      } else {
        console.error('Error loading players:', response.error);
      }
    });
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
