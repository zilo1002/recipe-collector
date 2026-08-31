import { useRef } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { useRecipeStore, COOKING_METHOD_ICONS, getAllCookingMethods, type CookingMethod } from '@/store/recipeStore';

export default function CategoryTabs() {
  const { selectedCategory, setSelectedCategory, recipes, customCookingMethods } = useRecipeStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get all available cooking methods
  const allMethods = getAllCookingMethods(customCookingMethods);

  // Count recipes per category
  const categoryCounts = allMethods.reduce((acc, method) => {
    acc[method] = recipes.filter((r) => r.cookingMethod === method).length;
    return acc;
  }, {} as Record<CookingMethod, number>);

  const totalCount = recipes.length;

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 py-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* All Category */}
          <button
            onClick={() => setSelectedCategory('全部')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200
              ${
                selectedCategory === '全部'
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span className="font-medium">全部</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedCategory === '全部' ? 'bg-white/20' : 'bg-gray-200'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* Category Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1 flex-shrink-0" />

          {/* Cooking Methods */}
          {allMethods.map((method) => (
            <button
              key={method}
              onClick={() => setSelectedCategory(method)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200
                ${
                  selectedCategory === method
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <span className="text-lg">{COOKING_METHOD_ICONS[method] || '📋'}</span>
              <span className="font-medium">{method}</span>
              {categoryCounts[method] > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCategory === method ? 'bg-white/20' : 'bg-gray-200'
                  }`}
                >
                  {categoryCounts[method]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
