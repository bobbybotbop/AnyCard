type Rarity = "Common" | "Uncommon" | "Epic" | "Legendary" | "Mythic";
type Attack = {
  name: String;
  damage: Number;
};

export interface Card {
  name: String;
  rarity: Rarity;
  attacks: Attack[];
  fromPack?: String;
  hp: Number;
  picture: String;
}
