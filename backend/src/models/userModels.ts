import { Timestamp } from "firebase/firestore";
import { Card } from "../models/cardModel";

export interface userModel {
  username: String;
  email: String;
  createdAt: Timestamp;
  cards?: Card[];
  favoriteCards?: Card[];
  level?: Number;
}
