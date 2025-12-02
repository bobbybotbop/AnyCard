// Shared types across both frontend and backend!
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
  sentTrade?: sentUser[];
  requestedTrade?: requestUser[];
}

export type Rarity = "common" | "uncom" | "rare" | "epic" | "legend" | "mythic";

export type Status = "pending" | "rejected" | "accepted";

export type MyResponse = "accepted" | "rejected";

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
  /**
   * Optional color identifier for the card (e.g. "red", "blue").
   * Used for UI features like sorting by color in the inventory.
   */
  color?: string;
}

export interface Set {
  name: string;
  theme: string;
  coverImage: string;
  cards: Card[];
}

export interface sentUser {
  tradeId: string;
  sentUserUID: string;
  wantedCard: Card;
  givenCard: Card;
  status: Status;
  date: Date;
  type?: "sentUser";
}

export interface requestUser {
  tradeId: string;
  requestedUserUID: string;
  wantedCard: Card;
  givenCard: Card;
  status: Status;
  date: Date;
  type?: "requestUser";
}

export interface WeatherResponse {
  raining: boolean;
}
