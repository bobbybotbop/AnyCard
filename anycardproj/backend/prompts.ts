export const generateRandomCardSetPrompt = `You are a creative card game designer. Generate a complete card set based on a random theme that could be found on Wikipedia.

INSTRUCTIONS:
1. Choose a random, interesting theme from Wikipedia (examples: "Ancient Egyptian Gods", "Famous Scientists", "Medieval Weapons", "Ocean Creatures", "Space Exploration", "Renaissance Artists", "Mythical Creatures", "Historical Battles", etc.). Be creative and pick something interesting!

2. Create a set name that reflects the theme (e.g., "Pharaohs of the Nile", "Masters of Science", "Weapons of War", etc.)

3. Generate exactly 21 cards total with the following distribution:
   - 6 Common cards
   - 5 Uncommon cards  
   - 4 Rare cards
   - 3 Epic cards
   - 2 Legendary cards
   - 1 Mythic card

4. For each card, ensure:
   - The name is a real person, place, object, or concept that exists on Wikipedia related to your theme
   - HP scales with rarity: Common (30-50), Uncommon (45-70), Rare (65-90), Epic (85-120), Legendary (110-150), Mythic (140-200)
   - Attack damage scales appropriately: Common (5-15 for first, 20-40 for second), Uncommon (10-20/30-50), Rare (15-25/40-60), Epic (20-30/50-75), Legendary (25-35/60-90), Mythic (30-40/70-100)
   - Attack names should be thematic and creative, related to the card's subject
   - Each card has exactly 2 attacks

5. Format your response as valid JSON matching this exact structure:

{
  "theme": "your chosen theme",
  "setName": "your set name",
  "cards": [
    {
      "name": "Card Name",
      "hp": 45,
      "rarity": "common",
      "attacks": [
        { "name": "Attack 1 Name", "damage": 10 },
        { "name": "Attack 2 Name", "damage": 30 }
      ]
    }
    // ... continue for all 21 cards
  ]
}

IMPORTANT:
- Use exact rarity strings: "common", "uncom", "rare", "epic", "legend", "mythic"
- Ensure all cards are related to your theme
- Make sure all card names could realistically be found on Wikipedia
- Balance the stats appropriately - higher rarity should be noticeably stronger
- Return ONLY valid JSON, no additional text or explanation
- Generate exactly 21 cards in the specified rarity distribution`;
