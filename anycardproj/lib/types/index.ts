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
