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
}

export interface Set {
  name: string;
  theme: string;
  coverImage: string;
  cards: Card[];
}

export const cardSets: Set[] = [
  {
    name: "Pokemon Set",
    theme: "pokemon",
    coverImage:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=600&fit=crop",
    cards: [
      {
        name: "Pikachu",
        picture: "/pokemon/pikachu.jpg",
        hp: 60,
        rarity: "rare",
        attacks: [
          { name: "Thunder Shock", damage: 10 },
          { name: "Thunderbolt", damage: 50 },
        ],
      },
      {
        name: "Charizard",
        picture: "/pokemon/charizard.jpg",
        hp: 120,
        rarity: "legend",
        attacks: [
          { name: "Flame Thrower", damage: 40 },
          { name: "Fire Blast", damage: 80 },
        ],
      },
      {
        name: "Bulbasaur",
        picture: "/pokemon/bulbasaur.jpg",
        hp: 45,
        rarity: "common",
        attacks: [
          { name: "Vine Whip", damage: 10 },
          { name: "Solar Beam", damage: 60 },
        ],
      },
      {
        name: "Squirtle",
        picture: "/pokemon/squirtle.jpg",
        hp: 44,
        rarity: "common",
        attacks: [
          { name: "Water Gun", damage: 10 },
          { name: "Hydro Pump", damage: 50 },
        ],
      },
      {
        name: "Mewtwo",
        picture: "/pokemon/mewtwo.jpg",
        hp: 130,
        rarity: "mythic",
        attacks: [
          { name: "Psychic", damage: 50 },
          { name: "Psystrike", damage: 100 },
        ],
      },
    ],
  },
  {
    name: "Power Tools Set",
    theme: "power tools",
    coverImage:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=600&fit=crop",
    cards: [
      {
        name: "Drill Master",
        picture: "/tools/drill.jpg",
        hp: 80,
        rarity: "uncom",
        attacks: [
          { name: "Power Drill", damage: 30 },
          { name: "Turbo Spin", damage: 60 },
        ],
      },
      {
        name: "Chainsaw Warrior",
        picture: "/tools/chainsaw.jpg",
        hp: 100,
        rarity: "rare",
        attacks: [
          { name: "Chain Slash", damage: 40 },
          { name: "Rev Up", damage: 70 },
        ],
      },
      {
        name: "Hammer Time",
        picture: "/tools/hammer.jpg",
        hp: 70,
        rarity: "common",
        attacks: [
          { name: "Slam", damage: 25 },
          { name: "Demolish", damage: 55 },
        ],
      },
      {
        name: "Saw Blade",
        picture: "/tools/circular-saw.jpg",
        hp: 85,
        rarity: "uncom",
        attacks: [
          { name: "Cut", damage: 35 },
          { name: "Rip Through", damage: 65 },
        ],
      },
      {
        name: "Angle Grinder",
        picture: "/tools/angle-grinder.jpg",
        hp: 75,
        rarity: "epic",
        attacks: [
          { name: "Grind", damage: 45 },
          { name: "Sparks Fly", damage: 75 },
        ],
      },
    ],
  },
  {
    name: "Cakes Set",
    theme: "cakes",
    coverImage:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=600&fit=crop",
    cards: [
      {
        name: "Chocolate Cake",
        picture: "/cakes/chocolate.jpg",
        hp: 50,
        rarity: "common",
        attacks: [
          { name: "Sweet Bite", damage: 15 },
          { name: "Sugar Rush", damage: 35 },
        ],
      },
      {
        name: "Strawberry Shortcake",
        picture: "/cakes/strawberry.jpg",
        hp: 45,
        rarity: "uncom",
        attacks: [
          { name: "Berry Blast", damage: 20 },
          { name: "Cream Whip", damage: 40 },
        ],
      },
      {
        name: "Red Velvet",
        picture: "/cakes/red-velvet.jpg",
        hp: 60,
        rarity: "rare",
        attacks: [
          { name: "Velvet Touch", damage: 25 },
          { name: "Cream Cheese Frost", damage: 50 },
        ],
      },
      {
        name: "Birthday Cake",
        picture: "/cakes/birthday.jpg",
        hp: 55,
        rarity: "epic",
        attacks: [
          { name: "Candle Blow", damage: 30 },
          { name: "Celebration", damage: 55 },
        ],
      },
      {
        name: "Super Amazing Rainbow Layer Cake",
        picture: "/cakes/rainbow.jpg",
        hp: 65,
        rarity: "legend",
        attacks: [
          { name: "Color Burst", damage: 35 },
          { name: "Prism Beam", damage: 70 },
        ],
      },
    ],
  },
];
