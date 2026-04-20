import express from 'express';
import UserProfile from '../models/UserProfile.js';
import Food from '../models/Food.js';
import MealPlan from '../models/MealPlan.js';
import Progress from '../models/Progress.js';
import FoodAPIService from '../services/foodAPI.js';
import { authenticateToken } from './auth.js';
import { generateDailyMenu } from '../services/aiService.js';

const router = express.Router();

// ========== PROTECTED ROUTES (Require Authentication) ==========

// All routes require authentication
router.use(authenticateToken);

// User Profile Routes
router.post('/profile', async (req, res) => {
    try {
        const profileData = {
            userId: req.user.userId,
            ...req.body
        };

        let profile = await UserProfile.findOne({ userId: req.user.userId });
        
        if (profile) {
            profile = await UserProfile.findOneAndUpdate(
                { userId: req.user.userId },
                profileData,
                { new: true, runValidators: true }
            );
        } else {
            profile = new UserProfile(profileData);
            await profile.save();
        }

        if (profile.age && profile.height && profile.weight && profile.gender) {
            profile.calculateTargets();
            await profile.save();
        }

        console.log('✅ Profile saved successfully');
        res.json({
            success: true,
            message: 'Profile saved successfully',
            profile
        });
    } catch (error) {
        console.error('❌ Profile save error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving profile',
            error: error.message
        });
    }
});

router.get('/profile', async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.user.userId });
        
        if (!profile) {
            return res.json({
                success: true,
                profile: null
            });
        }

        res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('❌ Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// Food Routes - Search our database
router.get('/foods', async (req, res) => {
    try {
        const { search, category, page = 1, limit = 20 } = req.query;
        let query = { isPublic: true };
        
        if (search && search.trim() !== '') {
            query.$text = { $search: search };
        }
        
        if (category && category !== '') {
            query.category = category;
        }

        const foods = await Food.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ name: 1 });

        const total = await Food.countDocuments(query);

        res.json({
            success: true,
            foods,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('❌ Foods fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching foods',
            error: error.message
        });
    }
});

// Food Routes - Search external APIs
router.get('/foods/search', async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const results = await FoodAPIService.searchFoods(query);

        res.json({
            success: true,
            results,
            count: results.length
        });
    } catch (error) {
        console.error('❌ Food search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching foods',
            error: error.message
        });
    }
});

// AI Meal Generation Route — MUST be before /meal-plan/:date to avoid 'generate' being treated as a date
router.post('/meal-plan/generate', async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.user.userId });
        
        if (!profile || !profile.age) {
            return res.status(400).json({
                success: false,
                message: 'Please complete your profile to generate a tailored plan.'
            });
        }

        // 2. Call AI Service
        const aiResponse = await generateDailyMenu(profile);

        // 3. Process and save AI-generated foods into our database
        // This ensures they have real ObjectIds for the MealPlan model
        const processedMeals = await Promise.all(aiResponse.meals.map(async (meal) => {
            const processedItems = await Promise.all(meal.items.map(async (item) => {
                // Try to find if this food already exists
                let food = await Food.findOne({ 
                    name: item.name,
                    'nutrition.calories': item.nutrition.calories,
                    brand: 'AI Generated'
                });

                if (!food) {
                    // Create new food entry
                    food = new Food({
                        name: item.name,
                        brand: 'AI Generated',
                        servingSize: item.servingSize,
                        nutrition: item.nutrition,
                        category: 'other',
                        source: 'sample',
                        isPublic: false,
                        createdBy: req.user.userId
                    });
                    await food.save();
                }

                return {
                    food: food,
                    servingSize: item.servingSize
                };
            }));

            return {
                ...meal,
                items: processedItems
            };
        }));

        // 4. Return the generated meals
        res.json({
            success: true,
            meals: processedMeals
        });

    } catch (error) {
        console.error('❌ Generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate menu: ' + error.message
        });
    }
});

// Add custom food to our database
router.post('/foods', async (req, res) => {
    try {
        const foodData = {
            ...req.body,
            createdBy: req.user.userId
        };

        const food = new Food(foodData);
        await food.save();

        res.status(201).json({
            success: true,
            message: 'Food created successfully',
            food
        });
    } catch (error) {
        console.error('❌ Food creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating food',
            error: error.message
        });
    }
});

// Save external food to our database
router.post('/foods/save-external', async (req, res) => {
    try {
        const { foodData } = req.body;
        const userId = req.user?.userId;
        
        if (!foodData || !foodData.name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Food data is required' 
            });
        }
        
        // Check if food already exists by externalId or similar name
        let existingFood = null;
        
        if (foodData.externalId) {
            existingFood = await Food.findOne({ 
                externalId: foodData.externalId 
            });
        }
        
        // If not found by externalId, check by name and nutrition
        if (!existingFood) {
            existingFood = await Food.findOne({ 
                name: foodData.name,
                'nutrition.calories': foodData.nutrition?.calories || 0,
                source: foodData.source || 'usda'
            });
        }
        
        if (!existingFood) {
            // Create new food
            existingFood = new Food({
                name: foodData.name,
                brand: foodData.brand || 'Generic',
                servingSize: foodData.servingSize || { 
                    amount: 100, 
                    unit: 'g' 
                },
                nutrition: foodData.nutrition || {
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    fiber: 0,
                    sugar: 0,
                    sodium: 0,
                    cholesterol: 0
                },
                category: foodData.category || 'other',
                source: foodData.source || 'usda',
                externalId: foodData.externalId,
                isPublic: true,
                createdBy: userId || null
            });
            await existingFood.save();
            console.log(`✅ New food saved: ${existingFood.name}`);
        } else {
            console.log(`✅ Food already exists: ${existingFood.name}`);
        }
        
        res.json({ 
            success: true, 
            food: existingFood 
        });
        
    } catch (error) {
        console.error('❌ Error saving external food:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save food: ' + error.message 
        });
    }
});

// Meal Plan Routes
router.get('/meal-plan/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const mealPlan = await MealPlan.findOne({
            userId: req.user.userId,
            date: new Date(date)
        }).populate('meals.items.food');

        if (!mealPlan) {
            return res.json({
                success: true,
                mealPlan: { 
                    date: new Date(date), 
                    meals: [],
                    notes: ''
                }
            });
        }

        res.json({
            success: true,
            mealPlan
        });
    } catch (error) {
        console.error('❌ Meal plan fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meal plan',
            error: error.message
        });
    }
});

router.post('/meal-plan/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const { meals, notes } = req.body;
        let mealPlan = await MealPlan.findOne({
            userId: req.user.userId,
            date: new Date(date)
        });

        if (mealPlan) {
            mealPlan.meals = meals;
            mealPlan.notes = notes;
        } else {
            mealPlan = new MealPlan({
                userId: req.user.userId,
                date: new Date(date),
                meals,
                notes
            });
        }

        await mealPlan.save();
        await mealPlan.populate('meals.items.food');

        res.json({
            success: true,
            message: 'Meal plan saved successfully',
            mealPlan
        });
    } catch (error) {
        console.error('❌ Meal plan save error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving meal plan',
            error: error.message
        });
    }
});

// Grocery List Route
router.get('/grocery-list', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
        }

        const mealPlans = await MealPlan.find({
            userId: req.user.userId,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).populate('meals.items.food');

        // Aggregate foods
        const aggregatedFoods = {};

        mealPlans.forEach(plan => {
            plan.meals.forEach(meal => {
                if (!meal.items) return;
                meal.items.forEach(item => {
                    if (item.food) {
                        const foodId = item.food._id.toString();
                        const unit = item.servingSize?.unit?.toLowerCase() || 'g';
                        const amount = parseFloat(item.servingSize?.amount) || 0;
                        
                        // Use foodId + unit as unique key to prevent merging incompatible units (g vs cup)
                        const key = `${foodId}_${unit}`;

                        if (!aggregatedFoods[key]) {
                            aggregatedFoods[key] = {
                                food: item.food,
                                totalAmount: 0,
                                unit: unit,
                                category: item.food.category || 'other'
                            };
                        }
                        aggregatedFoods[key].totalAmount += amount;
                    }
                });
            });
        });

        // Group by category
        const groceryList = Object.values(aggregatedFoods).reduce((grouped, item) => {
            const cat = item.category;
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push({
                foodId: item.food._id,
                name: item.food.name,
                brand: item.food.brand,
                totalAmount: Math.round(item.totalAmount * 10) / 10,
                unit: item.unit
            });
            return grouped;
        }, {});

        res.json({
            success: true,
            groceryList,
            totalItems: Object.keys(aggregatedFoods).length
        });
    } catch (error) {
        console.error('❌ Grocery list fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching grocery list',
            error: error.message
        });
    }
});

// Progress Routes
router.post('/progress', async (req, res) => {
    try {
        const progressData = {
            userId: req.user.userId,
            ...req.body
        };

        const progress = new Progress(progressData);
        await progress.save();

        res.status(201).json({
            success: true,
            message: 'Progress recorded successfully',
            progress
        });
    } catch (error) {
        console.error('❌ Progress recording error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording progress',
            error: error.message
        });
    }
});

router.get('/progress', async (req, res) => {
    try {
        const { limit = 30 } = req.query;
        const progress = await Progress.find({ userId: req.user.userId })
            .sort({ date: -1 })
            .limit(parseInt(limit));
        res.json({
            success: true,
            progress
        });
    } catch (error) {
        console.error('❌ Progress fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching progress',
            error: error.message
        });
    }
});

// Dashboard Stats
router.get('/dashboard', async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.user.userId });
        const now = new Date();
        const todayUtc = new Date(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
        
        const todayMealPlan = await MealPlan.findOne({
            userId: req.user.userId,
            date: todayUtc
        }).populate('meals.items.food');

        const recentProgress = await Progress.findOne({
            userId: req.user.userId
        }).sort({ date: -1 });

        res.json({
            success: true,
            stats: {
                profile: profile || {},
                todayMealPlan: todayMealPlan || { meals: [] },
                recentWeight: recentProgress?.weight || null,
                lastUpdated: recentProgress?.date || null
            }
        });
    } catch (error) {
        console.error('❌ Dashboard fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
});

export default router;