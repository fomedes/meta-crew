import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { WalletDto } from 'src/app/models/walletProperties.dto';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { TeamService } from 'src/app/services/team.service';
import { TrainingsService } from 'src/app/services/trainings.service';



interface ManagedTeam {
  id: string;
  name: string;
  drills: TrainingPlan;
  players?: Player[];
  isLoading?: boolean;
  injuredPlayers?: LockedPlayer[]; 
  sanctionedPlayers?: LockedPlayer[];
  trainingReport?: PlayerTrainingReport[]; 
  [key: string]: any;
}

interface LockedPlayer {
  playerId: number;
  reason: 'Injured' | 'Sanctioned';
  lockedTimestamp: number;
  injury?: string;
  expirationTimestamp: number;
}

interface Club {
  clubName: string;
  managedTeams: ManagedTeam[];
  clubAddress: string;
  clubToken: string;
}

interface Player {
  condition: number;
  [key: string]: any;
}

interface TrainingPlan {
  trainingGroups: any[];
}

interface PlayerTrainingReport {
  playerId: number;
  playerFullName: string;
  ovrBefore?: number;
  ovrAfter?: number;
  abilityImprovements: AbilityImprovement[];
}

interface AbilityImprovement {
  abilityName: string;
  beforeSkill: number;
  afterSkill: number;
  potentialSkill: number;
}

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss'],
})
export class TrainingComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  validManagers: WalletDto[] = [];
  clubs: Club[] = [];

  constructor(
    private trainingService: TrainingsService,
    private teamService: TeamService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeData(): void {
    const managers = this.localStorageService.getWallets();
    this.validManagers = managers.filter(manager => !!manager.address);

    this.loadManagedTeams()
      .pipe(
        switchMap(() => this.loadPlayerConditions()),
        switchMap(() => this.loadLastDrills()),
        switchMap(() => this.loadLockedPlayers()),
        catchError(error => {
          console.error('Initialization error:', error);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  private loadManagedTeams(): Observable<void> {
    const teamRequests = this.validManagers.map(manager =>
      this.teamService.getManagedTeams(manager.address, manager.token).pipe(
        catchError(error => of({ success: false, error }))
      )
    );

    return forkJoin(teamRequests).pipe(
      tap(responses => {
        this.clubs = responses
          .filter(response => response?.success)
          .map(response => {
            const teamData = response.result.managedTeams;
            const manager = this.validManagers.find(
              m => m.address === teamData[0].manager
            );


            return {
              clubName: teamData[0].clubName,
              managedTeams: teamData.map((team: any) => ({
                ...team,
                drills: { trainingGroups: [] },
                players: []
              })),
              clubAddress: teamData[0].manager,
              clubToken: manager?.token || ''
            };
          });

      }),
      
      map(() => void 0)
    );
    
  }

  private loadPlayerConditions(): Observable<void> {
    const playerRequests = this.clubs.flatMap(club =>
      club.managedTeams.map(team =>
        this.teamService.getTeamPlayers(team.id).pipe(
          map(response => ({
            team,
            players: response.result.players || []
          })),
          catchError(error => of({ team, players: [], error }))
        )
      )
    );

    return forkJoin(playerRequests).pipe(
      tap(results => {
        results.forEach(({ team, players }) => {
          team.players = players;
        });
      }),
      map(() => void 0)
    );
  }

  private loadLockedPlayers(): Observable<void> {
    const lockedRequests = this.clubs.flatMap(club =>
      club.managedTeams.map(team =>
        this.teamService.lockedPlayers(team, club.clubToken).pipe(
          map(response => ({
            team,
            lockedPlayers: response.result?.lockedPlayers || []
          })),
          catchError(error => of({ team, lockedPlayers: [], error }))
      ))
    );
  
    return forkJoin(lockedRequests).pipe(
      tap(results => {
        results.forEach(({ team, lockedPlayers }) => {
          team.injuredPlayers = lockedPlayers.filter((p: LockedPlayer) => p.reason === 'Injured');
          team.sanctionedPlayers = lockedPlayers.filter((p: LockedPlayer) => p.reason === 'Sanctioned');
        });
      }),
      map(() => void 0)
    );
    
  }

  private loadSingleTeamPlayers(team: ManagedTeam): Observable<void> {
    return this.teamService.getTeamPlayers(team.id).pipe(
      map(response => {
        team.players = response.result.players || [];
        return void 0;
      }),
      catchError(error => {
        console.error('Error loading team players:', error);
        return of(void 0);
      })
    );
  }
  
  private loadLastDrills(): Observable<void> {

    const drillRequests = this.clubs.flatMap(club =>
      club.managedTeams.map(team =>
        this.trainingService
          .getLastDrills(team.id, club.clubToken)
          .pipe(
            map(response => {
              const trainingPlan = response?.trainingsHistory?.[0]?.trainingPlan || { trainingGroups: [] };
              return { team, drills: trainingPlan };
            }),
            catchError(error => of({ team, drills: [], error }))
          )
      )

    );

    return forkJoin(drillRequests).pipe(
      tap(results => {
        results.forEach(({ team, drills }) => {
          team.drills = drills;
        });
      }),
      map(() => void 0)
    );
  }

  private loadSingleTeamDrills(team: ManagedTeam, clubToken: string): Observable<void> {
    return this.trainingService.getLastDrills(team.id, clubToken).pipe(
      map(response => {
        team.drills = response?.trainingsHistory?.[0]?.trainingPlan || { trainingGroups: [] };
        return void 0;
      }),
      catchError(error => {
        console.error('Error loading team drills:', error);
        return of(void 0);
      })
    );
  }

  calculateCondition(team: ManagedTeam, type: 'min' | 'max' | 'avg'): number {
    if (!team.players?.length) return 0;
    
    const conditions = team.players.map(p => p.condition);
    switch (type) {
      case 'min': return Math.min(...conditions);
      case 'max': return Math.max(...conditions);
      case 'avg': 
        return conditions.reduce((a, b) => a + b, 0) / conditions.length;
      default: return 0;
    }
  }

  executeTraining(clubToken: string, teamId: string, drills: TrainingPlan): void {
    const trainedTeam = this.clubs
    .flatMap(club => club.managedTeams)
    .find(team => team.id === teamId);

  if (!trainedTeam) {
    console.error('Team not found');
    return;
  }

  trainedTeam.isLoading = true;
  trainedTeam.trainingReport = [];

  this.trainingService
    .executeTraining(teamId, clubToken, { teamId, trainingPlan: drills })
    .pipe(
      tap(response => {
        // Process training report
        if (response?.playerImprovements) {
          trainedTeam.trainingReport = response.playerImprovements
            .map((improvement:any) => {
              const player = trainedTeam.players?.find(p => p['playerId'] === improvement.playerId);
              const report: PlayerTrainingReport = {
                playerId: improvement.playerId,
                playerFullName: this.getPlayerFullName(trainedTeam, improvement.playerId),
                abilityImprovements: []
              };

              // Check OVR change
              if (improvement.after.overall > improvement.before.overall) {
                report.ovrBefore = improvement.before.overall
                report.ovrAfter = improvement.after.overall
              }

              // Check ability improvements
              improvement.before.abilities.forEach((beforeAbility: any, index: any) => {
                const afterAbility = improvement.after.abilities[index];
                if (afterAbility.skill > beforeAbility.skill) {
                  report.abilityImprovements.push({
                    abilityName: beforeAbility.ability,
                    beforeSkill: beforeAbility.skill,
                    afterSkill: afterAbility.skill,
                    potentialSkill: afterAbility.potential
                  });
                }
              });

              return report;
            })
            .filter((report:any) => report.ovrIncrease || report.abilityImprovements.length > 0);
        }
      }),
      switchMap(() => this.loadSingleTeamPlayers(trainedTeam)),
      switchMap(() => this.loadSingleTeamDrills(trainedTeam, clubToken)),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: () => {
        console.log('Training executed successfully');
        trainedTeam.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        trainedTeam.isLoading = false;
        this.cdr.markForCheck();
        console.error('Training error:', err);
      }
    });
  }

  playPve(clubToken: string, teamId: string): void {
    const trainedTeam = this.clubs
      .flatMap(club => club.managedTeams)
      .find(team => team.id === teamId);
  
    if (!trainedTeam) return;
  
    this.trainingService
      .playPve(clubToken, { teamId, difficulty: 0 })
      .pipe(
        switchMap(response => response.success 
          ? this.loadSingleTeamPlayers(trainedTeam)
          : of(null)),
        switchMap(() => this.loadSingleTeamDrills(trainedTeam, clubToken)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.cdr.markForCheck(),
        error: err => console.error('PVE error:', err)
      });
  }

  checkLockedPlayers(team: ManagedTeam, clubToken: string): void {
    this.teamService.lockedPlayers(team, clubToken)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: count => console.log('Injured players:', count),
        error: err => console.error('Injury check error:', err)
      });
  }

  trackByTeamId(index: number, team: ManagedTeam): string {
    return team.id;
  }

  getPlayerFullName(team: ManagedTeam, playerId: number): string {
    if (!team.players) return 'Unknown';
    const player = team.players.find(p => p['id'] === playerId);
    return player?.['name'] + ' ' + player?.['lastName'] || `Player ${playerId}`;
  }
}