export interface ApiMatchResponse {
  match_id: string;
  team_home: TeamConfig;
  team_away: TeamConfig;
  result: 'win' | 'loss' | 'draw';
}

export interface TeamConfig {
  formation: string;
  strategy: {
    mentality: string;
    passing: string;
    playzone: string;
  };
  internal_ovr: number;
  players: any[];
}