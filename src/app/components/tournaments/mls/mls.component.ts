import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { WalletDto } from 'src/app/models/walletProperties.dto';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { SharedService } from 'src/app/services/shared.service';
import { TeamService } from 'src/app/services/team.service';
import { TournamentsService } from 'src/app/services/tournament.service';
@Component({
  selector: 'app-mls',
  templateUrl: './mls.component.html',
  styleUrls: ['./mls.component.scss']
})
export class MlsComponent {
  manager: FormControl;
  address: FormControl;
  token: FormControl;
  tknForm: FormGroup;
  walletProperties: WalletDto;

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private tournamentsService: TournamentsService,
    private sharedService: SharedService,
    private teamService: TeamService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService
  ) {
    this.walletProperties = new WalletDto();
    this.manager = new FormControl('', [Validators.required]);
    this.address = new FormControl('', [Validators.required]);
    this.token = new FormControl('', [Validators.required]);

    this.tknForm = fb.group({
      manager: this.manager,
      address: this.address,
      token: this.token,
    });
  }

  teamProp: any;
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
  managers!: WalletDto[];

  ngOnInit() {
    this.getWallets();
    this.getData();
  }
  getData() {
    const cachedData = localStorage.getItem('teamData');
    const cachedTimestamp = localStorage.getItem('teamDataTimestamp');

    if (cachedData && cachedTimestamp) {
      try {
        const parsedData = JSON.parse(cachedData);
        this.lastUpdate = parseInt(cachedTimestamp, 10);

        const isDataRecent = Date.now() - this.lastUpdate < 86400000;

        // if (isDataRecent) {
        this.teamData = parsedData;
        this.loading = false;
        console.log('Using cached data.');
        this.getTodayResults();
        this.calculateTotalRewards();
        // } else {
        //   console.log('Cached data is older than a day. Fetching new data.');
        //   this.getAllGroups();
        // }
      } catch (error) {
        console.error('Error parsing cached data:', error);
        this.loading = false;
      }
    } else {
      this.getAllGroups();
    }
  }

  private getAllGroups() {
    this.getWallets();
    const requests: Observable<any>[] = this.teamProp.map((team: any) =>
      this.tournamentsService.getGroupData(team).pipe(
        mergeMap((groupData: any) => {
          const division = groupData.result.name;
          const matchingTeam = groupData.result.standings.rankedTeams.find(
            (rankedTeam: any) => rankedTeam.id === team.id
          );
          if (matchingTeam) {
            const foundManager: WalletDto | undefined = this.managers.find(
              (manager: WalletDto) => manager.manager === team.manager
            );

            const managerProperties: WalletDto = foundManager
              ? foundManager
              : { manager: '', address: '', token: '' };

            // const storedManager = localStorage.getItem(team.manager);
            // let managerProperties = [];
            // if (storedManager) {
            //   managerProperties = JSON.parse(storedManager);
            // }

            this.getSquadInfo(
              team.wallet
                ? team.wallet
                : '0x644FA8aa088caD5BcDf78bB0E7C1bF1cB399e475',
              team.id,
              managerProperties.token
            ).subscribe(
              (squadInfo: any) => {
                const lockedPlayers = squadInfo.injuries.result.lockedPlayers;
                const injuriesCount = lockedPlayers.filter(
                  (player: any) => player.reason === 'Injured'
                ).length;

                this.teamData.push({
                  id: team.id,
                  groupId: team.groupId,
                  manager: team.manager,
                  ovr: squadInfo.ovr.result.skill.overallSkill,
                  division: division,
                  clubName: team.name,
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
                  injuries: injuriesCount,
                  cards: [],
                  // notices: squadInfo.info.result.nextMatch.notices[0],
                });

                this.teamData.sort((a, b) =>
                  a.clubName.localeCompare(b.clubName)
                );
                localStorage.setItem('teamData', JSON.stringify(this.teamData));
                localStorage.setItem(
                  'teamDataTimestamp',
                  Date.now().toString()
                );
              },
              (error) => {
                console.error('Error fetching squad info:', error);
                // Handle the error appropriately
              }
            );
          } else {
            console.warn(`Team ID ${team.id} not found in API response`);
          }

          // Returning an observable to avoid blocking the next request
          return of({});
        })
      )
    );

    forkJoin(requests).subscribe(
      (responses: any) => {
        // localStorage.setItem('teamData', JSON.stringify(this.teamData));
        // localStorage.setItem('teamDataTimestamp', Date.now().toString());
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
    });
  }

  getExpectedReward(rewards: any[], div: string, pos: number) {
    const division = div.split(' ')[1];

    const divisionRewards = rewards.find(
      (reward) => reward.division === division
    );

    if (divisionRewards) {
      const position = pos.toString();
      const rewardAmount = divisionRewards.rewards[position];

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
    localStorage.removeItem('teamData');
    this.teamData = [];
    this.todayResults = { won: 0, tie: 0, lost: 0 };
    this.loading = true;
    this.getRewards();
    this.getAllGroups();
  }

  saveWallet(): void {
    this.walletProperties.address = this.address.value;
    this.walletProperties.token = this.token.value;
    this.walletProperties.manager = this.manager.value;

    this.getWallets();

    const existingManager = this.managers.find(
      (manager: WalletDto) => manager.address === this.walletProperties.address
    );

    if (existingManager) {
      existingManager.token = this.walletProperties.token;
    } else {
      this.managers.push(this.walletProperties);
    }

    localStorage.setItem('managers', JSON.stringify(this.managers));

    this.tknForm.reset();
  }

  getSquadInfo(
    teamWallet: string,
    teamId: string,
    token: string
  ): Observable<any> {
    return this.teamService.getSquadInfo(teamWallet, teamId, token).pipe(
      map((data: any) => {
        return data;
      }),
      catchError((error: any) => {
        console.error('Error fetching squad info:', error);
        return of(0);
      })
    );
  }

  getWallets(): void {
    this.managers = this.localStorageService.getWallets();
  }

}
