import { Injectable } from '@angular/core';
import { WalletDto } from '../models/walletProperties.dto';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  getWallets(): WalletDto[] {
    const savedManagers = localStorage.getItem('managers');

    if (savedManagers) {
      return JSON.parse(savedManagers);
    } else {
      return [];
    }
  }

  getAirdropManagers(): WalletDto[] {
    const savedManagers = localStorage.getItem('AirdropManagers');

    if (savedManagers) {
      return JSON.parse(savedManagers);
    } else {
      return [];
    }
  }
}
