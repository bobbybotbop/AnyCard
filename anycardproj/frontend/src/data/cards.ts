import { Rarity, Attack, Card, Set } from "@full-stack/types";

export type { Rarity, Attack, Card, Set };

export const cardSets: Set[] = [
  {
    name: "Pokemon Set",
    theme: "pokemon",
    coverImage:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=600&fit=crop",
    cards: [
      // Common (6)
      {
        name: "Bulbasaur",
        picture: "/pokemon/bulbasaur.jpg",
        hp: 45,
        rarity: "common",
        attacks: [
          { name: "Vine Whip", damage: 10 },
          { name: "Solar Beam", damage: 60 },
        ],
        fromPack: "Pokemon Set",
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
        fromPack: "Pokemon Set",
      },
      {
        name: "Charmander",
        picture: "/pokemon/charmander.jpg",
        hp: 39,
        rarity: "common",
        attacks: [
          { name: "Ember", damage: 10 },
          { name: "Flame Burst", damage: 45 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Caterpie",
        picture: "/pokemon/caterpie.jpg",
        hp: 45,
        rarity: "common",
        attacks: [
          { name: "String Shot", damage: 5 },
          { name: "Bug Bite", damage: 30 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Weedle",
        picture: "/pokemon/weedle.jpg",
        hp: 40,
        rarity: "common",
        attacks: [
          { name: "Poison Sting", damage: 8 },
          { name: "Bug Bite", damage: 28 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Pidgey",
        picture: "/pokemon/pidgey.jpg",
        hp: 40,
        rarity: "common",
        attacks: [
          { name: "Gust", damage: 12 },
          { name: "Quick Attack", damage: 30 },
        ],
        fromPack: "Pokemon Set",
      },
      // Uncom (5)
      {
        name: "Pikachu",
        picture: "/pokemon/pikachu.jpg",
        hp: 60,
        rarity: "uncom",
        attacks: [
          { name: "Thunder Shock", damage: 10 },
          { name: "Thunderbolt", damage: 50 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Jigglypuff",
        picture: "/pokemon/jigglypuff.jpg",
        hp: 70,
        rarity: "uncom",
        attacks: [
          { name: "Sing", damage: 5 },
          { name: "Body Slam", damage: 45 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Meowth",
        picture: "/pokemon/meowth.jpg",
        hp: 50,
        rarity: "uncom",
        attacks: [
          { name: "Scratch", damage: 15 },
          { name: "Pay Day", damage: 40 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Psyduck",
        picture: "/pokemon/psyduck.jpg",
        hp: 50,
        rarity: "uncom",
        attacks: [
          { name: "Water Gun", damage: 12 },
          { name: "Confusion", damage: 38 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Abra",
        picture: "/pokemon/abra.jpg",
        hp: 25,
        rarity: "uncom",
        attacks: [
          { name: "Teleport", damage: 0 },
          { name: "Psychic", damage: 50 },
        ],
        fromPack: "Pokemon Set",
      },
      // Rare (4)
      {
        name: "Vulpix",
        picture: "/pokemon/vulpix.jpg",
        hp: 65,
        rarity: "rare",
        attacks: [
          { name: "Ember", damage: 15 },
          { name: "Flamethrower", damage: 55 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Growlithe",
        picture: "/pokemon/growlithe.jpg",
        hp: 70,
        rarity: "rare",
        attacks: [
          { name: "Bite", damage: 20 },
          { name: "Flame Wheel", damage: 50 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Poliwag",
        picture: "/pokemon/poliwag.jpg",
        hp: 60,
        rarity: "rare",
        attacks: [
          { name: "Bubble", damage: 12 },
          { name: "Water Pulse", damage: 48 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Machop",
        picture: "/pokemon/machop.jpg",
        hp: 70,
        rarity: "rare",
        attacks: [
          { name: "Karate Chop", damage: 18 },
          { name: "Low Kick", damage: 52 },
        ],
        fromPack: "Pokemon Set",
      },
      // Epic (3)
      {
        name: "Gyarados",
        picture: "/pokemon/gyarados.jpg",
        hp: 95,
        rarity: "epic",
        attacks: [
          { name: "Waterfall", damage: 35 },
          { name: "Hydro Pump", damage: 75 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Lapras",
        picture: "/pokemon/lapras.jpg",
        hp: 130,
        rarity: "epic",
        attacks: [
          { name: "Ice Beam", damage: 40 },
          { name: "Surf", damage: 70 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Snorlax",
        picture: "/pokemon/snorlax.jpg",
        hp: 160,
        rarity: "epic",
        attacks: [
          { name: "Body Slam", damage: 45 },
          { name: "Rest", damage: 0 },
        ],
        fromPack: "Pokemon Set",
      },
      // Legend (2)
      {
        name: "Charizard",
        picture: "/pokemon/charizard.jpg",
        hp: 120,
        rarity: "legend",
        attacks: [
          { name: "Flame Thrower", damage: 40 },
          { name: "Fire Blast", damage: 80 },
        ],
        fromPack: "Pokemon Set",
      },
      {
        name: "Blastoise",
        picture: "/pokemon/blastoise.jpg",
        hp: 115,
        rarity: "legend",
        attacks: [
          { name: "Hydro Pump", damage: 45 },
          { name: "Skull Bash", damage: 85 },
        ],
        fromPack: "Pokemon Set",
      },
      // Mythic (1)
      {
        name: "Mewtwo",
        picture: "/pokemon/mewtwo.jpg",
        hp: 130,
        rarity: "mythic",
        attacks: [
          { name: "Psychic", damage: 50 },
          { name: "Psystrike", damage: 100 },
        ],
        fromPack: "Pokemon Set",
      },
    ],
  },
  {
    name: "Power Tools Set",
    theme: "power tools",
    coverImage:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=600&fit=crop",
    cards: [
      // Common (6)
      {
        name: "Hammer Time",
        picture: "/tools/hammer.jpg",
        hp: 70,
        rarity: "common",
        attacks: [
          { name: "Slam", damage: 25 },
          { name: "Demolish", damage: 55 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Screwdriver",
        picture: "/tools/screwdriver.jpg",
        hp: 45,
        rarity: "common",
        attacks: [
          { name: "Twist", damage: 15 },
          { name: "Tighten", damage: 35 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Wrench",
        picture: "/tools/wrench.jpg",
        hp: 50,
        rarity: "common",
        attacks: [
          { name: "Turn", damage: 18 },
          { name: "Torque", damage: 38 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Pliers",
        picture: "/tools/pliers.jpg",
        hp: 48,
        rarity: "common",
        attacks: [
          { name: "Grip", damage: 16 },
          { name: "Crush", damage: 36 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Tape Measure",
        picture: "/tools/tape-measure.jpg",
        hp: 40,
        rarity: "common",
        attacks: [
          { name: "Measure", damage: 10 },
          { name: "Snap", damage: 30 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Level",
        picture: "/tools/level.jpg",
        hp: 42,
        rarity: "common",
        attacks: [
          { name: "Check", damage: 12 },
          { name: "Balance", damage: 32 },
        ],
        fromPack: "Power Tools Set",
      },
      // Uncom (5)
      {
        name: "Drill Master",
        picture: "/tools/drill.jpg",
        hp: 80,
        rarity: "uncom",
        attacks: [
          { name: "Power Drill", damage: 30 },
          { name: "Turbo Spin", damage: 60 },
        ],
        fromPack: "Power Tools Set",
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
        fromPack: "Power Tools Set",
      },
      {
        name: "Nail Gun",
        picture: "/tools/nail-gun.jpg",
        hp: 75,
        rarity: "uncom",
        attacks: [
          { name: "Rapid Fire", damage: 28 },
          { name: "Pierce", damage: 58 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Sander",
        picture: "/tools/sander.jpg",
        hp: 70,
        rarity: "uncom",
        attacks: [
          { name: "Sand", damage: 25 },
          { name: "Polish", damage: 55 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Router",
        picture: "/tools/router.jpg",
        hp: 78,
        rarity: "uncom",
        attacks: [
          { name: "Carve", damage: 32 },
          { name: "Engrave", damage: 62 },
        ],
        fromPack: "Power Tools Set",
      },
      // Rare (4)
      {
        name: "Chainsaw Warrior",
        picture: "/tools/chainsaw.jpg",
        hp: 100,
        rarity: "rare",
        attacks: [
          { name: "Chain Slash", damage: 40 },
          { name: "Rev Up", damage: 70 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Impact Driver",
        picture: "/tools/impact-driver.jpg",
        hp: 90,
        rarity: "rare",
        attacks: [
          { name: "Impact", damage: 38 },
          { name: "Torque Burst", damage: 68 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Table Saw",
        picture: "/tools/table-saw.jpg",
        hp: 95,
        rarity: "rare",
        attacks: [
          { name: "Precision Cut", damage: 42 },
          { name: "Rip Cut", damage: 72 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Miter Saw",
        picture: "/tools/miter-saw.jpg",
        hp: 88,
        rarity: "rare",
        attacks: [
          { name: "Angle Cut", damage: 36 },
          { name: "Cross Cut", damage: 66 },
        ],
        fromPack: "Power Tools Set",
      },
      // Epic (3)
      {
        name: "Angle Grinder",
        picture: "/tools/angle-grinder.jpg",
        hp: 75,
        rarity: "epic",
        attacks: [
          { name: "Grind", damage: 45 },
          { name: "Sparks Fly", damage: 75 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Welder",
        picture: "/tools/welder.jpg",
        hp: 110,
        rarity: "epic",
        attacks: [
          { name: "Arc Strike", damage: 50 },
          { name: "Fusion Weld", damage: 80 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Plasma Cutter",
        picture: "/tools/plasma-cutter.jpg",
        hp: 105,
        rarity: "epic",
        attacks: [
          { name: "Plasma Arc", damage: 48 },
          { name: "Melt Through", damage: 78 },
        ],
        fromPack: "Power Tools Set",
      },
      // Legend (2)
      {
        name: "Jackhammer",
        picture: "/tools/jackhammer.jpg",
        hp: 120,
        rarity: "legend",
        attacks: [
          { name: "Pound", damage: 55 },
          { name: "Demolition", damage: 90 },
        ],
        fromPack: "Power Tools Set",
      },
      {
        name: "Excavator",
        picture: "/tools/excavator.jpg",
        hp: 140,
        rarity: "legend",
        attacks: [
          { name: "Dig", damage: 60 },
          { name: "Earth Mover", damage: 95 },
        ],
        fromPack: "Power Tools Set",
      },
      // Mythic (1)
      {
        name: "Industrial Laser Cutter",
        picture: "/tools/laser-cutter.jpg",
        hp: 150,
        rarity: "mythic",
        attacks: [
          { name: "Laser Beam", damage: 70 },
          { name: "Precision Cut", damage: 110 },
        ],
        fromPack: "Power Tools Set",
      },
    ],
  },
  {
    name: "Cakes Set",
    theme: "cakes",
    coverImage:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=600&fit=crop",
    cards: [
      // Common (6)
      {
        name: "Chocolate Cake",
        picture: "/cakes/chocolate.jpg",
        hp: 50,
        rarity: "common",
        attacks: [
          { name: "Sweet Bite", damage: 15 },
          { name: "Sugar Rush", damage: 35 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Vanilla Cake",
        picture: "/cakes/vanilla.jpg",
        hp: 48,
        rarity: "common",
        attacks: [
          { name: "Classic Slice", damage: 14 },
          { name: "Vanilla Swirl", damage: 34 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Carrot Cake",
        picture: "/cakes/carrot.jpg",
        hp: 52,
        rarity: "common",
        attacks: [
          { name: "Carrot Crunch", damage: 16 },
          { name: "Cream Cheese", damage: 36 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Lemon Cake",
        picture: "/cakes/lemon.jpg",
        hp: 47,
        rarity: "common",
        attacks: [
          { name: "Zesty Slice", damage: 13 },
          { name: "Lemon Zing", damage: 33 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Coffee Cake",
        picture: "/cakes/coffee.jpg",
        hp: 49,
        rarity: "common",
        attacks: [
          { name: "Caffeine Boost", damage: 15 },
          { name: "Espresso Shot", damage: 35 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Pound Cake",
        picture: "/cakes/pound.jpg",
        hp: 45,
        rarity: "common",
        attacks: [
          { name: "Heavy Slice", damage: 12 },
          { name: "Dense Strike", damage: 32 },
        ],
        fromPack: "Cakes Set",
      },
      // Uncom (5)
      {
        name: "Strawberry Shortcake",
        picture: "/cakes/strawberry.jpg",
        hp: 45,
        rarity: "uncom",
        attacks: [
          { name: "Berry Blast", damage: 20 },
          { name: "Cream Whip", damage: 40 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Cheesecake",
        picture: "/cakes/cheesecake.jpg",
        hp: 58,
        rarity: "uncom",
        attacks: [
          { name: "Creamy Slice", damage: 22 },
          { name: "Rich Bite", damage: 42 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Tiramisu",
        picture: "/cakes/tiramisu.jpg",
        hp: 55,
        rarity: "uncom",
        attacks: [
          { name: "Coffee Soak", damage: 21 },
          { name: "Mascarpone", damage: 41 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Black Forest Cake",
        picture: "/cakes/black-forest.jpg",
        hp: 60,
        rarity: "uncom",
        attacks: [
          { name: "Cherry Bomb", damage: 23 },
          { name: "Chocolate Layer", damage: 43 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Angel Food Cake",
        picture: "/cakes/angel-food.jpg",
        hp: 42,
        rarity: "uncom",
        attacks: [
          { name: "Light Slice", damage: 19 },
          { name: "Fluffy Strike", damage: 39 },
        ],
        fromPack: "Cakes Set",
      },
      // Rare (4)
      {
        name: "Red Velvet",
        picture: "/cakes/red-velvet.jpg",
        hp: 60,
        rarity: "rare",
        attacks: [
          { name: "Velvet Touch", damage: 25 },
          { name: "Cream Cheese Frost", damage: 50 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "German Chocolate Cake",
        picture: "/cakes/german-chocolate.jpg",
        hp: 65,
        rarity: "rare",
        attacks: [
          { name: "Coconut Frost", damage: 27 },
          { name: "Pecan Layer", damage: 52 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Opera Cake",
        picture: "/cakes/opera.jpg",
        hp: 62,
        rarity: "rare",
        attacks: [
          { name: "Elegant Slice", damage: 26 },
          { name: "Coffee Ganache", damage: 51 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Sacher Torte",
        picture: "/cakes/sacher.jpg",
        hp: 63,
        rarity: "rare",
        attacks: [
          { name: "Chocolate Glaze", damage: 28 },
          { name: "Apricot Layer", damage: 53 },
        ],
        fromPack: "Cakes Set",
      },
      // Epic (3)
      {
        name: "Birthday Cake",
        picture: "/cakes/birthday.jpg",
        hp: 55,
        rarity: "epic",
        attacks: [
          { name: "Candle Blow", damage: 30 },
          { name: "Celebration", damage: 55 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Wedding Cake",
        picture: "/cakes/wedding.jpg",
        hp: 80,
        rarity: "epic",
        attacks: [
          { name: "Elegant Tier", damage: 35 },
          { name: "Icing Cascade", damage: 65 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Chocolate Lava Cake",
        picture: "/cakes/lava.jpg",
        hp: 70,
        rarity: "epic",
        attacks: [
          { name: "Molten Core", damage: 40 },
          { name: "Lava Flow", damage: 70 },
        ],
        fromPack: "Cakes Set",
      },
      // Legend (2)
      {
        name: "Super Amazing Rainbow Layer Cake",
        picture: "/cakes/rainbow.jpg",
        hp: 65,
        rarity: "legend",
        attacks: [
          { name: "Color Burst", damage: 35 },
          { name: "Prism Beam", damage: 70 },
        ],
        fromPack: "Cakes Set",
      },
      {
        name: "Triple Chocolate Fudge Cake",
        picture: "/cakes/triple-chocolate.jpg",
        hp: 75,
        rarity: "legend",
        attacks: [
          { name: "Chocolate Overload", damage: 45 },
          { name: "Fudge Avalanche", damage: 80 },
        ],
        fromPack: "Cakes Set",
      },
      // Mythic (1)
      {
        name: "Golden Opulence Cake",
        picture: "/cakes/golden-opulence.jpg",
        hp: 100,
        rarity: "mythic",
        attacks: [
          { name: "Gold Leaf", damage: 60 },
          { name: "Luxury Slice", damage: 95 },
        ],
        fromPack: "Cakes Set",
      },
    ],
  },
];
