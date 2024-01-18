import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor(private router: Router) {}

  navigationTo(route: string): void {
    this.router.navigate([route]);
  }
}
