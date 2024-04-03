import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { SharedService } from 'src/app/services/shared.service';
import { TournamentsService } from 'src/app/services/tournament.service';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.scss'],
})
export class TournamentsComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private tournamentsService: TournamentsService,
    private sharedService: SharedService
  ) {}

  teamIds: any;
  teamData: any[] = [];

  groupData: any[] | undefined = [];
  rewards!: any[];
  loading = true;
  lastUpdate: number | undefined;
  todayResults: { won: number; tie: number; lost: number } = {
    won: 0,
    tie: 0,
    lost: 0,
  };
  totalRewards!: number;

  ngOnInit() {
    this.tournamentsService.getTeamIds().subscribe((data) => {
      this.teamIds = data;
      this.getData();
    });
  }
  getData() {
    const cachedData = localStorage.getItem('teamData');
    const cachedTimestamp = localStorage.getItem('teamDataTimestamp');

    if (cachedData && cachedTimestamp) {
      try {
        const parsedData = JSON.parse(cachedData);
        this.lastUpdate = parseInt(cachedTimestamp, 10);

        const isDataRecent = Date.now() - this.lastUpdate < 86400000;

        console.log(this.lastUpdate);
        if (isDataRecent) {
          this.teamData = parsedData;
          this.loading = false;
          console.log('Using cached data.');
          this.getTodayResults();
          this.calculateTotalRewards();
        } else {
          console.log('Cached data is older than a day. Fetching new data.');
          this.getRewards();
          this.getAllGroups();
        }
      } catch (error) {
        console.error('Error parsing cached data:', error);
        this.loading = false;
      }
    } else {
      this.getRewards();
      this.getAllGroups();
    }
  }

  private getAllGroups() {
    const requests: Observable<any>[] = this.teamIds.map((teamId: any) =>
      this.tournamentsService.getGroupData(teamId).pipe(
        mergeMap((groupData: any) => {
          const division = groupData.result.name;
          const matchingTeam = groupData.result.standings.rankedTeams.find(
            (team: any) => team.id === teamId.id
          );

          if (matchingTeam) {
            this.teamData.push({
              id: teamId.id,
              groupId: teamId.groupId,
              manager: teamId.manager,
              ovr: teamId.ovr,
              division: division,
              clubName: teamId.name,
              position: matchingTeam.position,
              played: matchingTeam.played,
              won: matchingTeam.won,
              tied: matchingTeam.tied,
              lost: matchingTeam.lost,
              goalsForward: matchingTeam.goalsForward,
              goalsAgainst: matchingTeam.goalsAgainst,
              goalsDifference: matchingTeam.goalsDifference,
              points: matchingTeam.points,
              lastMatches: matchingTeam.lastMatches,
              expectedReward: this.getExpectedReward(
                this.rewards,
                division,
                matchingTeam.position
              ),
            });
            localStorage.setItem('teamData', JSON.stringify(this.teamData));
            localStorage.setItem('teamDataTimestamp', Date.now().toString());
          } else {
            console.warn(`Team ID ${teamId.id} not found in API response`);
          }

          // Returning an observable to avoid blocking the next request
          return of({});
        })
      )
    );

    forkJoin(requests).subscribe(
      (responses: any) => {
        this.teamData.sort((a, b) => a.clubName.localeCompare(b.clubName));
        localStorage.setItem('teamData', JSON.stringify(this.teamData));
        localStorage.setItem('teamDataTimestamp', Date.now().toString());
        this.loading = false;
        this.lastUpdate = Date.now();
        this.getTodayResults();
        this.calculateTotalRewards();
      },
      (error: any) => {
        console.error('Error in one or more API requests:', error);
        // Hide spinner even if there's an error
        this.loading = false;
      }
    );
  }
  formatTimestamp(timestamp: number): string {
    return this.datePipe.transform(timestamp ?? Date.now(), 'medium') ?? 'N/A';
  }

  navigationTo(route: string): void {
    this.sharedService.navigationTo(route);
  }

  getTodayResults() {
    const results = this.teamData.map((team: any) => {
      // Check if 'lastMatches' is an array and not empty
      if (Array.isArray(team.lastMatches) && team.lastMatches.length > 0) {
        return team.lastMatches[team.lastMatches.length - 1];
      } else {
        return null;
      }
    });
    results.forEach((result: 'won' | 'tie' | 'lost' | null) => {
      if (result !== null) {
        this.todayResults[result]++;
      }
    });
  }

  getRewards() {
    this.http.get<any[]>('assets/teams/mlsRewards.json').subscribe((data) => {
      this.rewards = data;
      console.log(this.rewards);
    });
  }

  getExpectedReward(rewards: any[], div: string, pos: number) {
    // Extract the division from the team data
    const division = div.split(' ')[1]; // Extracting "C" from "Division C"
    console.log(division);

    // Find the corresponding rewards for the division
    const divisionRewards = rewards.find(
      (reward) => reward.division === division
    );

    // If divisionRewards is found, get the reward amount for the given position
    if (divisionRewards) {
      const position = pos.toString();
      console.log(position);
      const rewardAmount = divisionRewards.rewards[position];
      console.log(rewardAmount);

      return rewardAmount !== undefined
        ? rewardAmount
        : 'Position not found in rewards';
    } else {
      return 'Division not found in rewards';
    }
  }

  calculateTotalRewards(): void {
    this.totalRewards = this.teamData.reduce(
      (sum, team) => sum + team.expectedReward,
      0
    );
  }

  updateData(): void {
    this.teamData = [];
    this.todayResults = { won: 0, tie: 0, lost: 0 };
    this.getRewards();
    this.getAllGroups();
  }

  getSquadInfo() {}
}
