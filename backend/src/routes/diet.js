import express from 'express';
import UserProfile from '../models/UserProfile.js';
import Food from '../models/Food.js';
import MealPlan from '../models/MealPlan.js';
import Progress from '../models/Progress.js';
import FoodAPIService from '../services/foodAPI.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// ========== PROTECTED ROUTES (Require Authentication) ==========

// All routes require authentication
router.use(authenticateToken);

// User Profile Routes
router.post('/profile', async (req, res) => {
    try {
        console.log('📝 Saving profile for user:', req.user.userId);
        
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
        console.log('📋 Fetching profile for user:', req.user.userId);
        
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
        
        console.log('🔍 Searching foods:', { search, category, page, limit });
        
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

        console.log(`✅ Found ${foods.length} foods`);
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

        console.log('🔍 External food search:', query);
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

// Add custom food to our database
router.post('/foods', async (req, res) => {
    try {
        console.log('➕ Adding custom food for user:', req.user.userId);
        
        const foodData = {
            ...req.body,
            createdBy: req.user.userId
        };

        const food = new Food(foodData);
        await food.save();

        console.log('✅ Food created successfully:', food.name);
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
        console.log('➕ Saving external food to database');
        
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
        console.log('📅 Fetching meal plan for:', date);
        
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

        console.log('💾 Saving meal plan for:', date);
        
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

        console.log('✅ Meal plan saved successfully');
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

// Progress Routes
router.post('/progress', async (req, res) => {
    try {
        console.log('📊 Recording progress for user:', req.user.userId);
        
        const progressData = {
            userId: req.user.userId,
            ...req.body
        };

        const progress = new Progress(progressData);
        await progress.save();

        console.log('✅ Progress recorded successfully');
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
        console.log('📈 Fetching progress history, limit:', limit);
        
        const progress = await Progress.find({ userId: req.user.userId })
            .sort({ date: -1 })
            .limit(parseInt(limit));

        console.log(`✅ Found ${progress.length} progress records`);
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
        console.log('🏠 Fetching dashboard data for user:', req.user.userId);
        
        const profile = await UserProfile.findOne({ userId: req.user.userId });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayMealPlan = await MealPlan.findOne({
            userId: req.user.userId,
            date: today
        }).populate('meals.items.food');

        const recentProgress = await Progress.findOne({
            userId: req.user.userId
        }).sort({ date: -1 });

        console.log('✅ Dashboard data fetched successfully');
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