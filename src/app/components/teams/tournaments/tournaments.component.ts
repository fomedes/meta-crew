import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.scss'],
})
export class TournamentsComponent implements OnInit {
  constructor(private http: HttpClient) {}

  teamIds: any;
  teamData: any[] = [];
  groupData: any[] = [];
  loading = true;

  ngOnInit() {
    this.http.get('/assets/teams/teams_id.json').subscribe((data) => {
      this.teamIds = data;
      this.groupData = this.extractTeamDataFromGroupFiles();
    });
  }
  extractTeamDataFromGroupFiles() {
    this.teamIds.forEach((teamId: any) => {
      const apiUrl = `https://api.metasoccer.com/msl/group/${teamId.groupId}`;
      this.http.get(apiUrl).subscribe((groupData: any) => {
        console.log(groupData);
        const division = groupData.result.name; // Assuming response structure
        const matchingTeam = groupData.result.standings.rankedTeams.find(
          (team: any) => team.id === teamId.id
        );
        if (matchingTeam) {
          this.teamData.push({
            id: teamId.id,
            groupId: teamId.groupId,
            manager: teamId.manager,
            ovr: teamId.ovr,
            division: division,
            clubName: matchingTeam.clubName,
            position: matchingTeam.position,
            played: matchingTeam.played,
            won: matchingTeam.won,
            tied: matchingTeam.tied,
            lost: matchingTeam.lost,
            goalsForward: matchingTeam.goalsForward,
            goalsAgainst: matchingTeam.goalsAgainst,
            goalsDifference: matchingTeam.goalsDifference,
            points: matchingTeam.points,
            lastMatches: matchingTeam.lastMatches,
          });
        } else {
          console.warn(`Team ID ${teamId} not found in API response`);
        }
        this.loading = false;
      });
    });
    console.log(this.teamData);
    return this.teamData;
  }

  // extractTeamDataFromGroupFiles() {
  //   this.teamIds.forEach((teamId: any) => {
  //     const filePath = `/assets/teams/${teamId.id.slice(2)}/group.json`;
  //     this.http.get(filePath).subscribe((groupData) => {
  //       const division = (groupData as any).result.name;
  //       const matchingTeam = (
  //         groupData as any
  //       ).result.standings.rankedTeams.find(
  //         (team: any) => team.id === teamId.id
  //       );

  //       if (matchingTeam) {
  //         this.teamData.push({
  //           id: teamId.id,
  //           groupId: teamId.groupId,
  //           manager: teamId.manager,
  //           ovr: teamId.ovr,
  //           division: division,
  //           clubName: matchingTeam.clubName,
  //           position: matchingTeam.position,
  //           played: matchingTeam.played,
  //           won: matchingTeam.won,
  //           tied: matchingTeam.tied,
  //           lost: matchingTeam.lost,
  //           goalsForward: matchingTeam.goalsForward,
  //           goalsAgainst: matchingTeam.goalsAgainst,
  //           goalsDifference: matchingTeam.goalsDifference,
  //           points: matchingTeam.points,
  //           lastMatches: matchingTeam.lastMatches,
  //         });
  //       } else {
  //         console.warn(`Team ID ${teamId} not found in group.json`);
  //       }
  //     });
  //   });
  //   console.log(this.teamData);
  //   return this.teamData;
  // }
}
