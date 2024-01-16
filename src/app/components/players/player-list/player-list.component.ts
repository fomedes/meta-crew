import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { marketPlayerDTO } from 'src/app/models/market_player.dto';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
  players!: marketPlayerDTO[];
  playerIds: number[] = [
    101737, 88548, 88547, 95853, 95854, 101330, 109296, 99052, 97428, 102252,
    99050, 102250, 107997, 100743, 99943, 111990, 109300, 102721, 107995,
    109302, 107996, 100742, 109297, 109301, 101329, 103178, 111184, 111185,
    111186, 111984, 111985, 111986, 111987, 111988, 111989, 115526, 115527,
    115528, 115529, 115624, 115625, 115626, 115627, 115717, 115718, 115719,
    115720, 115721, 115722, 115723, 115724, 115725, 115726, 115727, 115728,
    116146, 116147, 116145, 116148, 115804, 115805, 115806, 115807, 115978,
    115979, 115980, 115981, 115982, 115983, 115984, 115985, 115986, 115987,
    115988, 115989, 116045, 116046, 116047, 116048, 116137, 116138, 116139,
    116140, 116141, 116142, 116143, 116144, 116262, 116263, 116264, 116265,
    116351, 116352, 116353, 116354, 116355, 116356, 116357, 116358, 116362,
    116363, 116364, 116365,
  ];

  scoutIds: number[] = [7421, 5264, 2518, 5772];

  constructor(private PlayerService: PlayerService, private router: Router) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  private loadPlayers(): void {
    this.PlayerService.getPlayers().subscribe((response: any) => {
      if (response.success) {
        this.players = response.items;
        console.log(response);
      } else {
        console.error('Error loading players:', response.error);
      }
    });
  }
}
