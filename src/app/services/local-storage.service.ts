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

  saveWallets(wallets: WalletDto[]): void {
    localStorage.setItem('managers', JSON.stringify(wallets));
  }

  clearWallets(): void {
    localStorage.removeItem('managers');
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
