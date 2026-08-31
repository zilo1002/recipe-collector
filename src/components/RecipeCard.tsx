import { useState } from 'react';
import { Clock, Leaf, Trash2, Eye, Edit2, Flame } from 'lucide-react';
import {
  type Recipe,
  COOKING_METHOD_COLORS,
  INGREDIENT_CATEGORY_COLORS,
  COOKING_METHOD_ICONS,
  useRecipeStore,
} from '@/store/recipeStore';
import RecipeDetailModal from './RecipeDetailModal';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

export default function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { openModal } = useRecipeStore();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getPreviewContent = (content: string) => {
    const lines = content.split('\n').filter((line) => line.trim());
    return lines.slice(0, 3).join('\n');
  };

  const handleEdit = () => {
    // 通过 store 设置正在编辑的菜谱ID，然后打开模态框
    useRecipeStore.setState({ editingRecipeId: recipe.id, isModalOpen: true });
    setIsDetailOpen(false);
  };

  return (
    <>
      <article
        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Card Header - Color Banner */}
        <div
          className={`h-3 ${
            COOKING_METHOD_COLORS[recipe.cookingMethod].split(' ')[0]
          }`}
        />

        {/* Card Body */}
        <div className="p-5">
          {/* Title Row with Calories */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3
                className="text-lg font-semibold text-gray-800 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsDetailOpen(true)}
              >
                {recipe.title}
              </h3>
              {recipe.totalCalories > 0 && (
                <div className="flex items-center gap-1 mt-1 text-sm text-orange-500 font-medium">
                  <Flame className="w-4 h-4" />
                  <span>{recipe.totalCalories} 大卡</span>
                </div>
              )}
            </div>
            <span className="text-2xl flex-shrink-0">{COOKING_METHOD_ICONS[recipe.cookingMethod]}</span>
          </div>

          {/* Content Preview */}
          <div
            className={`text-sm text-gray-500 mb-4 line-clamp-3 whitespace-pre-wrap ${
              isHovered ? 'text-gray-600' : ''
            }`}
            style={{ lineHeight: '1.6' }}
          >
            {getPreviewContent(recipe.content)}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                COOKING_METHOD_COLORS[recipe.cookingMethod]
              }`}
            >
              {recipe.cookingMethod}
            </span>
            {recipe.ingredientCategory && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  INGREDIENT_CATEGORY_COLORS[recipe.ingredientCategory]
                }`}
              >
                <Leaf className="w-3 h-3" />
                {recipe.ingredientCategory}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(recipe.createdAt)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsDetailOpen(true)}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary transition-colors"
                title="查看详情"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={handleEdit}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                title="编辑"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(recipe.id)}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Detail Modal */}
      <RecipeDetailModal
        recipe={recipe}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDelete={onDelete}
        onEdit={handleEdit}
      />
    </>
  );
}