import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  teams!: any[];

  constructor(private sharedService: SharedService, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('assets/teams/teams_id.json').subscribe((data) => {
      this.teams = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  navigationTo(route: string): void {
    this.sharedService.navigationTo(route);
  }
}
