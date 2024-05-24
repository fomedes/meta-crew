import { Injectable } from '@angular/core';
import { WalletDto } from '../models/walletProperties.dto';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  getManagers(): WalletDto[] {
    const savedManagers = localStorage.getItem('managers');

    if (savedManagers) {
      return JSON.parse(savedManagers);
    } else {
      return [];
    }
  }
}
