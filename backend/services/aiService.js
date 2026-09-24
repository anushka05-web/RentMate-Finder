const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Fallback Rule-Based Compatibility Engine
 * Compares 13 detailed attributes and returns score and explanation.
 */
function calculateRuleBasedCompatibility(listing, profile) {
  let locationScore = 0;
  let budgetScore = 0;
  let roomFurnishScore = 0;
  let amenitiesScore = 0;
  let habitsScore = 0;
  let nearbyScore = 0;

  const logs = [];

  // 1. Location (City: 20 pts, Locality: 10 pts. Max: 30 pts)
  if (listing.location.toLowerCase() === profile.preferredLocation.toLowerCase()) {
    locationScore += 20;
    logs.push(`City: Match (${listing.location})`);
    
    // Locality check
    const listLoc = listing.locality.toLowerCase();
    const profLoc = profile.preferredLocality.toLowerCase();
    if (listLoc.includes(profLoc) || profLoc.includes(listLoc)) {
      locationScore += 10;
      logs.push(`Locality: Match (${listing.locality})`);
    } else {
      logs.push(`Locality: Different (${listing.locality} vs preferred ${profile.preferredLocality})`);
    }
  } else {
    logs.push(`City: Mismatch (Room in ${listing.location} vs preferred ${profile.preferredLocation})`);
  }

  // 2. Budget (Max: 20 pts)
  const rent = listing.rent;
  const min = profile.budgetMin;
  const max = profile.budgetMax;

  if (rent >= min && rent <= max) {
    budgetScore = 20;
    logs.push(`Budget: Rent ₹${rent.toLocaleString('en-IN')} fits range ₹${min.toLocaleString('en-IN')}-₹${max.toLocaleString('en-IN')}`);
  } else if (rent < min) {
    budgetScore = 18; // Slight deduction
    logs.push(`Budget: Rent ₹${rent.toLocaleString('en-IN')} is below min budget ₹${min.toLocaleString('en-IN')}`);
  } else {
    // Over budget
    const overPct = (rent - max) / max;
    budgetScore = Math.max(0, Math.round(20 - (overPct * 50)));
    logs.push(`Budget: Rent ₹${rent.toLocaleString('en-IN')} exceeds max budget by ${Math.round(overPct * 100)}%`);
  }

  // 3. Room Type & Furnishing (Max: 15 pts)
  if (listing.roomType === profile.preferredRoomType) {
    roomFurnishScore += 10;
    logs.push(`Room Type: Match (${listing.roomType})`);
  } else {
    logs.push(`Room Type: Mismatch (${listing.roomType} vs preferred ${profile.preferredRoomType})`);
  }

  if (listing.furnishing === profile.furnishingPreference) {
    roomFurnishScore += 5;
    logs.push(`Furnishing: Match (${listing.furnishing})`);
  } else {
    logs.push(`Furnishing: Mismatch (${listing.furnishing} vs preferred ${profile.furnishingPreference})`);
  }

  // 4. Amenities (Max: 15 pts)
  if (!profile.requiredAmenities || profile.requiredAmenities.length === 0) {
    amenitiesScore = 15;
    logs.push('Amenities: No specific required amenities');
  } else {
    const required = profile.requiredAmenities;
    const listingAms = listing.amenities || [];
    let matchCount = 0;
    required.forEach(am => {
      if (listingAms.includes(am)) matchCount++;
    });
    amenitiesScore = Math.round(15 * (matchCount / required.length));
    logs.push(`Amenities: Matched ${matchCount}/${required.length} required (${required.filter(x => listingAms.includes(x)).join(', ') || 'none'})`);
  }

  // 5. Habits & Preferences (Max: 15 pts)
  // Smoking (5 pts)
  if (listing.smoking === profile.smokingPreference) {
    habitsScore += 5;
    logs.push('Smoking: Habit aligned');
  } else {
    logs.push('Smoking: Habit conflict');
  }
  
  // Drinking (5 pts)
  if (listing.drinking === profile.drinkingPreference) {
    habitsScore += 5;
    logs.push('Drinking: Habit aligned');
  } else {
    logs.push('Drinking: Habit conflict');
  }

  // Food preference (5 pts)
  if (
    listing.foodPreference === 'Both' ||
    profile.foodPreference === 'Both' ||
    listing.foodPreference === profile.foodPreference
  ) {
    habitsScore += 5;
    logs.push(`Food: Compatible (${listing.foodPreference} vs ${profile.foodPreference})`);
  } else {
    logs.push(`Food: Conflict (${listing.foodPreference} vs ${profile.foodPreference})`);
  }

  // 6. Nearby (Max: 5 pts)
  if (!profile.nearbyPreference || profile.nearbyPreference.length === 0) {
    nearbyScore = 5;
  } else {
    const preferredNear = profile.nearbyPreference;
    const listingNear = listing.nearby || [];
    let nearMatchCount = 0;
    preferredNear.forEach(facility => {
      if (listingNear.includes(facility)) nearMatchCount++;
    });
    nearbyScore = Math.round(5 * (nearMatchCount / preferredNear.length));
    logs.push(`Nearby: ${nearMatchCount}/${preferredNear.length} proximities matched`);
  }

  const totalScore = locationScore + budgetScore + roomFurnishScore + amenitiesScore + habitsScore + nearbyScore;
  const explanation = `Score breakdown: ${logs.join('; ')}. Total Match: ${totalScore}/100.`;

  return {
    score: Math.min(100, Math.max(0, totalScore)),
    explanation,
    calculatedBy: 'Rule-Based'
  };
}

/**
 * Main Compatibility Score function
 * Computes scores utilizing Google Gemini and compares all 13 fields, falling back to rule-based logic.
 */
async function calculateCompatibility(listing, profile) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return calculateRuleBasedCompatibility(listing, profile);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
You are an AI matching engine for flatmates and rental rooms in India.
Analyze and compare the following Room Listing details and Tenant Profile requirements. Compute a compatibility score between 0 and 100 comparing ALL parameters.

Room Listing:
- Title: ${listing.title}
- Description: ${listing.description}
- City: ${listing.location}
- Locality: ${listing.locality}
- Address: ${listing.address}
- Rent: ₹${listing.rent}/month
- Security Deposit: ₹${listing.securityDeposit}
- Available From: ${listing.availableFrom}
- Room Type: ${listing.roomType}
- Furnishing: ${listing.furnishing}
- Amenities: ${JSON.stringify(listing.amenities)}
- Food Preference: ${listing.foodPreference}
- Gender Preference: ${listing.genderPreference}
- Smoking: ${listing.smoking}
- Drinking: ${listing.drinking}
- Guests: ${listing.guests}
- Occupancy: ${listing.occupancy}
- Nearby Proximities: ${JSON.stringify(listing.nearby)}

Tenant Profile:
- Preferred City: ${profile.preferredLocation}
- Preferred Locality: ${profile.preferredLocality}
- Budget Range: ₹${profile.budgetMin} to ₹${profile.budgetMax}/month
- Move-in Date: ${profile.moveInDate}
- Preferred Room Type: ${profile.preferredRoomType}
- Furnishing Preference: ${profile.furnishingPreference}
- Required Amenities: ${JSON.stringify(profile.requiredAmenities)}
- Food Preference: ${profile.foodPreference}
- Tenant Gender: ${profile.gender}
- Smoking Preference: ${profile.smokingPreference}
- Drinking Preference: ${profile.drinkingPreference}
- Occupancy Preference: ${profile.preferredOccupancy}
- Nearby Preference: ${JSON.stringify(profile.nearbyPreference)}

Rules:
1. Compare budget range, location, and locality matching.
2. Compare amenities match ratio and furnishing alignment.
3. Compare living rules (smoking, drinking, guests, food preference).
4. Compare proximity features (nearby transit like Metro, bus stop, colleges).
5. Output a final score between 0 and 100.
6. Provide a concise explanation (2-3 sentences) detailing the key matches and mismatches, specifying currency in Rupees (e.g., ₹14,500).

Return ONLY a JSON object (do not wrap in markdown code blocks) of this shape:
{
  "score": number,
  "explanation": "string"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Unparseable LLM output: ' + text);
      }
    }

    if (typeof parsed.score !== 'number' || !parsed.explanation) {
      throw new Error('Response is missing score or explanation fields');
    }

    return {
      score: Math.min(100, Math.max(0, Math.round(parsed.score))),
      explanation: parsed.explanation,
      calculatedBy: 'AI',
    };
  } catch (error) {
    console.warn('Gemini API call failed. Falling back to Rule-Based matching. Error:', error.message);
    return calculateRuleBasedCompatibility(listing, profile);
  }
}

module.exports = {
  calculateCompatibility,
  calculateRuleBasedCompatibility
};
