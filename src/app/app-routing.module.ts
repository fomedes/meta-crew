import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
