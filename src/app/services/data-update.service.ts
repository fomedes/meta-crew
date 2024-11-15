import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataUpdateService {
  public teamsUpdated: EventEmitter<void> = new EventEmitter<void>();

  emitTeamsUpdate() {
    this.teamsUpdated.emit();
  }
}
