import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent implements OnInit {
  teamId!: string;
  teamPlayers!: Observable<any[]>;
  teamData!: any;
  players!: any[];
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.teamId = params['id'];

      this.teamService.getTeamPlayers(this.teamId).subscribe(
        (data) => {
          this.teamPlayers = data;
          this.players = data.result.players;
          console.log(this.players);
        },
        (error) => {
          // Handle errors if any
          console.error(error);
        }
      );

      const cachedData = localStorage.getItem('teamData');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);

        this.teamData = parsedData.find(
          (entry: any) => entry.id === this.teamId
        );

        if (this.teamData) {
          console.log(this.teamData);
        } else {
          console.log(`Team with ID ${this.teamId} not found in cached data`);
        }
      } else {
        console.log(`There is no data stored`);
      }
    });
  }
}
