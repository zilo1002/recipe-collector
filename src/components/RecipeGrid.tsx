import { useRecipeStore, COOKING_METHODS, COOKING_METHOD_ICONS } from '@/store/recipeStore';
import RecipeCard from './RecipeCard';
import { UtensilsCrossed } from 'lucide-react';

export default function RecipeGrid() {
  const { recipes, selectedCategory } = useRecipeStore();

  // 获取过滤后的菜谱
  const getFilteredRecipes = useRecipeStore(state => state.getFilteredRecipes);
  const filteredRecipes = getFilteredRecipes();

  // 如果选择了特定分类，显示普通网格布局
  if (selectedCategory !== '全部') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-2xl">{COOKING_METHOD_ICONS[selectedCategory]}</span>
          <h2 className="text-xl font-semibold text-gray-800">{selectedCategory}</h2>
          <span className="text-sm text-gray-500">({filteredRecipes.length} 道菜谱)</span>
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <UtensilsCrossed className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">该分类下暂无菜谱</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onDelete={useRecipeStore.getState().deleteRecipe} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 按制作方式分组
  const groupedRecipes = COOKING_METHODS.reduce((acc, method) => {
    const methodRecipes = recipes.filter(r => r.cookingMethod === method);
    if (methodRecipes.length > 0) {
      acc.push({ method, recipes: methodRecipes });
    }
    return acc;
  }, [] as { method: typeof COOKING_METHODS[number]; recipes: typeof recipes }[]);

  if (groupedRecipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
          <UtensilsCrossed className="w-12 h-12 text-gray-300" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无菜谱</h3>
        <p className="text-gray-400 text-center max-w-sm">
          开始添加你的第一道菜谱吧！点击上方「上传菜谱」按钮，即可开始收藏。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-500">
        共找到 <span className="font-semibold text-gray-700">{recipes.length}</span> 道菜谱
      </div>

      {/* Grouped by Cooking Method */}
      <div className="space-y-10">
        {groupedRecipes.map(({ method, recipes: methodRecipes }) => (
          <div key={method} className="recipe-group">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-200">
              <span className="text-2xl">{COOKING_METHOD_ICONS[method]}</span>
              <h2 className="text-lg font-semibold text-gray-800">{method}</h2>
              <span className="text-sm text-gray-400">({methodRecipes.length})</span>
            </div>

            {/* Recipe Grid for this Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {methodRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onDelete={useRecipeStore.getState().deleteRecipe} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}