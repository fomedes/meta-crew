import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { WalletDto } from 'src/app/models/walletProperties.dto';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { TeamService } from 'src/app/services/team.service';
import { TrainingsService } from 'src/app/services/trainings.service';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss'],
})
export class TrainingComponent {
  managers!: WalletDto[];
  teams: {
    clubName: string;
    managedTeams: any[];
    clubAddress: string;
    clubToken: string;
  }[] = [];
  managedTeams!: any[];
  validManagers!: WalletDto[];
  token!: string

  constructor(
    private trainingService: TrainingsService,
    private teamService: TeamService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  private loadTeams(): void {
    this.managers = this.localStorageService.getManagers();
    this.validManagers = this.managers.filter(
      (manager) => manager.address != null
    );

    const observables = this.validManagers.map((manager) =>
      this.teamService.getManagedTeams(manager.address, manager.token)
    );

    forkJoin(observables).subscribe((responses) => {
      responses.forEach((response) => {
        if (response.success) {
          const clubName = response.result.managedTeams[0].clubName;
          const clubAddress = response.result.managedTeams[0].manager;
          const clubToken = this.getClubToken(clubAddress);
          this.teams.push({
            clubName: clubName,
            managedTeams: response.result.managedTeams.map((team: any) => ({
              ...team,
              drills: [],
            })),
            clubAddress: clubAddress,
            clubToken: clubToken,
          });
          // Trigger change detection
          this.cdr.detectChanges();
        }
      });

      this.getPlayerCondition().subscribe(() => {
        this.getLastDrills();
      });
      console.log(this.teams);
    });
  }

  private getPlayerCondition(): Observable<any> {
    const observables = this.teams.flatMap((club) =>
      club.managedTeams.map((team) =>
        this.teamService
          .getTeamPlayers(team.id)
          .pipe(map((response) => ({ team, players: response.result.players })))
      )
    );

    return forkJoin(observables).pipe(
      tap((results) => {
        results.forEach(({ team, players }) => {
          if (players) {
            team.players = players;
          }
        });
        // Trigger change detection
        this.cdr.detectChanges();
      })
    );
  }

  getLastDrills(): void {
    this.teams.forEach((club) => {
      club.managedTeams.forEach((team) => {
        if (team.players) {
          this.trainingService
            .getLastDrills(team.id, club.clubToken)
            .subscribe((response) => {
              if (
                response &&
                response.trainingsHistory?.length > 0
              ) {
                team.drills =
                  response.trainingsHistory[0].trainingPlan || [];
              } else {
                team.drills = [];

              }
              // Trigger change detection
              this.cdr.detectChanges();
            });
        }
      });
    });
  }

  getClubToken(clubAddress: string): string {
    const manager = this.validManagers.find(
      (manager) => manager.address === clubAddress
    );

    if (manager) {
      this.token = manager.token;
    }

    return this.token;
  }

  calculateMinCondition(team: any): number {
    return Math.min(...team.players.map((player: any) => player.condition));
  }

  calculateMaxCondition(team: any): number {
    return Math.max(...team.players.map((player: any) => player.condition));
  }

  calculateAvgCondition(team: any): number {
    const sum = team.players.reduce(
      (acc: number, player: any) => acc + player.condition,
      0
    );
    return sum / team.players.length;
  }

  executeTraining(clubToken: string, teamId: string, drills: any): void {
    const payload = {
      teamId: teamId,
      trainingPlan: drills,
    };
    this.trainingService
      .executeTraining(teamId, clubToken, payload)
      .subscribe((response) => {
        if (response) {
          this.getPlayerCondition().subscribe(() => {
            this.getLastDrills();
          });
        } else {
          console.log('There was some error');
        }
        console.log('Training executed:', response);
        // Trigger change detection
        this.cdr.detectChanges();
      });
  }

  playPve(clubToken: string, teamId: string,) {
    const payload = {
      teamId: teamId,
      difficulty: 0,
    };
    this.trainingService
      .playPve(clubToken, payload)
      .subscribe((response) => {
        if (response.success) {
          this.getPlayerCondition().subscribe(() => {
            this.getLastDrills();
          });
        } else {
          console.log('There was some error');
        }
        console.log('Match started:', response);
        // Trigger change detection
        this.cdr.detectChanges();
      });
  }

  countLineupPlayers(team: any): void {
    console.log('Team:', team);
    // const token = team.clubToken;
  
    // this.teamService.countLineupPlayers(team, token).subscribe(
    //   (count: number) => {
    //     console.log('Number of lineup players:', count);
    //     // You can also assign the count to a property if needed
    //   },
    //   (error) => {
    //     console.error('Error fetching lineup players:', error);
    //   }
    // );
  }
}
