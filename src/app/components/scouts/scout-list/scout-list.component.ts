import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ScoutService } from 'src/app/services/scout.service';

@Component({
  selector: 'app-scout-list',
  templateUrl: './scout-list.component.html',
  styleUrls: ['./scout-list.component.scss'],
})
export class ScoutListComponent {
  scouts!: any[];

  constructor(private scoutService: ScoutService, private router: Router) {}

  ngOnInit(): void {
    this.loadScouts();
  }

  private loadScouts(): void {
    this.scoutService.getScouts().subscribe((response) => {
      if (response.success) {
        this.scouts = response.result.scouts;
      } else {
        console.error('Error loading scouts:', response.error);
      }
    });
  }
}
