import { Component } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
})
export class AdminPanelComponent {
  playerId!: number;

  constructor(private playerService: PlayerService) {}

  addPlayer() {}

  sellPlayer() {}
}
