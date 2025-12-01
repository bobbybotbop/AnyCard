export const generateRandomCardSetPrompt = `You are a card game designer. Generate a complete card set based on a random theme.

INSTRUCTIONS:
1. Choose a random, interesting theme (examples: "Appliances", "Food", "electronics", "Famous People", etc.). Be creative and pick something interesting and not limited to the examples!

2. Create an epic set name that reflects the theme (e.g., "Appliance World", "Yummy Foods", "Electrifying Electronics" etc.)

3. Generate exactly 21 cards total with the following distribution:
   - 6 Common cards
   - 5 Uncommon cards  
   - 4 Rare cards
   - 3 Epic cards
   - 2 Legendary cards
   - 1 Mythic card

4. For each card, ensure:
   - The name should be thematic, directly falling under the category of the theme, and SHOULD NOT describe the theme. Ex: "BTS k-pop" should generate cards of the members or songs the band created. "anime" should generate animes and anime characters.
    - There should be no repeated card names, and the names should contain a single idea and no appositives. Do NOT add adjectives, titles, nicknames, or descriptors.
   - All card names must be directly related to your chosen theme
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
- Card names must have a visual representation - either they exist in the real world or can be drawn/imagined
- Ensure all cards are related to your theme
- Balance the stats appropriately - higher rarity should be noticeably stronger
- Return ONLY valid JSON, no additional text or explanation
- Generate exactly 21 cards in the specified rarity distribution`;

export function generatePromptWithExclusions(excludedThemes: string[]): string {
  if (!excludedThemes || excludedThemes.length === 0) {
    return generateRandomCardSetPrompt;
  }

  const exclusionText = `\n\nCRITICAL EXCLUSION REQUIREMENT:
- DO NOT use any of the following themes that have already been used:
${excludedThemes.map((theme) => `  - "${theme}"`).join("\n")}
- You MUST choose a completely different theme that is NOT in the list above.
- Ensure your chosen theme is unique and has not been used before.`;

  return generateRandomCardSetPrompt + exclusionText;
}

export function generateCustomSetPrompt(themeInput: string): string {
  const trimmedInput = themeInput.trim();

  return `You are a card game designer. Generate a complete card set based on the theme: "${trimmedInput}"

INSTRUCTIONS:

1. Create an epic set name that reflects the theme (e.g., "Appliance World", "Yummy Foods", "Electrifying Electronics" etc.)

2. Generate exactly 21 cards total with the following distribution:
   - 6 Common cards
   - 5 Uncommon cards  
   - 4 Rare cards
   - 3 Epic cards
   - 2 Legendary cards
   - 1 Mythic card

3. For each card, ensure:
   - The name should be thematic and exact, directly falling under the category of the theme, and SHOULD NOT describe the theme. Ex: "BTS k-pop" should generate cards of the members or songs the band created. "anime" should generate animes and anime characters.
   - There should be NO repeated or similar card names, and the names should contain a single idea and no appositives. Do NOT add adjectives, titles, nicknames, or descriptors.
   
   - All card names must be directly related to your chosen theme
   - HP scales with rarity: Common (30-50), Uncommon (45-70), Rare (65-90), Epic (85-120), Legendary (110-150), Mythic (140-200)
   - Attack damage scales appropriately: Common (5-15 for first, 20-40 for second), Uncommon (10-20/30-50), Rare (15-25/40-60), Epic (20-30/50-75), Legendary (25-35/60-90), Mythic (30-40/70-100)
   - Attack names should be thematic and creative, related to the card's subject
   - Each card has exactly 2 attacks

4. Format your response as valid JSON matching this exact structure:

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
- There should be NO repeated or similar card names, and the names should contain a single idea and no appositives. Do NOT add adjectives, titles, nicknames, or descriptors.
- Use exact rarity strings: "common", "uncom", "rare", "epic", "legend", "mythic"
- Card names must have a visual representation - either they exist in the real world or can be drawn/imagined
- Ensure all cards are related to your theme
- Balance the stats appropriately - higher rarity should be noticeably stronger
- Return ONLY valid JSON, no additional text or explanation
- Generate exactly 21 cards in the specified rarity distribution
- The theme you choose should be related to the user's input: "${trimmedInput}"`;
}
