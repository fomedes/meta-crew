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
  loading = true;
  lastUpdate: number | undefined;
  todayResults: { won: number; tie: number; lost: number } = {
    won: 0,
    tie: 0,
    lost: 0,
  };

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

        const isDataRecent = Date.now() - this.lastUpdate < 3600000;

        console.log(this.lastUpdate);
        if (isDataRecent) {
          this.teamData = parsedData;
          this.loading = false;
          console.log('Using cached data.');
          this.getTodayResults();
        } else {
          console.log('Cached data is older than an hour. Fetching new data.');
          this.getAllGroups();
        }
      } catch (error) {
        console.error('Error parsing cached data:', error);
        this.loading = false;
      }
    } else {
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
            });
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

    console.log(this.todayResults);
  }
}
