// Shared types across both frontend and backend!

export type WeatherResponse = {
  raining: boolean;
};

export interface newUser {
  UID: string;
  email: string;
  username: string;
}

export interface userData {
  UID: string;
  username: string;
  email: string;
  createdAt: string;
  level: number;
  cards: any[];
  favoriteCards: any[];
}

export type Rarity = "common" | "uncom" | "rare" | "epic" | "legend" | "mythic";

export interface Attack {
  name: string;
  damage: number;
}

export interface Card {
  name: string;
  picture: string;
  hp: number;
  rarity: Rarity;
  attacks: [Attack, Attack];
  fromPack: string;
}

export interface Set {
  name: string;
  theme: string;
  coverImage: string;
  cards: Card[];
}
