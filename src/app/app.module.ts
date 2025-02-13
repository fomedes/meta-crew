import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminPanelComponent } from './components/admin/admin-panel/admin-panel.component';
import { PlayerItemComponent } from './components/players/player-item/player-item.component';
import { PlayerListComponent } from './components/players/player-list/player-list.component';
import { PlayerPoolComponent } from './components/players/player-pool/player-pool.component';
import { ScoutDetailComponent } from './components/scouts/scout-detail/scout-detail.component';
import { ScoutListComponent } from './components/scouts/scout-list/scout-list.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { SpinnerComponent } from './components/shared/spinner/spinner.component';
import { TeamComponent } from './components/teams/team/team.component';
import { TournamentsComponent } from './components/teams/tournaments/tournaments.component';
import { TrainingComponent } from './components/teams/training/training.component';
import { MlsComponent } from './components/tournaments/mls/mls.component';
import { FormatStreakPipe } from './pipes/format-streak.pipe';
import { SortByRolePipe } from './pipes/sort-by-role.pipe';
import { SortScoutByRolePipe } from './pipes/sort-scout-by-role.pipe';
import { SpecificRolePipe } from './pipes/specific-role.pipe';
import { SharedService } from './services/shared.service';
import { TournamentsService } from './services/tournament.service';

@NgModule({
  declarations: [
    AppComponent,
    PlayerListComponent,
    PlayerItemComponent,
    TournamentsComponent,
    HeaderComponent,
    FormatStreakPipe,
    SpinnerComponent,
    TeamComponent,
    SpecificRolePipe,
    SortByRolePipe,
    ScoutListComponent,
    ScoutDetailComponent,
    PlayerPoolComponent,
    AdminPanelComponent,
    TrainingComponent,
    SortScoutByRolePipe,
    MlsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    DatePipe,
    TournamentsService,
    SharedService,
    SpecificRolePipe,
    SortByRolePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
