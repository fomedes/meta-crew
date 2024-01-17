import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin, from } from 'rxjs';
import { mergeMap, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.scss'],
  providers: [DatePipe],
})
export class TournamentsComponent implements OnInit {
  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  teamIds: any;
  teamData: any[] = [];
  groupData: any[] | undefined = [];
  loading = true;
  lastUpdate: number | undefined;

  ngOnInit() {
    this.http.get('/assets/teams/teams_id.json').subscribe((data) => {
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
        } else {
          console.log('Cached data is older than an hour. Fetching new data.');
          this.makeHttpRequests();
        }
      } catch (error) {
        console.error('Error parsing cached data:', error);
        this.loading = false;
      }
    } else {
      this.makeHttpRequests();
    }
  }

  private makeHttpRequests() {
    const requests: Observable<any>[] = this.teamIds.map((teamId: any) => {
      const apiUrl = `https://api.metasoccer.com/msl/group/${teamId.groupId}`;
      return this.http
        .get(apiUrl)
        .pipe(timeout(15000))
        .pipe(
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
                clubName: matchingTeam.clubName,
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

            // Returning a dummy observable to avoid blocking the next request
            return from([{}]);
          })
        );
    });

    forkJoin(requests).subscribe(
      (responses: any) => {
        this.teamData.sort((a, b) => a.clubName.localeCompare(b.clubName));
        localStorage.setItem('teamData', JSON.stringify(this.teamData));
        localStorage.setItem('teamDataTimestamp', Date.now().toString());
        this.loading = false;
        this.lastUpdate = Date.now();
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
}
