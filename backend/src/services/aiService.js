import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Initialize the Gemini AI with the API Key from .env
const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing in backend .env file. Please add it to use AI features.");
    }
    return new GoogleGenerativeAI(apiKey);
};

/**
 * Generates a full day's meal plan using Google Gemini AI
 * @param {Object} profile - User's nutrition profile and targets
 * @returns {Promise<Object>} - Structured JSON meal plan
 */
export const generateDailyMenu = async (profile) => {
    try {
        const genAI = getGenAI();

        // Use gemini-flash-latest
        // This model has a working free-tier quota for this project
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest"
        });

        const prompt = `
            You are an expert AI nutritionist. Create a delicious, balanced 3-meal diet plan (Breakfast, Lunch, Dinner) tailored for a user with these targets:
            - Goal: ${profile.goal || 'maintenance'}
            - Total Calories: ${profile.dailyCalories} kcal
            - Target Macros: Protein: ${profile.proteinTarget}g, Carbs: ${profile.carbsTarget}g, Fat: ${profile.fatTarget}g
            - Dietary Restrictions: ${profile.dietaryRestrictions?.join(', ') || 'None'}
            - Known Allergies: ${profile.allergies?.join(', ') || 'None'}

            Rules:
            1. Suggest real, common foods.
            2. Split calories roughly as: Breakfast (25%), Lunch (40%), Dinner (35%).
            3. The sum of all meal nutrition MUST be within 5% of the totals provided above.
            4. Return ONLY a JSON object. Do not include markdown or explanations.
            5. STRICT DIETARY FILTERING: 
               - If 'vegetarian' is listed: EXCLUDE all meat, poultry, fish, seafood, and EGGS. (Focus on dairy and plant-based).
               - If 'vegan' is listed: EXCLUDE all animal products (no dairy, no honey, no eggs).
               - If any allergy is listed: EXCLUDE those ingredients entirely.

            JSON Schema:
            {
              "meals": [
                {
                  "name": "breakfast",
                  "items": [
                    { 
                        "name": "string (food name)", 
                        "servingSize": { "amount": number, "unit": "g|ml|piece" },
                        "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number } 
                    }
                  ]
                },
                ... repeat for "lunch" and "dinner"
              ]
            }
        `;

        console.log(`🤖 Requesting automated meal plan for ${profile.dailyCalories} kcal...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean the response: sometimes AI returns ```json { ... } ```
        // We use a regex to extract the first valid JSON object
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const menuData = JSON.parse(jsonMatch[0]);
            console.log("✅ Automated Menu Generated successfully");
            return menuData;
        } else {
            console.error("❌ AI did not return a valid JSON object. Text:", text);
            throw new Error("AI response format was invalid.");
        }

    } catch (error) {
        console.error("❌ Error in Automation Service:", error);
        throw error;
    }
};

export default { generateDailyMenu };
