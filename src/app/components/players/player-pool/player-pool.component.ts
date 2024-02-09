import { Component, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-player-pool',
  templateUrl: './player-pool.component.html',
  styleUrls: ['./player-pool.component.scss'],
})
export class PlayerPoolComponent implements OnInit {
  players: any[] = [];

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.playerService.getAuctionPlayers().subscribe((auctionPlayers) => {
      this.getDataById(auctionPlayers);
    });
  }

  getDataById(players: any[]) {
    players.forEach((player) => {
      if (player.id != 0) {
        this.playerService.getPlayerById(player.id).subscribe((playerData) => {
          const updatedPlayer = { ...player, ...playerData.result };
          console.log(updatedPlayer);
          this.players = [...this.players, updatedPlayer];
        });
      }
    });
  }
}
