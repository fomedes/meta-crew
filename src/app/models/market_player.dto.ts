export interface marketPlayerDTO {
  id: number;
  nftId: number;
  imageUrl: string;
  age: number;
  covering: string;
  specificRole: string;
  level: number;
  name: string;
  lastName: string;
  height: number;
  weight: number;
  preferredFoot: string;
  overall: number;
  potential: number;
  nft: Nft;
  createdAt: string;
  updatedAt: string;
  playerSpecialSkill: PlayerSpecialSkill;
}

export interface Nft {
  // id: number;
  nftContractId: number;
  tokenId: number;
  ownerAddress: string;
  currentPrice: number;
  // currentListingBlock: string;
  // lastSalePrice: any;
  // lastListingPrice: number;
}

export interface PlayerSpecialSkill {
  id: number;
  scoutId: any;
  playerId: number;
  clutchTimePlayer: boolean;
  penaltyStopper: boolean;
  leader: boolean;
  captain: boolean;
  teamPlayer: boolean;
  kickerGK: boolean;
  speakerGK: boolean;
  kaiser: boolean;
  coachOnThePitch: boolean;
  insuperable: boolean;
  foulKicker: boolean;
  penaltyKicker: boolean;
  cornerSpecialist: boolean;
  superSubstitute: boolean;
  warrior: boolean;
  theMagician: boolean;
  dribbler: boolean;
  killer: boolean;
  specialSkillCount: number;
  createdAt: string;
  updatedAt: string;
}
