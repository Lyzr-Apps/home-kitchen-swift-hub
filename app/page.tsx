'use client'

import { useState } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { FiSearch, FiHome, FiBookmark, FiUser, FiPlus, FiX, FiClock, FiFilter, FiChevronLeft, FiHeart, FiTrendingUp, FiCalendar, FiTarget } from 'react-icons/fi'
import { GiCookingPot, GiTomato, GiOnion, GiBowlOfRice, GiEggClutch, GiChiliPepper } from 'react-icons/gi'
import { MdRestaurantMenu } from 'react-icons/md'
import { BiDumbbell } from 'react-icons/bi'
import { AiOutlineLineChart } from 'react-icons/ai'

// TypeScript Interfaces from actual agent response
interface Nutrition {
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
  fiber_g: number
  vitamins: string[]
}

interface Recipe {
  recipe_name: string
  cuisine_type: string
  ingredients_matched: string[]
  missing_ingredients: any[]
  substitutions: any[]
  cooking_time: string
  difficulty: string
  spice_level: string
  nutrition: Nutrition
  tags: string[]
  instructions_summary: string
}

interface RecipeResponse {
  status: string
  result: {
    recipes: Recipe[]
    total_matches: number
    ingredient_usage_percent: number
    language: string
  }
  metadata: {
    agent_name: string
    timestamp: string
  }
}

// New interfaces for tracking
interface DailyNutrition {
  date: string
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
  meals: string[]
}

interface MealPlan {
  id: string
  day: string
  breakfast: Recipe | null
  lunch: Recipe | null
  dinner: Recipe | null
  snacks: Recipe | null
}

interface NutritionGoals {
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
}

// Ingredient categories
const ingredientCategories = {
  Vegetables: [
    { name: 'Onion', icon: GiOnion },
    { name: 'Tomato', icon: GiTomato },
    { name: 'Potatoes', icon: GiTomato },
    { name: 'Peas', icon: GiTomato },
    { name: 'Carrots', icon: GiTomato },
    { name: 'Spinach', icon: GiTomato },
    { name: 'Cauliflower', icon: GiTomato },
    { name: 'Bell Pepper', icon: GiTomato },
  ],
  Proteins: [
    { name: 'Chicken', icon: GiCookingPot },
    { name: 'Eggs', icon: GiEggClutch },
    { name: 'Paneer', icon: GiCookingPot },
    { name: 'Dal', icon: GiBowlOfRice },
    { name: 'Chickpeas', icon: GiBowlOfRice },
    { name: 'Fish', icon: GiCookingPot },
    { name: 'Tofu', icon: GiCookingPot },
    { name: 'Beans', icon: GiBowlOfRice },
  ],
  Grains: [
    { name: 'Rice', icon: GiBowlOfRice },
    { name: 'Wheat Flour', icon: GiBowlOfRice },
    { name: 'Pasta', icon: GiBowlOfRice },
    { name: 'Quinoa', icon: GiBowlOfRice },
    { name: 'Oats', icon: GiBowlOfRice },
    { name: 'Bread', icon: GiBowlOfRice },
  ],
  Dairy: [
    { name: 'Milk', icon: GiCookingPot },
    { name: 'Yogurt', icon: GiCookingPot },
    { name: 'Cheese', icon: GiCookingPot },
    { name: 'Butter', icon: GiCookingPot },
    { name: 'Cream', icon: GiCookingPot },
  ],
  Spices: [
    { name: 'Cumin', icon: GiChiliPepper },
    { name: 'Turmeric', icon: GiChiliPepper },
    { name: 'Coriander', icon: GiChiliPepper },
    { name: 'Chili Powder', icon: GiChiliPepper },
    { name: 'Garam Masala', icon: GiChiliPepper },
    { name: 'Salt', icon: GiChiliPepper },
    { name: 'Pepper', icon: GiChiliPepper },
  ],
  Pantry: [
    { name: 'Oil', icon: GiCookingPot },
    { name: 'Garlic', icon: GiOnion },
    { name: 'Ginger', icon: GiOnion },
    { name: 'Sugar', icon: GiCookingPot },
    { name: 'Soy Sauce', icon: GiCookingPot },
  ],
}

const quickAddIngredients = ['Onion', 'Tomato', 'Rice', 'Dal', 'Eggs', 'Paneer']

// Recipe card component
function RecipeCard({ recipe, onClick, isFavorite, onToggleFavorite }: {
  recipe: Recipe
  onClick: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
}) {
  const matchPercent = recipe.ingredients_matched.length > 0
    ? Math.round((recipe.ingredients_matched.length / (recipe.ingredients_matched.length + recipe.missing_ingredients.length)) * 100)
    : 100

  const spiceDots = {
    'mild': 1,
    'medium': 2,
    'hot': 3,
    'very hot': 4,
  }[recipe.spice_level.toLowerCase()] || 1

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-md overflow-hidden"
      onClick={onClick}
      style={{ backgroundColor: '#FFFEF9', borderRadius: '16px' }}
    >
      <div className="h-32 relative" style={{ backgroundColor: '#CD8B62' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <GiCookingPot className="text-white text-5xl opacity-30" />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
        >
          <FiHeart className={isFavorite ? "text-red-500 fill-current" : "text-gray-600"} />
        </button>
        <div className="absolute bottom-2 left-2 bg-white px-3 py-1 rounded-full text-xs font-medium" style={{ color: '#5D4E37' }}>
          {matchPercent}% Match
        </div>
      </div>
      <CardContent className="pt-4 pb-3">
        <h3 className="font-bold text-lg mb-2" style={{ color: '#5D4E37' }}>{recipe.recipe_name}</h3>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#9CAF88', color: 'white' }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm mb-2" style={{ color: '#808557' }}>
          <div className="flex items-center gap-1">
            <FiClock className="text-xs" />
            <span>{recipe.cooking_time}</span>
          </div>
          <span className="capitalize">{recipe.difficulty}</span>
          <span>{recipe.cuisine_type}</span>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs" style={{ color: '#808557' }}>Spice:</span>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: i < spiceDots ? '#CD8B62' : '#E5E5E5' }}
            />
          ))}
        </div>

        {recipe.missing_ingredients.length > 0 && (
          <div className="text-xs mt-2 p-2 rounded" style={{ backgroundColor: '#F5F1EB', color: '#808557' }}>
            Missing: {recipe.missing_ingredients.slice(0, 2).join(', ')}
            {recipe.missing_ingredients.length > 2 && ` +${recipe.missing_ingredients.length - 2}`}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Nutrition card component
function NutritionCard({ nutrition }: { nutrition: Nutrition }) {
  return (
    <Card className="border-0 shadow-md" style={{ backgroundColor: '#FFFEF9', borderRadius: '16px' }}>
      <CardHeader>
        <CardTitle style={{ color: '#5D4E37' }}>Nutrition Facts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
            <div className="text-2xl font-bold" style={{ color: '#CD8B62' }}>{nutrition.calories}</div>
            <div className="text-xs" style={{ color: '#808557' }}>Calories</div>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
            <div className="text-2xl font-bold" style={{ color: '#9CAF88' }}>{nutrition.protein_g}g</div>
            <div className="text-xs" style={{ color: '#808557' }}>Protein</div>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
            <div className="text-2xl font-bold" style={{ color: '#808557' }}>{nutrition.carbs_g}g</div>
            <div className="text-xs" style={{ color: '#808557' }}>Carbs</div>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
            <div className="text-2xl font-bold" style={{ color: '#CD8B62' }}>{nutrition.fats_g}g</div>
            <div className="text-xs" style={{ color: '#808557' }}>Fats</div>
          </div>
        </div>

        <div className="mb-2">
          <div className="text-sm font-medium mb-1" style={{ color: '#5D4E37' }}>Fiber</div>
          <div className="text-lg font-bold" style={{ color: '#9CAF88' }}>{nutrition.fiber_g}g</div>
        </div>

        {nutrition.vitamins && nutrition.vitamins.length > 0 && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: '#F5F1EB' }}>
            <div className="text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>Vitamins</div>
            <div className="flex flex-wrap gap-1.5">
              {nutrition.vitamins.map((vitamin) => (
                <span
                  key={vitamin}
                  className="px-2 py-1 rounded-full text-xs"
                  style={{ backgroundColor: '#9CAF88', color: 'white' }}
                >
                  {vitamin}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Bottom navigation component
function BottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: 'home', icon: FiHome, label: 'Home' },
    { id: 'mealplans', icon: FiCalendar, label: 'Meal Plans' },
    { id: 'progress', icon: FiTrendingUp, label: 'Progress' },
    { id: 'profile', icon: FiUser, label: 'Profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t shadow-lg" style={{ backgroundColor: '#FFFEF9', borderColor: '#F5F1EB' }}>
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
            >
              <Icon
                className="text-xl"
                style={{ color: isActive ? '#9CAF88' : '#808557' }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: isActive ? '#9CAF88' : '#808557' }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Home() {
  const AGENT_ID = '69859968e17e33c11eed1abc'

  // Screen navigation
  const [activeScreen, setActiveScreen] = useState<'home' | 'ingredients' | 'results' | 'detail'>('home')
  const [activeTab, setActiveTab] = useState('home')

  // Ingredient selection
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<keyof typeof ingredientCategories>('Vegetables')
  const [searchQuery, setSearchQuery] = useState('')

  // Recipe state
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [filters, setFilters] = useState({
    cuisine: 'All',
    time: 'All',
    difficulty: 'All',
    dietary: 'All',
  })

  // Recent searches (mock data)
  const [recentSearches] = useState([
    'Paneer recipes',
    'Quick lunch ideas',
    'High protein meals',
  ])

  // Nutrition tracking state
  const [nutritionGoals] = useState<NutritionGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65,
    fiber: 30,
  })

  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition[]>([
    { date: '2026-02-06', calories: 1850, protein: 140, carbs: 220, fats: 58, fiber: 28, meals: ['Tomato Rice', 'Paneer Curry'] },
    { date: '2026-02-05', calories: 1920, protein: 145, carbs: 230, fats: 60, fiber: 25, meals: ['Egg Bhurji', 'Dal Rice'] },
    { date: '2026-02-04', calories: 2100, protein: 155, carbs: 260, fats: 68, fiber: 32, meals: ['Chicken Curry', 'Roti'] },
    { date: '2026-02-03', calories: 1780, protein: 135, carbs: 210, fats: 55, fiber: 24, meals: ['Aloo Matar', 'Rice'] },
    { date: '2026-02-02', calories: 1950, protein: 148, carbs: 240, fats: 62, fiber: 29, meals: ['Fish Curry', 'Quinoa'] },
    { date: '2026-02-01', calories: 1890, protein: 142, carbs: 225, fats: 59, fiber: 27, meals: ['Tofu Stir-fry', 'Bread'] },
    { date: '2026-01-31', calories: 2020, protein: 152, carbs: 245, fats: 64, fiber: 30, meals: ['Paneer Tikka', 'Naan'] },
  ])

  // Meal plans state
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([
    {
      id: '1',
      day: 'Monday',
      breakfast: null,
      lunch: null,
      dinner: null,
      snacks: null,
    },
    {
      id: '2',
      day: 'Tuesday',
      breakfast: null,
      lunch: null,
      dinner: null,
      snacks: null,
    },
    {
      id: '3',
      day: 'Wednesday',
      breakfast: null,
      lunch: null,
      dinner: null,
      snacks: null,
    },
    {
      id: '4',
      day: 'Thursday',
      breakfast: null,
      lunch: null,
      dinner: null,
      snacks: null,
    },
    {
      id: '5',
      day: 'Friday',
      breakfast: null,
      lunch: null,
      dinner: null,
      snacks: null,
    },
    {
      id: '6',
      day: 'Saturday',
      breakfast: null,
      lunch: null,
      dinner: null,
      snacks: null,
    },
    {
      id: '7',
      day: 'Sunday',
      breakfast: null,
      lunch: null,
      dinner: null,
      snacks: null,
    },
  ])

  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks' | null>(null)

  const handleQuickAdd = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient])
    }
  }

  const handleIngredientToggle = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient))
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient])
    }
  }

  const handleFindRecipes = async () => {
    if (selectedIngredients.length === 0) {
      setError('Please select at least one ingredient')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const message = `Find recipes using these ingredients: ${selectedIngredients.join(', ')}. Please provide recipe suggestions with nutrition information, cooking time, and difficulty level.`

      const result = await callAIAgent(message, AGENT_ID)

      if (result.success && result.response.status === 'success') {
        const recipeData = result.response.result as RecipeResponse['result']
        if (recipeData.recipes && recipeData.recipes.length > 0) {
          setRecipes(recipeData.recipes)
          setActiveScreen('results')
        } else {
          setError('No recipes found. Try adding more ingredients!')
        }
      } else {
        setError(result.response.message || 'Failed to fetch recipes. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setActiveScreen('detail')
  }

  const handleToggleFavorite = (recipeName: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(recipeName)) {
        newFavorites.delete(recipeName)
      } else {
        newFavorites.add(recipeName)
      }
      return newFavorites
    })
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'home') {
      setActiveScreen('home')
    }
  }

  const handleAddToMealPlan = (recipe: Recipe, mealPlanId: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    setMealPlans(plans => plans.map(plan => {
      if (plan.id === mealPlanId) {
        return { ...plan, [mealType]: recipe }
      }
      return plan
    }))
  }

  const getTodayNutrition = () => {
    const today = new Date().toISOString().split('T')[0]
    return dailyNutrition.find(d => d.date === today) || {
      date: today,
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      meals: []
    }
  }

  // Home Screen
  const HomeScreen = () => (
    <div className="pb-20 px-4 pt-6" style={{ backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#5D4E37' }}>
            HomePlate
          </h1>
          <p className="text-sm" style={{ color: '#808557' }}>
            Discover delicious recipes with what you have
          </p>
        </div>

        <Card
          className="mb-6 cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-md"
          onClick={() => setActiveScreen('ingredients')}
          style={{ backgroundColor: '#FFFEF9', borderRadius: '16px' }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: '#9CAF88' }}>
                <FiSearch className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg" style={{ color: '#5D4E37' }}>
                  What's in your kitchen?
                </h3>
                <p className="text-sm" style={{ color: '#808557' }}>
                  Tap to add ingredients
                </p>
              </div>
            </div>

            {selectedIngredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedIngredients.slice(0, 5).map((ingredient) => (
                  <span
                    key={ingredient}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: '#9CAF88', color: 'white' }}
                  >
                    {ingredient}
                  </span>
                ))}
                {selectedIngredients.length > 5 && (
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: '#808557', color: 'white' }}
                  >
                    +{selectedIngredients.length - 5} more
                  </span>
                )}
              </div>
            )}

            <div className="text-sm font-medium mb-2" style={{ color: '#808557' }}>Quick add:</div>
            <div className="flex flex-wrap gap-2">
              {quickAddIngredients.map((ingredient) => (
                <button
                  key={ingredient}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleQuickAdd(ingredient)
                  }}
                  className="px-3 py-1 rounded-full text-sm font-medium border transition-colors"
                  style={{
                    borderColor: selectedIngredients.includes(ingredient) ? '#9CAF88' : '#E5E5E5',
                    backgroundColor: selectedIngredients.includes(ingredient) ? '#9CAF88' : 'white',
                    color: selectedIngredients.includes(ingredient) ? 'white' : '#808557'
                  }}
                >
                  {ingredient}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedIngredients.length > 0 && (
          <Button
            onClick={handleFindRecipes}
            disabled={loading}
            className="w-full mb-6 h-12 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow"
            style={{ backgroundColor: '#CD8B62', color: 'white' }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finding Recipes...
              </>
            ) : (
              'Find Recipes'
            )}
          </Button>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#CD8B62', color: 'white' }}>
            {error}
          </div>
        )}

        <div className="mb-4">
          <h3 className="font-semibold mb-3" style={{ color: '#5D4E37' }}>Recent Searches</h3>
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <div
                key={index}
                className="p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                style={{ backgroundColor: '#FFFEF9' }}
              >
                <FiSearch style={{ color: '#808557' }} />
                <span style={{ color: '#5D4E37' }}>{search}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Ingredient Selection Screen
  const IngredientsScreen = () => (
    <div className="pb-20" style={{ backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <div className="sticky top-0 z-10 p-4 border-b" style={{ backgroundColor: '#FFFEF9', borderColor: '#E5E5E5' }}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setActiveScreen('home')} className="p-2">
              <FiChevronLeft className="text-xl" style={{ color: '#5D4E37' }} />
            </button>
            <h2 className="text-xl font-bold flex-1" style={{ color: '#5D4E37' }}>
              Select Ingredients
            </h2>
          </div>

          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#808557' }} />
            <Input
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-0 shadow-sm"
              style={{ backgroundColor: '#F5F1EB', borderRadius: '12px' }}
            />
          </div>

          {selectedIngredients.length > 0 && (
            <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: '#5D4E37' }}>
                  Selected ({selectedIngredients.length})
                </span>
                <button
                  onClick={() => setSelectedIngredients([])}
                  className="text-xs"
                  style={{ color: '#CD8B62' }}
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedIngredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                    style={{ backgroundColor: '#9CAF88', color: 'white' }}
                  >
                    {ingredient}
                    <button onClick={() => handleIngredientToggle(ingredient)}>
                      <FiX className="text-sm" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(Object.keys(ingredientCategories) as Array<keyof typeof ingredientCategories>).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                backgroundColor: activeCategory === category ? '#9CAF88' : '#FFFEF9',
                color: activeCategory === category ? 'white' : '#808557',
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-20">
          {ingredientCategories[activeCategory]
            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item) => {
              const Icon = item.icon
              const isSelected = selectedIngredients.includes(item.name)
              return (
                <button
                  key={item.name}
                  onClick={() => handleIngredientToggle(item.name)}
                  className="p-4 rounded-lg flex flex-col items-center gap-2 transition-all"
                  style={{
                    backgroundColor: isSelected ? '#9CAF88' : '#FFFEF9',
                    border: `2px solid ${isSelected ? '#9CAF88' : '#E5E5E5'}`,
                    borderRadius: '16px',
                  }}
                >
                  <Icon
                    className="text-3xl"
                    style={{ color: isSelected ? 'white' : '#808557' }}
                  />
                  <span
                    className="text-sm font-medium text-center"
                    style={{ color: isSelected ? 'white' : '#5D4E37' }}
                  >
                    {item.name}
                  </span>
                </button>
              )
            })}
        </div>
      </div>

      {selectedIngredients.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 p-4" style={{ backgroundColor: '#F5F1EB' }}>
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleFindRecipes}
              disabled={loading}
              className="w-full h-12 text-base font-semibold rounded-full shadow-lg"
              style={{ backgroundColor: '#CD8B62', color: 'white' }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Finding Recipes...
                </>
              ) : (
                `Show Recipes (${selectedIngredients.length} ingredients)`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  // Recipe Results Screen
  const ResultsScreen = () => {
    const filteredRecipes = recipes.filter(recipe => {
      if (filters.cuisine !== 'All' && recipe.cuisine_type !== filters.cuisine) return false
      if (filters.difficulty !== 'All' && recipe.difficulty !== filters.difficulty) return false
      return true
    })

    return (
      <div className="pb-20" style={{ backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
        <div className="sticky top-0 z-10 p-4 border-b" style={{ backgroundColor: '#FFFEF9', borderColor: '#E5E5E5' }}>
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setActiveScreen('home')} className="p-2">
                <FiChevronLeft className="text-xl" style={{ color: '#5D4E37' }} />
              </button>
              <h2 className="text-xl font-bold flex-1" style={{ color: '#5D4E37' }}>
                {filteredRecipes.length} Recipes Found
              </h2>
              <button className="p-2">
                <FiFilter className="text-xl" style={{ color: '#808557' }} />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <button className="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap" style={{ backgroundColor: '#9CAF88', color: 'white' }}>
                All
              </button>
              <button className="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap" style={{ backgroundColor: '#FFFEF9', color: '#808557' }}>
                Quick (&lt;30 min)
              </button>
              <button className="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap" style={{ backgroundColor: '#FFFEF9', color: '#808557' }}>
                Easy
              </button>
              <button className="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap" style={{ backgroundColor: '#FFFEF9', color: '#808557' }}>
                Vegetarian
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 pt-4">
          <div className="grid grid-cols-1 gap-4 mb-4">
            {filteredRecipes.map((recipe, index) => (
              <RecipeCard
                key={index}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe)}
                isFavorite={favorites.has(recipe.recipe_name)}
                onToggleFavorite={() => handleToggleFavorite(recipe.recipe_name)}
              />
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <GiCookingPot className="text-6xl mx-auto mb-4" style={{ color: '#808557', opacity: 0.3 }} />
              <p className="text-lg font-medium mb-2" style={{ color: '#5D4E37' }}>No recipes found</p>
              <p className="text-sm" style={{ color: '#808557' }}>Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Recipe Detail Screen
  const DetailScreen = () => {
    if (!selectedRecipe) return null

    const spiceDots = {
      'mild': 1,
      'medium': 2,
      'hot': 3,
      'very hot': 4,
    }[selectedRecipe.spice_level.toLowerCase()] || 1

    return (
      <div className="pb-20" style={{ backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
        <div className="sticky top-0 z-10 p-4 border-b flex items-center gap-3" style={{ backgroundColor: '#FFFEF9', borderColor: '#E5E5E5' }}>
          <button onClick={() => setActiveScreen('results')} className="p-2">
            <FiChevronLeft className="text-xl" style={{ color: '#5D4E37' }} />
          </button>
          <h2 className="text-xl font-bold flex-1" style={{ color: '#5D4E37' }}>
            Recipe Details
          </h2>
          <button onClick={() => handleToggleFavorite(selectedRecipe.recipe_name)} className="p-2">
            <FiHeart
              className={`text-xl ${favorites.has(selectedRecipe.recipe_name) ? 'fill-current text-red-500' : ''}`}
              style={{ color: favorites.has(selectedRecipe.recipe_name) ? '#EF4444' : '#808557' }}
            />
          </button>
        </div>

        <div className="max-w-md mx-auto px-4 pt-4">
          <div className="h-48 mb-4 rounded-2xl relative overflow-hidden" style={{ backgroundColor: '#CD8B62' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <GiCookingPot className="text-white text-8xl opacity-30" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: '#5D4E37' }}>
            {selectedRecipe.recipe_name}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {selectedRecipe.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: '#9CAF88', color: 'white' }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#FFFEF9' }}>
              <FiClock className="mx-auto mb-1" style={{ color: '#808557' }} />
              <div className="text-xs font-medium" style={{ color: '#5D4E37' }}>{selectedRecipe.cooking_time}</div>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#FFFEF9' }}>
              <div className="text-sm font-medium mb-1" style={{ color: '#5D4E37' }}>Difficulty</div>
              <div className="text-xs capitalize" style={{ color: '#808557' }}>{selectedRecipe.difficulty}</div>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#FFFEF9' }}>
              <div className="text-sm font-medium mb-1" style={{ color: '#5D4E37' }}>Spice</div>
              <div className="flex justify-center gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: i < spiceDots ? '#CD8B62' : '#E5E5E5' }}
                  />
                ))}
              </div>
            </div>
          </div>

          <Card className="mb-4 border-0 shadow-md" style={{ backgroundColor: '#FFFEF9', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle style={{ color: '#5D4E37' }}>Ingredients Matched</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedRecipe.ingredients_matched.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: '#9CAF88', color: 'white' }}
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <NutritionCard nutrition={selectedRecipe.nutrition} />

          <Card className="mt-4 mb-4 border-0 shadow-md" style={{ backgroundColor: '#FFFEF9', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle style={{ color: '#5D4E37' }}>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed" style={{ color: '#5D4E37' }}>
                {selectedRecipe.instructions_summary}
              </p>
            </CardContent>
          </Card>

          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#FFFEF9' }}>
            <div className="text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
              Cuisine Type
            </div>
            <div className="text-base" style={{ color: '#808557' }}>
              {selectedRecipe.cuisine_type}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Collections Screen (Favorites)
  const CollectionsScreen = () => {
    const favoriteRecipes = recipes.filter(r => favorites.has(r.recipe_name))

    return (
      <div className="pb-20 px-4 pt-6" style={{ backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#5D4E37' }}>
            Saved Recipes
          </h2>

          {favoriteRecipes.length === 0 ? (
            <div className="text-center py-12">
              <FiHeart className="text-6xl mx-auto mb-4" style={{ color: '#808557', opacity: 0.3 }} />
              <p className="text-lg font-medium mb-2" style={{ color: '#5D4E37' }}>No saved recipes yet</p>
              <p className="text-sm" style={{ color: '#808557' }}>Start saving recipes you love!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {favoriteRecipes.map((recipe, index) => (
                <RecipeCard
                  key={index}
                  recipe={recipe}
                  onClick={() => {
                    setSelectedRecipe(recipe)
                    setActiveScreen('detail')
                  }}
                  isFavorite={true}
                  onToggleFavorite={() => handleToggleFavorite(recipe.recipe_name)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Profile Screen
  const ProfileScreen = () => (
    <div className="pb-20 px-4 pt-6" style={{ backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#5D4E37' }}>
          Profile
        </h2>

        <Card className="mb-4 border-0 shadow-md" style={{ backgroundColor: '#FFFEF9', borderRadius: '16px' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9CAF88' }}>
                <FiUser className="text-white text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: '#5D4E37' }}>Home Chef</h3>
                <p className="text-sm" style={{ color: '#808557' }}>Recipe Explorer</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: '#F5F1EB' }}>
              <div className="text-center">
                <div className="font-bold text-xl" style={{ color: '#CD8B62' }}>{favorites.size}</div>
                <div className="text-xs" style={{ color: '#808557' }}>Saved</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl" style={{ color: '#9CAF88' }}>{recipes.length}</div>
                <div className="text-xs" style={{ color: '#808557' }}>Explored</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl" style={{ color: '#808557' }}>{selectedIngredients.length}</div>
                <div className="text-xs" style={{ color: '#808557' }}>Ingredients</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <button className="w-full p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#FFFEF9' }}>
            <span style={{ color: '#5D4E37' }}>Language Preference</span>
            <span className="text-sm" style={{ color: '#808557' }}>English</span>
          </button>
          <button className="w-full p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#FFFEF9' }}>
            <span style={{ color: '#5D4E37' }}>Dietary Restrictions</span>
            <span className="text-sm" style={{ color: '#808557' }}>None</span>
          </button>
          <button className="w-full p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#FFFEF9' }}>
            <span style={{ color: '#5D4E37' }}>Spice Preference</span>
            <span className="text-sm" style={{ color: '#808557' }}>Medium</span>
          </button>
        </div>
      </div>
    </div>
  )

  // Progress Screen
  const ProgressScreen = () => {
    const todayNutrition = getTodayNutrition()
    const weeklyData = dailyNutrition.slice(0, 7).reverse()

    return (
      <div className="pb-20 px-4 pt-6" style={{ backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#5D4E37' }}>
            Progress Tracking
          </h2>

          {/* Today's Progress */}
          <Card className="mb-6 border-0 shadow-md" style={{ backgroundColor: '#FFFEF9', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#5D4E37' }}>
                <FiTarget className="text-xl" />
                Today's Nutrition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* Calories */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#808557' }}>Calories</span>
                    <span className="text-xs" style={{ color: '#808557' }}>
                      {todayNutrition.calories}/{nutritionGoals.calories}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#F5F1EB' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: '#CD8B62',
                        width: `${Math.min((todayNutrition.calories / nutritionGoals.calories) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="text-2xl font-bold mt-2" style={{ color: '#CD8B62' }}>
                    {Math.round((todayNutrition.calories / nutritionGoals.calories) * 100)}%
                  </div>
                </div>

                {/* Protein */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#808557' }}>Protein</span>
                    <span className="text-xs" style={{ color: '#808557' }}>
                      {todayNutrition.protein}g/{nutritionGoals.protein}g
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#F5F1EB' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: '#9CAF88',
                        width: `${Math.min((todayNutrition.protein / nutritionGoals.protein) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="text-2xl font-bold mt-2" style={{ color: '#9CAF88' }}>
                    {Math.round((todayNutrition.protein / nutritionGoals.protein) * 100)}%
                  </div>
                </div>

                {/* Carbs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#808557' }}>Carbs</span>
                    <span className="text-xs" style={{ color: '#808557' }}>
                      {todayNutrition.carbs}g/{nutritionGoals.carbs}g
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#F5F1EB' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: '#808557',
                        width: `${Math.min((todayNutrition.carbs / nutritionGoals.carbs) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="text-2xl font-bold mt-2" style={{ color: '#808557' }}>
                    {Math.round((todayNutrition.carbs / nutritionGoals.carbs) * 100)}%
                  </div>
                </div>

                {/* Fats */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#808557' }}>Fats</span>
                    <span className="text-xs" style={{ color: '#808557' }}>
                      {todayNutrition.fats}g/{nutritionGoals.fats}g
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#F5F1EB' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: '#CD8B62',
                        width: `${Math.min((todayNutrition.fats / nutritionGoals.fats) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="text-2xl font-bold mt-2" style={{ color: '#CD8B62' }}>
                    {Math.round((todayNutrition.fats / nutritionGoals.fats) * 100)}%
                  </div>
                </div>
              </div>

              {todayNutrition.meals.length > 0 && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F5F1EB' }}>
                  <div className="text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>Today's Meals</div>
                  <div className="flex flex-wrap gap-2">
                    {todayNutrition.meals.map((meal, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: '#9CAF88', color: 'white' }}
                      >
                        {meal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Overview */}
          <Card className="mb-6 border-0 shadow-md" style={{ backgroundColor: '#FFFEF9', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#5D4E37' }}>
                <AiOutlineLineChart className="text-xl" />
                7-Day Nutrition Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simple bar chart visualization */}
              <div className="space-y-3">
                {weeklyData.map((day) => {
                  const date = new Date(day.date)
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                  const caloriePercent = Math.round((day.calories / nutritionGoals.calories) * 100)

                  return (
                    <div key={day.date}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: '#5D4E37' }}>{dayName}</span>
                        <span className="text-xs" style={{ color: '#808557' }}>{day.calories} cal</span>
                      </div>
                      <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#F5F1EB' }}>
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{
                            backgroundColor: caloriePercent >= 90 && caloriePercent <= 110 ? '#9CAF88' : '#CD8B62',
                            width: `${Math.min(caloriePercent, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Stats */}
          <Card className="mb-6 border-0 shadow-md" style={{ backgroundColor: '#FFFEF9', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#5D4E37' }}>
                <BiDumbbell className="text-xl" />
                Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#F5F1EB' }}>
                  <div className="text-2xl font-bold" style={{ color: '#9CAF88' }}>
                    {Math.round(weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.length)}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#808557' }}>Avg Calories/Day</div>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#F5F1EB' }}>
                  <div className="text-2xl font-bold" style={{ color: '#CD8B62' }}>
                    {Math.round(weeklyData.reduce((sum, d) => sum + d.protein, 0) / weeklyData.length)}g
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#808557' }}>Avg Protein/Day</div>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#F5F1EB' }}>
                  <div className="text-2xl font-bold" style={{ color: '#808557' }}>
                    {weeklyData.reduce((sum, d) => sum + d.meals.length, 0)}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#808557' }}>Total Meals</div>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#F5F1EB' }}>
                  <div className="text-2xl font-bold" style={{ color: '#9CAF88' }}>
                    {weeklyData.filter(d => d.calories >= nutritionGoals.calories * 0.9 && d.calories <= nutritionGoals.calories * 1.1).length}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#808557' }}>Days on Target</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Meal Plans Screen
  const MealPlansScreen = () => {
    return (
      <div className="pb-20 px-4 pt-6" style={{ backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#5D4E37' }}>
            Weekly Meal Plans
          </h2>

          {/* Meal Plans */}
          <div className="space-y-4">
            {mealPlans.map((plan) => (
              <Card key={plan.id} className="border-0 shadow-md" style={{ backgroundColor: '#FFFEF9', borderRadius: '16px' }}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between" style={{ color: '#5D4E37' }}>
                    <span className="flex items-center gap-2">
                      <FiCalendar className="text-lg" />
                      {plan.day}
                    </span>
                    <Button
                      onClick={() => {
                        setSelectedMealPlan(plan)
                        setActiveScreen('ingredients')
                      }}
                      size="sm"
                      className="h-8 text-xs rounded-full"
                      style={{ backgroundColor: '#9CAF88', color: 'white' }}
                    >
                      <FiPlus className="mr-1" /> Add Meal
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Breakfast */}
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
                      <div className="flex-1">
                        <div className="text-xs font-medium mb-1" style={{ color: '#808557' }}>Breakfast</div>
                        {plan.breakfast ? (
                          <div className="text-sm font-medium" style={{ color: '#5D4E37' }}>
                            {plan.breakfast.recipe_name}
                          </div>
                        ) : (
                          <div className="text-sm" style={{ color: '#808557' }}>Not planned</div>
                        )}
                      </div>
                      {plan.breakfast && (
                        <div className="text-xs" style={{ color: '#CD8B62' }}>
                          {plan.breakfast.nutrition.calories} cal
                        </div>
                      )}
                    </div>

                    {/* Lunch */}
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
                      <div className="flex-1">
                        <div className="text-xs font-medium mb-1" style={{ color: '#808557' }}>Lunch</div>
                        {plan.lunch ? (
                          <div className="text-sm font-medium" style={{ color: '#5D4E37' }}>
                            {plan.lunch.recipe_name}
                          </div>
                        ) : (
                          <div className="text-sm" style={{ color: '#808557' }}>Not planned</div>
                        )}
                      </div>
                      {plan.lunch && (
                        <div className="text-xs" style={{ color: '#CD8B62' }}>
                          {plan.lunch.nutrition.calories} cal
                        </div>
                      )}
                    </div>

                    {/* Dinner */}
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
                      <div className="flex-1">
                        <div className="text-xs font-medium mb-1" style={{ color: '#808557' }}>Dinner</div>
                        {plan.dinner ? (
                          <div className="text-sm font-medium" style={{ color: '#5D4E37' }}>
                            {plan.dinner.recipe_name}
                          </div>
                        ) : (
                          <div className="text-sm" style={{ color: '#808557' }}>Not planned</div>
                        )}
                      </div>
                      {plan.dinner && (
                        <div className="text-xs" style={{ color: '#CD8B62' }}>
                          {plan.dinner.nutrition.calories} cal
                        </div>
                      )}
                    </div>

                    {/* Snacks */}
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
                      <div className="flex-1">
                        <div className="text-xs font-medium mb-1" style={{ color: '#808557' }}>Snacks</div>
                        {plan.snacks ? (
                          <div className="text-sm font-medium" style={{ color: '#5D4E37' }}>
                            {plan.snacks.recipe_name}
                          </div>
                        ) : (
                          <div className="text-sm" style={{ color: '#808557' }}>Not planned</div>
                        )}
                      </div>
                      {plan.snacks && (
                        <div className="text-xs" style={{ color: '#CD8B62' }}>
                          {plan.snacks.nutrition.calories} cal
                        </div>
                      )}
                    </div>

                    {/* Daily Total */}
                    {(plan.breakfast || plan.lunch || plan.dinner || plan.snacks) && (
                      <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: '#E5E5E5' }}>
                        <span className="text-sm font-medium" style={{ color: '#5D4E37' }}>Daily Total</span>
                        <div className="text-right">
                          <div className="text-lg font-bold" style={{ color: '#CD8B62' }}>
                            {(plan.breakfast?.nutrition.calories || 0) +
                             (plan.lunch?.nutrition.calories || 0) +
                             (plan.dinner?.nutrition.calories || 0) +
                             (plan.snacks?.nutrition.calories || 0)} cal
                          </div>
                          <div className="text-xs" style={{ color: '#808557' }}>
                            Protein: {(plan.breakfast?.nutrition.protein_g || 0) +
                             (plan.lunch?.nutrition.protein_g || 0) +
                             (plan.dinner?.nutrition.protein_g || 0) +
                             (plan.snacks?.nutrition.protein_g || 0)}g
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Generate Meal Plan with AI */}
          <Card className="mt-6 border-0 shadow-md" style={{ backgroundColor: '#FFFEF9', borderRadius: '16px' }}>
            <CardContent className="p-6">
              <div className="text-center">
                <GiCookingPot className="text-5xl mx-auto mb-3" style={{ color: '#9CAF88' }} />
                <h3 className="font-bold text-lg mb-2" style={{ color: '#5D4E37' }}>
                  Need Help Planning?
                </h3>
                <p className="text-sm mb-4" style={{ color: '#808557' }}>
                  Let our AI suggest a complete week of meals based on your preferences
                </p>
                <Button
                  className="w-full rounded-full"
                  style={{ backgroundColor: '#CD8B62', color: 'white' }}
                >
                  Generate AI Meal Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Explore Screen
  const ExploreScreen = () => {
    const cuisines = [
      'North Indian',
      'South Indian',
      'Chinese',
      'Italian',
      'Mexican',
      'Thai',
      'Mediterranean',
      'American',
    ]

    return (
      <div className="pb-20 px-4 pt-6" style={{ backgroundColor: '#F5F1EB', minHeight: '100vh' }}>
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#5D4E37' }}>
            Explore Cuisines
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {cuisines.map((cuisine) => (
              <div
                key={cuisine}
                className="p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:shadow-lg transition-shadow"
                style={{ backgroundColor: '#FFFEF9', minHeight: '120px' }}
              >
                <MdRestaurantMenu className="text-4xl" style={{ color: '#9CAF88' }} />
                <span className="font-semibold text-center" style={{ color: '#5D4E37' }}>
                  {cuisine}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#F5F1EB' }}>
      {activeScreen === 'home' && activeTab === 'home' && <HomeScreen />}
      {activeScreen === 'ingredients' && <IngredientsScreen />}
      {activeScreen === 'results' && <ResultsScreen />}
      {activeScreen === 'detail' && <DetailScreen />}
      {activeTab === 'mealplans' && activeScreen === 'home' && <MealPlansScreen />}
      {activeTab === 'progress' && activeScreen === 'home' && <ProgressScreen />}
      {activeTab === 'profile' && activeScreen === 'home' && <ProfileScreen />}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}
