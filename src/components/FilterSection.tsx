import { useState } from 'react';
import { Filter, ChevronDown, X, ChevronRight, Check } from 'lucide-react';
import {
  useRecipeStore,
  COOKING_METHODS,
  INGREDIENT_CATEGORIES,
  DEFAULT_INGREDIENT_SUB_CATEGORIES,
  type CookingMethod,
  type IngredientCategory,
} from '@/store/recipeStore';

export default function FilterSection() {
  const { sortOptions, setSortOptions, customIngredientSubCategories } = useRecipeStore();
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<IngredientCategory | null>(null);
  // 临时选择状态，用于确认前预览
  const [tempIngredientCategory, setTempIngredientCategory] = useState<IngredientCategory | null>(sortOptions.ingredientCategory);
  const [tempIngredientSubCategory, setTempIngredientSubCategory] = useState<string | null>(sortOptions.ingredientSubCategory);

  // 确认食材分类选择
  const handleConfirmIngredientFilter = () => {
    setSortOptions({
      ingredientCategory: tempIngredientCategory,
      ingredientSubCategory: tempIngredientSubCategory
    });
    setExpandedDropdown(null);
  };

  // 取消选择，恢复原状态
  const handleCancelIngredientFilter = () => {
    setTempIngredientCategory(sortOptions.ingredientCategory);
    setTempIngredientSubCategory(sortOptions.ingredientSubCategory);
    setExpandedDropdown(null);
  };

  // 打开下拉框时，初始化临时状态
  const handleOpenIngredientDropdown = () => {
    setTempIngredientCategory(sortOptions.ingredientCategory);
    setTempIngredientSubCategory(sortOptions.ingredientSubCategory);
    setExpandedDropdown('ingredient');
  };

  const handleAlphabetChange = (direction: 'asc' | 'desc' | null) => {
    setSortOptions({ alphabet: direction });
  };

  const handleUploadTimeChange = (direction: 'asc' | 'desc' | null) => {
    setSortOptions({ uploadTime: direction });
  };

  const handleCookingMethodFilterChange = (method: CookingMethod | null) => {
    setSortOptions({ cookingMethod: method });
    setExpandedDropdown(null);
  };

  const clearAllFilters = () => {
    setSortOptions({
      ingredientCategory: null,
      ingredientSubCategory: null,
      alphabet: null,
      uploadTime: null,
      cookingMethod: null,
    });
  };

  const hasActiveFilters =
    sortOptions.ingredientCategory ||
    sortOptions.ingredientSubCategory ||
    sortOptions.alphabet ||
    sortOptions.uploadTime ||
    sortOptions.cookingMethod;

  const activeFiltersCount = [
    sortOptions.ingredientCategory,
    sortOptions.ingredientSubCategory,
    sortOptions.alphabet,
    sortOptions.uploadTime,
    sortOptions.cookingMethod,
  ].filter(Boolean).length;

  // 获取某一级分类下的所有二级分类
  const getSubCategories = (parentCategory: IngredientCategory): string[] => {
    const defaults = DEFAULT_INGREDIENT_SUB_CATEGORIES[parentCategory] || [];
    return [...new Set([...defaults, ...customIngredientSubCategories])];
  };

  return (
    <div className="bg-white border-b border-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Filter Icon */}
          <div className="flex items-center gap-2 text-gray-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">筛选排序</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Sort Options */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Ingredient Category with Sub-categories */}
            <div className="relative">
              <button
                onClick={handleOpenIngredientDropdown}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                  ${
                    sortOptions.ingredientCategory
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                  }`}
              >
                <span>
                  {sortOptions.ingredientSubCategory
                    ? `食材: ${sortOptions.ingredientSubCategory}`
                    : sortOptions.ingredientCategory
                    ? `${sortOptions.ingredientCategory}`
                    : '食材分类'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {expandedDropdown === 'ingredient' && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 min-w-60">
                  {/* 不限选项 */}
                  <button
                    onClick={() => {
                      setTempIngredientCategory(null);
                      setTempIngredientSubCategory(null);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      !tempIngredientCategory ? 'text-primary font-medium' : 'text-gray-600'
                    }`}
                  >
                    不限
                  </button>
                  <div className="border-t border-gray-100 my-1" />

                  {/* 一级分类列表 */}
                  {INGREDIENT_CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      className="relative"
                      onMouseEnter={() => setHoveredCategory(cat)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <button
                        onClick={() => {
                          setTempIngredientCategory(cat);
                          setTempIngredientSubCategory(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                          tempIngredientCategory === cat ? 'text-primary font-medium' : 'text-gray-600'
                        }`}
                      >
                        <span>{cat}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      {/* 二级分类弹出层 */}
                      {hoveredCategory === cat && (
                        <div className="absolute left-full top-0 ml-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 min-w-48 max-h-80 overflow-y-auto">
                          <div className="px-3 py-1 text-xs text-gray-400 border-b border-gray-100">
                            {cat}
                          </div>
                          {getSubCategories(cat).map((subCat) => (
                            <button
                              key={subCat}
                              onClick={() => {
                                setTempIngredientCategory(cat);
                                setTempIngredientSubCategory(subCat);
                              }}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                                tempIngredientSubCategory === subCat && tempIngredientCategory === cat
                                  ? 'text-primary font-medium bg-primary/5'
                                  : 'text-gray-600'
                              }`}
                            >
                              <span>{subCat}</span>
                              {tempIngredientSubCategory === subCat && tempIngredientCategory === cat && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* 确认/取消按钮 */}
                  <div className="border-t border-gray-100 mt-2 pt-2 px-2 flex gap-2">
                    <button
                      onClick={handleCancelIngredientFilter}
                      className="flex-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleConfirmIngredientFilter}
                      className="flex-1 px-3 py-2 text-sm text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      确定
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Alphabet Sort */}
            <div className="relative">
              <button
                onClick={() =>
                  setExpandedDropdown(expandedDropdown === 'alphabet' ? null : 'alphabet')
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                  ${
                    sortOptions.alphabet
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                  }`}
              >
                <span>
                  {sortOptions.alphabet
                    ? `首字母: ${sortOptions.alphabet === 'asc' ? 'A-Z' : 'Z-A'}`
                    : '首字母排序'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {expandedDropdown === 'alphabet' && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 min-w-32">
                  <button
                    onClick={() => handleAlphabetChange(null)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      !sortOptions.alphabet ? 'text-primary font-medium' : 'text-gray-600'
                    }`}
                  >
                    不排序
                  </button>
                  <button
                    onClick={() => handleAlphabetChange('asc')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      sortOptions.alphabet === 'asc' ? 'text-primary font-medium' : 'text-gray-600'
                    }`}
                  >
                    A → Z
                  </button>
                  <button
                    onClick={() => handleAlphabetChange('desc')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      sortOptions.alphabet === 'desc' ? 'text-primary font-medium' : 'text-gray-600'
                    }`}
                  >
                    Z → A
                  </button>
                </div>
              )}
            </div>

            {/* Upload Time Sort */}
            <div className="relative">
              <button
                onClick={() =>
                  setExpandedDropdown(expandedDropdown === 'time' ? null : 'time')
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                  ${
                    sortOptions.uploadTime
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                  }`}
              >
                <span>
                  {sortOptions.uploadTime
                    ? `时间: ${sortOptions.uploadTime === 'asc' ? '最早' : '最新'}`
                    : '上传时间'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {expandedDropdown === 'time' && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 min-w-32">
                  <button
                    onClick={() => handleUploadTimeChange(null)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      !sortOptions.uploadTime ? 'text-primary font-medium' : 'text-gray-600'
                    }`}
                  >
                    不排序
                  </button>
                  <button
                    onClick={() => handleUploadTimeChange('desc')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      sortOptions.uploadTime === 'desc' ? 'text-primary font-medium' : 'text-gray-600'
                    }`}
                  >
                    最新优先
                  </button>
                  <button
                    onClick={() => handleUploadTimeChange('asc')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      sortOptions.uploadTime === 'asc' ? 'text-primary font-medium' : 'text-gray-600'
                    }`}
                  >
                    最早优先
                  </button>
                </div>
              )}
            </div>

            {/* Cooking Method Filter */}
            <div className="relative">
              <button
                onClick={() =>
                  setExpandedDropdown(expandedDropdown === 'method' ? null : 'method')
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                  ${
                    sortOptions.cookingMethod
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                  }`}
              >
                <span>
                  {sortOptions.cookingMethod
                    ? `方式: ${sortOptions.cookingMethod}`
                    : '制作方式'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {expandedDropdown === 'method' && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 min-w-40 max-h-80 overflow-y-auto">
                  <button
                    onClick={() => handleCookingMethodFilterChange(null)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      !sortOptions.cookingMethod ? 'text-primary font-medium' : 'text-gray-600'
                    }`}
                  >
                    不限
                  </button>
                  {COOKING_METHODS.map((method) => (
                    <button
                      key={method}
                      onClick={() => handleCookingMethodFilterChange(method)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                        sortOptions.cookingMethod === method
                          ? 'text-primary font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-primary transition-colors"
            >
              <X className="w-4 h-4" />
              <span>清除筛选</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
