import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
  players!: any[];

  constructor(private playerService: PlayerService, private router: Router) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  private loadPlayers(): void {
    this.playerService.getPlayers().subscribe((response) => {
      if (response.success) {
        this.players = response.result.players;
      } else {
        console.error('Error loading players:', response.error);
      }
    });
  }
}
