import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { WalletDto } from 'src/app/models/walletProperties.dto';
import { FormatStreakPipe } from 'src/app/pipes/format-streak.pipe';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { SharedService } from 'src/app/services/shared.service';
import { TeamService } from 'src/app/services/team.service';
import { TournamentsService } from 'src/app/services/tournament.service';

// Interface declarations
interface Team {
  id: string;
  groupId: string;
  manager: string;
  ovr: number;
  division: string;
  clubName: string;
  position: number;
  played: number;
  won: number;
  tied: number;
  lost: number;
  goalsForward: number;
  goalsAgainst: number;
  goalsDifference: number;
  points: number;
  lastMatches: ('won' | 'tie' | 'lost')[];
  // expectedReward: number;
  injuries: number;
  cards: any[];
  notices?: string;
}

interface SquadInfo {
  injuries: {
    result: {
      lockedPlayers: any[];
    };
  };
  ovr: {
    result: {
      skill: {
        overallSkill: number;
      };
    };
  };
}

const CACHE_EXPIRY_MS = 86400000; // 24 hours
const DEFAULT_WALLET = '0x644FA8aa088caD5BcDf78bB0E7C1bF1cB399e475';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.scss'],
  providers: [DatePipe, FormatStreakPipe]
})
export class TournamentsComponent implements OnInit {
  tknForm: FormGroup;
  walletProperties: WalletDto = new WalletDto();
  teamData: Team[] = [];
  loading = true;
  lastUpdate?: number;
  todayResults = { won: 0, tie: 0, lost: 0 };
  totalRewards = 0;
  managers: WalletDto[] = [];
  rewards: any[] = [];

  manager = new FormControl('', [Validators.required]);
  address = new FormControl('', [Validators.required]);
  token = new FormControl('', [Validators.required]);

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private tournamentsService: TournamentsService,
    private sharedService: SharedService,
    private teamService: TeamService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService
  ) {
    this.tknForm = this.fb.group({
      manager: this.manager,
      address: this.address,
      token: this.token,
    });
  }

  teamProp: any

  ngOnInit() {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.tournamentsService.getTeamProp().subscribe({
      next: (data) => {
        this.teamProp = data.filter((team: any) => team.groupId);
        this.loadInitialData();
      },
      error: (error) => this.handleError('Failed to load team properties', error)
    });
  }

  private loadInitialData(): void {
    const [cachedData, cachedTimestamp] = this.getCachedData();
    
    if (cachedData && this.isCacheValid(cachedTimestamp)) {
      console.log('use cached data')
      this.handleCachedData(cachedData, cachedTimestamp);
    } else {
      console.log('fetch all data')
      this.fetchAllData();
    }
  }

  private getCachedData(): [any, number] {
    try {
      const data = localStorage.getItem('teamData');
      const timestamp = localStorage.getItem('teamDataTimestamp');
      return [JSON.parse(data || '[]'), parseInt(timestamp || '0', 10)];
    } catch (error) {
      console.error('Cache parsing error:', error);
      return [[], 0];
    }
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_EXPIRY_MS;
  }

  private handleCachedData(data: any, timestamp: number): void {
    this.teamData = data;
    this.lastUpdate = timestamp;
    this.updateResults();
    this.loading = false;
  }

  private fetchAllData(): void {
    this.getWallets();
    this.fetchRewards();
    this.processTeamData();
  }

  private processTeamData(): void {
    const requests = this.teamProp.map((team: any) =>
      this.tournamentsService.getGroupData(team).pipe(
        mergeMap((groupData: any) => this.processGroupData(team, groupData)),
        catchError(error => this.handleTeamError(team, error))
      )
    );

    forkJoin<Array<Team | undefined>>(requests).subscribe({
      next: (results: (Team | undefined)[]) => {
        this.teamData = results.filter((team): team is Team => !!team);
        this.handleDataSuccess();
      },
      error: (error) => this.handleDataError(error)
    });
  }

  private processGroupData(team: any, groupData: any): Observable<Team> { 
    const matchingTeam = groupData.currentEdition.userGroup.standings.find(
      (t: any) => t.id === team.id
    );
    const userGroup = {
      'groupId': groupData.currentEdition.userGroup.groupId, 
      'groupName': groupData.currentEdition.userGroup.groupName
    }
    const nextMatch = groupData.currentEdition.userGroup.nextMatch
  
    if (!matchingTeam) {
      console.warn(`Team ID ${team.id} not found in this group`);
      return of(); 
    }
  
    return this.getSquadInfo(
      team.wallet || DEFAULT_WALLET,
      team.id,
      this.getManagerToken(team.manager)
    ).pipe(
      map((squadInfo: SquadInfo) => this.createTeamEntry(team, groupData, matchingTeam, squadInfo))
    );
  }

  private getManagerToken(manager: string): string {
    const foundManager = this.managers.find(m => m.manager === manager);
    return foundManager?.token || '';
  }

  private createTeamEntry(team: any, groupData: any, matchingTeam: any, squadInfo: SquadInfo): Team {
    const injuriesCount = squadInfo.injuries.result.lockedPlayers
      .filter((player: any) => player.reason === 'Injured').length;

      const newTeam = {
        id: team.id,
        groupId: groupData.currentEdition.userGroup.groupId,
        manager: team.manager,
        ovr: squadInfo.ovr.result.skill.overallSkill,
        division: groupData.currentEdition.userGroup.groupName,
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
        // expectedReward: this.calculateReward(matchingTeam.position, groupData.result.name),
        injuries: injuriesCount,
        cards: []
      };
      
      console.log('Created team:', newTeam);
      return newTeam;
    }

  private calculateReward(position: number, division: string): number {
    const divisionNumber = division.split(' ')[1];
    const divisionRewards = this.rewards.find(r => r.division === divisionNumber);
    return divisionRewards?.rewards[position.toString()] || 0;
  }

  private handleDataSuccess(): void {
    this.teamData.sort((a, b) => a.clubName.localeCompare(b.clubName));
    this.updateCache();
    this.updateResults();
    this.loading = false;
    console.log('All teams processed:', this.teamData);
  }

  private updateCache(): void {
    localStorage.setItem('teamData', JSON.stringify(this.teamData));
    localStorage.setItem('teamDataTimestamp', Date.now().toString());
  }

  private updateResults(): void {
    this.calculateTodayResults();
    // this.calculateTotalRewards();
  }

  private calculateTodayResults(): void {
    this.todayResults = this.teamData.reduce((acc, team) => {
      const lastMatch = team.lastMatches?.[team.lastMatches.length - 1];
      if (lastMatch) acc[lastMatch]++;
      return acc;
    }, { won: 0, tie: 0, lost: 0 });
  }

  private handleError(context: string, error: any): void {
    console.error(`${context}:`, error);
    this.loading = false;
    // Add user notification logic here
  }

  private handleTeamError(team: any, error: any): Observable<any> {
    console.error(`Error processing team ${team.id}:`, error);
    return of(undefined);
  }

  private handleDataError(error: any): void {
    console.error('Data fetch error:', error);
    this.loading = false;
    // Add user notification logic here
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
    console.log('getting wallets')
    this.managers = this.localStorageService.getWallets();
    console.log('managers:', this.managers);
  }

  fetchRewards() {
    this.http.get<any[]>('assets/teams/mlsRewards.json').subscribe((data) => {
      this.rewards = data;
    });
  }

  // calculateTotalRewards(): void {
  //   this.totalRewards = this.teamData.reduce(
  //     (sum, team) => sum + team.expectedReward,
  //     0
  //   );
  // }

  navigationTo(route: string): void {
    this.sharedService.navigationTo(route);
  }
  
  formatTimestamp(timestamp: number): string {
    return this.datePipe.transform(timestamp || Date.now(), 'medium') || 'N/A';
  }

  saveWallet(): void {
    if (this.tknForm.invalid) return;

    const walletData: WalletDto = {
      manager: this.manager.value ?? '',
      address: this.address.value ?? '',
      token: this.token.value ?? ''
    };
  
    this.updateWalletStorage(walletData);
    this.resetForm();
  }

  updateData(): void {
    this.clearCache();
    this.resetData();
    this.fetchAllData();
  }

  private clearCache(): void {
    localStorage.removeItem('teamData');
  }
  
  private resetData(): void {
    this.teamData = [];
    this.todayResults = { won: 0, tie: 0, lost: 0 };
    this.loading = true;
  }

  private updateWalletStorage(wallet: WalletDto): void {
    const existingIndex = this.managers.findIndex(m => m.address === wallet.address);
    if (existingIndex > -1) {
      this.managers[existingIndex] = wallet;
    } else {
      this.managers.push(wallet);
    }
    this.localStorageService.saveWallets(this.managers);
  }
  
  private resetForm(): void {
    this.tknForm.reset();
    this.manager.setErrors(null);
    this.address.setErrors(null);
    this.token.setErrors(null);
  }
}