import { Card } from "../models/cardModel";

export interface CardPacks {
  name: String;
  cards: Card[];
  coverageImage?: String;
  theme?: String;
}
