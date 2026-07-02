import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import UserProfile from '../models/UserProfile.js';
import MealPlan from '../models/MealPlan.js';
import { authenticateToken } from './auth.js';

dotenv.config();

const router = express.Router();

// Initialize the Gemini AI — uses a dedicated chat key (separate quota)
const getGenAI = () => {
    let apiKey = process.env.GEMINI_CHAT_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_CHAT_API_KEY (or GEMINI_API_KEY) is missing in .env file.");
    }
    // Strip surrounding quotes if present
    apiKey = apiKey.replace(/^["']|["']$/g, '');
    return new GoogleGenerativeAI(apiKey);
};

// In-memory rate limiting per user
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 15;

// Blocked topics categories check
const BLOCKED_KEYWORDS = [
    // programming/coding
    'javascript', 'python', 'java', 'html', 'css', 'react', 'node', 'code', 'programming', 'coding', 'software', 'developer', 'github',
    // finance/crypto
    'finance', 'cryptocurrency', 'crypto', 'bitcoin', 'ethereum', 'stock', 'shares', 'investing', 'portfolio', 'wall street',
    // politics
    'politics', 'election', 'democrat', 'republican', 'senator', 'parliament', 'president', 'government',
    // gaming
    'gaming', 'playstation', 'xbox', 'nintendo', 'gta', 'fortnite', 'minecraft',
    // movies/entertainment
    'movie', 'cinema', 'hollywood', 'netflix', 'actor', 'actress', 'director',
    // sports (non-fitness related sports chat)
    'soccer', 'football', 'basketball', 'cricket', 'baseball', 'olympics', 'fifa',
    // legal
    'legal', 'lawyer', 'attorney', 'court', 'lawsuit', 'sue'
];

// Fallback message for out-of-scope requests
const CANNED_REFUSAL = "I'm DietPlanner AI and I specialize in nutrition, food, health, fitness, meal planning, and dietary goals. I cannot assist with unrelated topics.";

// SYSTEM PROMPT TEMPLATE
const SYSTEM_PROMPT_TEMPLATE = `You are DietPlanner AI, an intelligent health, nutrition, and fitness assistant integrated into the DietPlanner application.

Your role is to provide personalized guidance related to:
- Nutrition and healthy eating
- Calories and macronutrients
- Meal planning
- Weight management goals
- Muscle gain and fat loss nutrition
- Protein intake optimization
- Food recommendations and substitutions
- Portion sizes and serving recommendations
- Grocery planning
- Hydration
- Dietary restrictions and allergies
- General health and fitness questions
- Workout nutrition and recovery
- Pre-workout and post-workout meal suggestions
- Healthy lifestyle habits

You are NOT a general-purpose chatbot.

------------------------------------------------------------
RESPONSE STYLE AND LENGTH
------------------------------------------------------------

Responses must be:
- Personalized, practical, concise, friendly, and actionable.
- Under 180 words unless the user explicitly asks for more detail.
- For simple factual questions (e.g. "How many calories left?"), answer in 1–2 sentences.
- Use bullet points for food lists and macro breakdowns.
- Do NOT use markdown headers (##, ###) in your responses.
- When recommending foods, include estimated calories, protein, and macros.
- Always explain why a recommendation fits the user's goals.

------------------------------------------------------------
CORE RESPONSIBILITIES
------------------------------------------------------------

1. Answer questions about the user's nutritional goals and progress.
   Examples: "How many calories do I have left today?" / "Am I hitting my protein?"

2. Answer questions regarding dietary restrictions and allergies.
   Examples: "Can I eat peanuts?" / "Do any meals conflict with my restrictions?"

3. Help users understand and improve their meal plans.
   Examples: "Is my breakfast balanced?" / "What can I replace paneer with?"

4. Provide food recommendations tailored to the user's goals.
   Examples: High-protein snacks, low-calorie dinners, pre/post-workout meals.

5. Answer general health and fitness questions related to:
   Nutrition, weight loss, weight gain, muscle building, recovery, hydration,
   exercise nutrition, and healthy habits.

------------------------------------------------------------
MEAL PLANNING LOGIC & GENERATION CONSTRAINTS
------------------------------------------------------------

When users ask for meal recommendations:

Step 1: Check whether the requested meal already exists in the user's meal plan.

If it EXISTS:
- Present the planned meal.
- Explain why it fits their goals.
- Provide estimated calories and macros.

If it does NOT EXIST:
- Generate a suitable meal recommendation.
- Generated meals MUST fit these constraints:
  1. Fit within remaining calories ±10%.
  2. Aim to satisfy remaining protein goals.
  3. Avoid repeating foods excessively.
  4. Respect dietary restrictions and allergies.
  5. Prefer foods already present in the user's dietary pattern (e.g., if they are vegetarian/vegan, do not recommend meat/fish).
- Include: foods, approximate portion sizes, estimated calories, protein, carbs, fat, and why it fits the user's goals.

------------------------------------------------------------
NUTRITION PRIORITIES BY GOAL
------------------------------------------------------------

Weight gain   → Prioritize calorie surplus. Encourage protein-rich, nutrient-dense foods.
Fat loss      → Prioritize satiety and protein. Recommend lower-calorie alternatives.
Muscle gain   → Prioritize protein. Recommend sufficient carbs for training performance.
Protein low   → Always prioritize high-protein recommendations.
Calories over target → Suggest lighter meals and lean protein sources only.

------------------------------------------------------------
SAFETY & EMERGENCY ESCALATION RULES
------------------------------------------------------------

1. Never recommend foods that conflict with the user's allergies or dietary restrictions.
2. Never encourage starvation diets, extreme calorie deficits, or dangerous weight loss methods.
3. Never provide medical diagnoses or replace professional medical advice.
4. EMERGENCY RULE: If the user reports chest pain, fainting, severe allergic reactions, eating disorder behaviors, or other dangerous symptoms, do NOT provide any advice and immediately instruct them to seek immediate medical care or contact emergency services.

For medical concerns: Advise users to consult a qualified healthcare professional.

------------------------------------------------------------
INCOMPLETE PROFILE HANDLING
------------------------------------------------------------

If any profile value in LIVE USER DATA is null, missing, or zero:
- Do NOT make up or assume numbers.
- Politely inform the user that their profile needs to be completed in Settings before you can give fully personalized advice.
- Offer general, evidence-based guidance in the meantime (without citing specific numbers).

Example response when profile is incomplete:
"It looks like your profile isn't fully set up yet. Head to Settings to add your weight, height, and goal so I can give you personalized numbers. In the meantime, here's some general guidance..."

------------------------------------------------------------
OUT OF SCOPE REQUESTS
------------------------------------------------------------

You may answer questions related to: nutrition, food, fitness, exercise, weight management, healthy habits, recovery, and hydration.
You must politely refuse requests unrelated to these domains.

For such requests respond with EXACTLY this:
"I'm DietPlanner AI and I specialize in nutrition, food, health, fitness, meal planning, and dietary goals. I cannot assist with unrelated topics."

------------------------------------------------------------
CRITICAL DATA RULE
------------------------------------------------------------

ALWAYS check LIVE USER DATA before answering any numerical question.
NEVER use example numbers. NEVER say "typically" when real data is available.
The LIVE USER DATA section below is the source of truth — treat it as such.

------------------------------------------------------------
LIVE USER DATA (injected at runtime — source of truth)
------------------------------------------------------------

Profile:
- Goal: {{goal}}
- Daily Calorie Target: {{dailyCalories}} kcal
- Protein Target: {{proteinTarget}}g | Carbs Target: {{carbsTarget}}g | Fat Target: {{fatTarget}}g
- Activity Level: {{activityLevel}}
- Dietary Restrictions: {{restrictions}}
- Allergies: {{allergies}}
- Height: {{height}} cm | Weight: {{weight}} kg
- BMI: {{bmi}}

Today's Progress:
- Consumed: {{consumed.calories}} kcal | Protein: {{consumed.protein}}g | Carbs: {{consumed.carbs}}g | Fat: {{consumed.fat}}g
- Remaining: {{remaining.calories}} kcal | Protein: {{remaining.protein}}g | Carbs: {{remaining.carbs}}g | Fat: {{remaining.fat}}g

Today's Meal Plan:
{{mealsText}}`;

// POST /api/chat
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { message, history } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // 1. In-memory Rate Limiting
        const now = Date.now();
        const userLimit = rateLimits.get(userId) || { count: 0, windowStart: now };
        if (now - userLimit.windowStart > RATE_LIMIT_WINDOW) {
            userLimit.count = 1;
            userLimit.windowStart = now;
        } else {
            userLimit.count++;
        }
        rateLimits.set(userId, userLimit);

        if (userLimit.count > MAX_REQUESTS) {
            return res.status(429).json({
                success: false,
                message: "You're sending messages too fast. Please wait a moment.",
                code: "RATE_LIMITED"
            });
        }

        // 2. Off-topic category pre-filter (regex boundary matching to avoid false positives)
        const isOffTopic = BLOCKED_KEYWORDS.some(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(message);
        });

        if (isOffTopic) {
            return res.json({
                success: true,
                reply: CANNED_REFUSAL
            });
        }

        // 3. Context Assembly
        const profile = await UserProfile.findOne({ userId });
        
        const todayNow = new Date();
        const todayUtc = new Date(`${todayNow.getFullYear()}-${String(todayNow.getMonth() + 1).padStart(2, '0')}-${String(todayNow.getDate()).padStart(2, '0')}`);
        
        const mealPlan = await MealPlan.findOne({
            userId,
            date: todayUtc
        }).populate('meals.items.food');

        // Calculate consumed targets
        const consumed = mealPlan?.dailyTotal || { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const remaining = {
            calories: (profile?.dailyCalories || 2000) - consumed.calories,
            protein: (profile?.proteinTarget || 50) - consumed.protein,
            carbs: (profile?.carbsTarget || 250) - consumed.carbs,
            fat: (profile?.fatTarget || 70) - consumed.fat
        };

        // Calculate BMI
        let bmi = 'not set';
        if (profile?.weight && profile?.height) {
            const heightInMeters = profile.height / 100;
            const calculatedBmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
            let bmiCategory = '';
            if (calculatedBmi < 18.5) bmiCategory = 'Underweight';
            else if (calculatedBmi >= 18.5 && calculatedBmi < 25) bmiCategory = 'Normal range';
            else if (calculatedBmi >= 25 && calculatedBmi < 30) bmiCategory = 'Overweight';
            else bmiCategory = 'Obese';
            bmi = `${calculatedBmi} (${bmiCategory})`;
        }

        // Build meal plan string
        const mealsText = mealPlan?.meals?.length
            ? mealPlan.meals.map(m => {
                const itemsList = m.items.map(i => {
                    const foodName = i.food?.name || i.customName || 'Unknown';
                    const amountText = `${i.servingSize?.amount || 0} ${i.servingSize?.unit || ''}`;
                    return `${foodName} (${amountText})`;
                }).join(', ');
                return `- ${m.name}: ${itemsList || 'None'}`;
            }).join('\n')
            : 'No meals planned today yet.';

        // Build prompt from template
        const systemInstruction = SYSTEM_PROMPT_TEMPLATE
            .replace('{{goal}}', profile?.goal || 'not set')
            .replace('{{dailyCalories}}', profile?.dailyCalories || 'not set')
            .replace('{{proteinTarget}}', profile?.proteinTarget || 'not set')
            .replace('{{carbsTarget}}', profile?.carbsTarget || 'not set')
            .replace('{{fatTarget}}', profile?.fatTarget || 'not set')
            .replace('{{activityLevel}}', profile?.activityLevel || 'not set')
            .replace('{{restrictions}}', profile?.dietaryRestrictions?.join(', ') || 'None')
            .replace('{{allergies}}', profile?.allergies?.join(', ') || 'None')
            .replace('{{height}}', profile?.height || 'not set')
            .replace('{{weight}}', profile?.weight || 'not set')
            .replace('{{bmi}}', bmi)
            .replace('{{consumed.calories}}', consumed.calories)
            .replace('{{consumed.protein}}', consumed.protein)
            .replace('{{consumed.carbs}}', consumed.carbs)
            .replace('{{consumed.fat}}', consumed.fat)
            .replace('{{remaining.calories}}', remaining.calories)
            .replace('{{remaining.protein}}', remaining.protein)
            .replace('{{remaining.carbs}}', remaining.carbs)
            .replace('{{remaining.fat}}', remaining.fat)
            .replace('{{mealsText}}', mealsText);

        // 4. Initialize Gemini API
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: systemInstruction
        });

        // 5. Clean and format history (capping at last 10 messages)
        let rawHistory = Array.isArray(history) ? history : [];
        if (rawHistory.length > 10) {
            rawHistory = rawHistory.slice(-10);
        }

        // Filter out empty messages and ensure proper formatting
        const formattedHistory = rawHistory
            .filter(msg => {
                const text = msg.parts?.[0]?.text || msg.text || '';
                return text.trim().length > 0;
            })
            .map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.parts?.[0]?.text || msg.text || '' }]
            }));

        // Ensure history starts with 'user' role (Gemini requirement)
        while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
            formattedHistory.shift();
        }

        // 6. Start chat session
        const chat = model.startChat({
            history: formattedHistory
        });

        const usedKey = (process.env.GEMINI_CHAT_API_KEY || process.env.GEMINI_API_KEY || '').substring(0, 10);
        console.log(`💬 AI Chat: user=${userId}, key=${usedKey}..., historyLen=${formattedHistory.length}, msgLen=${message.length}`);
        
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const replyText = response.text();

        res.json({
            success: true,
            reply: replyText
        });

    } catch (error) {
        console.error('❌ Chat API error:', error.status, error.statusText, error.message);
        
        // Detect Gemini quota/rate limit errors and surface them clearly
        if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
            return res.status(503).json({
                success: false,
                message: 'AI service is temporarily unavailable due to quota limits. Please try again in a minute.',
                code: 'GEMINI_QUOTA'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'An error occurred while communicating with the AI. Please try again.',
            error: error.message
        });
    }
});

export default router;
