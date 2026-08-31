import { X, Clock, Leaf, Trash2, Copy, Check, Edit2, Flame } from 'lucide-react';
import { type Recipe, COOKING_METHOD_COLORS, INGREDIENT_CATEGORY_COLORS } from '@/store/recipeStore';
import { useState } from 'react';

interface RecipeDetailModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit?: () => void;
}

export default function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
  onDelete,
  onEdit,
}: RecipeDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(recipe.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    onDelete(recipe.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div
          className={`h-2 ${
            COOKING_METHOD_COLORS[recipe.cookingMethod].split(' ')[0]
          }`}
        />
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{recipe.title}</h2>
            <p className="text-sm text-gray-400 mt-1">{formatDate(recipe.createdAt)}</p>
          </div>
          {recipe.totalCalories > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <span className="text-lg font-bold text-orange-500">{recipe.totalCalories}</span>
                <span className="text-sm text-gray-500 ml-1">大卡</span>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                COOKING_METHOD_COLORS[recipe.cookingMethod]
              }`}
            >
              {recipe.cookingMethod}
            </span>
            {recipe.ingredientCategory && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  INGREDIENT_CATEGORY_COLORS[recipe.ingredientCategory]
                }`}
              >
                <Leaf className="w-4 h-4" />
                {recipe.ingredientCategory}
              </span>
            )}
          </div>

          {/* Ingredients & Sauces */}
          {(recipe.ingredients?.length > 0 || recipe.sauces?.length > 0) && (
            <div className="mb-5">
              {/* Ingredients */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">食材</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg text-sm">
                        <span className="text-gray-700">{ing.name}</span>
                        <span className="text-gray-400">×{ing.amount}{ing.unit}</span>
                        <span className="text-orange-500 font-medium">{Math.round(ing.calories * ing.amount)}卡</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sauces */}
              {recipe.sauces && recipe.sauces.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">酱料</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.sauces.map((sauce, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg text-sm">
                        <span className="text-gray-700">{sauce.name}</span>
                        <span className="text-gray-400">×{sauce.amount}{sauce.unit}</span>
                        <span className="text-orange-500 font-medium">{Math.round(sauce.calories * sauce.amount)}卡</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recipe Content */}
          <div className="bg-gray-50 rounded-xl p-5">
            <pre
              className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed"
              style={{ fontFamily: '"Noto Sans SC", system-ui, sans-serif' }}
            >
              {recipe.content}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                         bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <Edit2 className="w-4 h-4" />
                编辑菜谱
              </button>
            )}
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制内容
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}