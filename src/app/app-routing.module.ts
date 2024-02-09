import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPanelComponent } from './components/admin/admin-panel/admin-panel.component';
import { PlayerListComponent } from './components/players/player-list/player-list.component';
import { PlayerPoolComponent } from './components/players/player-pool/player-pool.component';
import { ScoutListComponent } from './components/scouts/scout-list/scout-list.component';
import { TeamComponent } from './components/teams/team/team.component';
import { TournamentsComponent } from './components/teams/tournaments/tournaments.component';

const routes: Routes = [
  {
    path: '',
    component: TournamentsComponent,
  },
  {
    path: 'team/:id',
    component: TeamComponent,
  },
  {
    path: 'players',
    component: PlayerListComponent,
  },
  {
    path: 'scouts',
    component: ScoutListComponent,
  },
  {
    path: 'player-pool',
    component: PlayerPoolComponent,
  },
  {
    path: 'admin',
    component: AdminPanelComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
