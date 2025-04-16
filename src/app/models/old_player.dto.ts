export interface oldPlayerDTO {
  age: number;
  height: number;
  id: number;
  lastName: string;
  condition: number;
  level: number;
  name: string;
  overall: number;
  owner: string;
  potential: number;
  preferredFoot: number;
  role: string;
  seeds: string[];
  sections: Sections;
  specialAbilities: any[];
  specificRole: string;
  weight: number;
  imageName: string;
  fullName: string;
  shortName: string;
  preferredFootName: string;
}

export interface Sections {
  technical: Technical;
  tactical: Tactical;
  condition: Condition;
  goalkeeping: Goalkeeping;
}

export interface Technical {
  name: string;
  overall: number;
  abilities: TechnicalAbilities;
}

export interface TechnicalAbilities {
  Passing: number;
  Dribbling: number;
  Crossing: number;
  Shooting: number;
  Finishing: number;
  Heading: number;
}

export interface Tactical {
  name: string;
  overall: number;
  abilities: TacticalAbilities;
}

export interface TacticalAbilities {
  Vision: number;
  Bravery: number;
  Positioning: number;
  Marking: number;
  'Sliding Tackle': number;
  'Standing Tackle': number;
}

export interface Condition {
  name: string;
  overall: number;
  abilities: ConditionAbilities;
}

export interface ConditionAbilities {
  Fitness: number;
  Strength: number;
  Speed: number;
  Concentration: number;
  Aggression: number;
  Creativity: number;
}

export interface Goalkeeping {
  name: string;
  overall: number;
  abilities: GoalkeepingAbilities;
}

export interface GoalkeepingAbilities {
  Diving: number;
  Handling: number;
  Kicking: number;
  Punching: number;
  Throwing: number;
  Reflexes: number;
}
