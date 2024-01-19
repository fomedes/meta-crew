import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(private sharedService: SharedService) {}
  navigationTo(route: string): void {
    this.sharedService.navigationTo(route);
  }
}
