import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerItemComponent } from './components/players/player-item/player-item.component';
import { PlayerListComponent } from './components/players/player-list/player-list.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { TournamentsComponent } from './components/teams/tournaments/tournaments.component';
import { FormatStreakPipe } from './pipes/format-streak.pipe';

@NgModule({
  declarations: [
    AppComponent,
    PlayerListComponent,
    PlayerItemComponent,
    TournamentsComponent,
    HeaderComponent,
    FormatStreakPipe,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
