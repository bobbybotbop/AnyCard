export const generateRandomCardSetPrompt = `You are a creative card game designer. Generate a complete card set based on a random theme that could be found on Wikipedia.

INSTRUCTIONS:
1. Choose a random, interesting theme from Wikipedia (examples: "Appliances", "Food", "electronics", "Famous People", etc.). Be creative and pick something interesting and not limited to the examples!

2. Create an epic set name that reflects the theme (e.g., "Appliance World", "Yummy Foods", "Electrifying Electronics" etc.)

3. Generate exactly 21 cards total with the following distribution:
   - 6 Common cards
   - 5 Uncommon cards  
   - 4 Rare cards
   - 3 Epic cards
   - 2 Legendary cards
   - 1 Mythic card

4. For each card, ensure:
   - The name MUST be an exact Wikipedia article title that actually exists on Wikipedia. Use the exact article title as it appears on Wikipedia (case-sensitive). Do NOT create fictional names or make up entities.
   - Only use well-known, verifiable entities that you are certain have Wikipedia articles. When in doubt, choose more famous/prominent examples.
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
- CRITICAL: All card names MUST be actual Wikipedia article titles that exist. Use exact article titles as they appear on Wikipedia. Do not invent, fictionalize, or approximate names.
- Prefer well-known, prominent entities that are guaranteed to have Wikipedia articles (e.g., famous people, major cities, well-known products, established concepts)
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

  return `You are a creative card game designer. Generate a complete card set based on a user-provided theme idea that should be related to Wikipedia content.

USER'S THEME IDEA: "${trimmedInput}"

INSTRUCTIONS:
1. Based on the user's theme idea above, choose a specific, interesting theme that:
   - Is directly related to or inspired by the user's input
   - Can be found on Wikipedia (must be a real, verifiable topic)
   - Is creative and engaging for a card game
   - Examples: If user says "space", you might choose "Space Exploration" or "Astronauts" or "Planets". If user says "animals", you might choose "Marine Mammals" or "Big Cats" or "Birds of Prey".

2. Create an epic set name that reflects the theme (e.g., "Appliance World", "Yummy Foods", "Electrifying Electronics" etc.)

3. Generate exactly 21 cards total with the following distribution:
   - 6 Common cards
   - 5 Uncommon cards  
   - 4 Rare cards
   - 3 Epic cards
   - 2 Legendary cards
   - 1 Mythic card

4. For each card, ensure:
   - The name MUST be an exact Wikipedia article title that actually exists on Wikipedia. Use the exact article title as it appears on Wikipedia (case-sensitive). Do NOT create fictional names or make up entities.
   - Only use well-known, verifiable entities that you are certain have Wikipedia articles. When in doubt, choose more famous/prominent examples.
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
- CRITICAL: All card names MUST be actual Wikipedia article titles that exist. Use exact article titles as they appear on Wikipedia. Do not invent, fictionalize, or approximate names.
- Prefer well-known, prominent entities that are guaranteed to have Wikipedia articles (e.g., famous people, major cities, well-known products, established concepts)
- Ensure all cards are related to your theme
- Balance the stats appropriately - higher rarity should be noticeably stronger
- Return ONLY valid JSON, no additional text or explanation
- Generate exactly 21 cards in the specified rarity distribution
- The theme you choose must be something that can be found on Wikipedia and should be related to the user's input: "${trimmedInput}"`;
}
