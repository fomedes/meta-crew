import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerItemComponent } from './components/players/player-item/player-item.component';
import { PlayerListComponent } from './components/players/player-list/player-list.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { SpinnerComponent } from './components/shared/spinner/spinner.component';
import { TournamentsComponent } from './components/teams/tournaments/tournaments.component';
import { FormatStreakPipe } from './pipes/format-streak.pipe';
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
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [DatePipe, TournamentsService],
  bootstrap: [AppComponent],
})
export class AppModule {}
