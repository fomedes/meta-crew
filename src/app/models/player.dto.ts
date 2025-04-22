export interface playerDTO {
  age: number;
  condition_abilities: ConditionAbilities;
  goalkeeping_abilities: GoalkeepingAbilities;
  height: number;
  id: number;
  image_url: string;
  last_name: string;
  condition: number;
  level: number;
  market_price: number
  name: string;
  overall: number;
  owner: string;
  player_skill_1: string;
  player_skill_2: string;
  player_special_skills: number;
  potential: number;
  preferred_foot: string;
  role: string;
  specific_role: string;
  tactical_abilities: TacticalAbilities;
  technical_abilities: TechnicalAbilities;
  weight: number;
}

export interface TechnicalAbilities {
  id: number;
  overall: number;
  passing: number;
  dribbling: number;
  crossing: number;
  shooting: number;
  finishing: number;
  heading: number;
  passing_potential: number;
  dribbling_potential: number;
  crossing_potential: number;
  shooting_potential: number;
  finishing_potential: number;
  heading_potential: number;
}

export interface TacticalAbilities {
  id: number;
  overall: number;
  vision: number;
  bravery: number;
  positioning: number;
  marking: number;
  sliding_tackle: number;
  standing_tackle: number;
  vision_potential: number;
  bravery_potential: number;
  positioning_potential: number;
  marking_potential: number;
  sliding_tackle_potential: number;
  standing_tackle_potential: number;
}
export interface ConditionAbilities {
  id: number;
  overall: number;
  fitness: number;
  strength: number;
  speed: number;
  concentration: number;
  aggression: number;
  creativity: number;
  overall_potential: number;
  fitness_potential: number;
  strength_potential: number;
  speed_potential: number;
  concentration_potential: number;
  aggression_potential: number;
  creativity_potential: number;
}

export interface GoalkeepingAbilities {
  id: number;
  overall: number;
  diving: number;
  handling: number;
  kicking: number;
  punching: number;
  throwing: number;
  reflexes: number;
  diving_potential: number;
  handling_potential: number;
  kicking_potential: number;
  punching_potential: number;
  throwing_potential: number;
  reflexes_potential: number;
}
