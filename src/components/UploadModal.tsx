import { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, ChevronDown, Check, AlertCircle, Type, Plus, Trash2, Flame, Sparkles } from 'lucide-react';
import {
  useRecipeStore,
  COOKING_METHODS,
  INGREDIENT_CATEGORIES,
  DEFAULT_INGREDIENT_SUB_CATEGORIES,
  COMMON_INGREDIENTS_CALORIES,
  getAllCookingMethods,
  getAllIngredientCategories,
  detectIngredientCategory,
  extractAllIngredientsFromContent,
  getIngredientCalorieInfo,
  calculateCalories,
  type CookingMethod,
  type IngredientCategory,
  type Ingredient,
  type Sauce,
} from '@/store/recipeStore';

export default function UploadModal() {
  const {
    isModalOpen,
    closeModal,
    addRecipe,
    updateRecipe,
    editingRecipeId,
    getRecipeById,
    customCookingMethods,
    addCustomCookingMethod,
    customIngredientCategories,
    addCustomIngredientCategory,
  } = useRecipeStore();

  const editingRecipe = editingRecipeId ? getRecipeById(editingRecipeId) : undefined;
  const isEditing = !!editingRecipe;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cookingMethod, setCookingMethod] = useState<CookingMethod>('炒');
  const [ingredientCategory, setIngredientCategory] = useState<IngredientCategory | ''>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [detectedTitle, setDetectedTitle] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [sauces, setSauces] = useState<Sauce[]>([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', calories: '', unit: 'g', amount: '1' });
  const [newSauce, setNewSauce] = useState({ name: '', calories: '', unit: '勺', amount: '1' });
  const [newCookingMethod, setNewCookingMethod] = useState('');
  const [newIngredientCategory, setNewIngredientCategory] = useState('');
  const [autoDetectedCategory, setAutoDetectedCategory] = useState<IngredientCategory | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  // 自动识别的食材及其分类（可选择）
  const [detectedIngredients, setDetectedIngredients] = useState<{name: string; category: IngredientCategory | null; selected: boolean}[]>([]);
  // 正在手动编辑分类的食材索引
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  // 显示添加新分类输入框
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取所有可用的制作方式
  const allCookingMethods = getAllCookingMethods(customCookingMethods);
  // 获取所有可用的食材分类
  const allIngredientCategories = getAllIngredientCategories(customIngredientCategories);

  // 计算总热量
  const totalCalories = ingredients.reduce((sum, ing) => sum + ing.calories * ing.amount, 0) +
                        sauces.reduce((sum, s) => sum + s.calories * s.amount, 0);

  // 从内容中自动识别菜名
  const extractTitleFromContent = (text: string): string => {
    if (!text.trim()) return '';
    const lines = text.split('\n').filter(l => l.trim());

    for (const line of lines) {
      const trimmed = line.trim();

      // 跳过配料/步骤标记
      if (trimmed.startsWith('食材') || trimmed.startsWith('配料') ||
          trimmed.startsWith('步骤') || trimmed.startsWith('调味料')) {
        continue;
      }

      // 匹配菜名格式：菜名：xxx
      const nameMatch = trimmed.match(/^[菜名名称题目]+[：:]\s*(.+)/);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim();
      }

      // 如果第一行是短句（2-20字），作为菜名
      if (trimmed.length >= 2 && trimmed.length <= 20 && !trimmed.includes('：')) {
        return trimmed;
      }
    }

    return '';
  };

  // 当编辑的菜谱变化时，更新表单
  useEffect(() => {
    if (editingRecipe) {
      setTitle(editingRecipe.title);
      setContent(editingRecipe.content);
      setCookingMethod(editingRecipe.cookingMethod);
      setIngredientCategory(editingRecipe.ingredientCategory || '');
      setAutoDetectedCategory(editingRecipe.ingredientCategory || null);
      setDetectedTitle('');
      setIngredients(editingRecipe.ingredients || []);
      setSauces(editingRecipe.sauces || []);
    } else {
      setTitle('');
      setContent('');
      setCookingMethod('炒');
      setIngredientCategory('');
      setAutoDetectedCategory(null);
      setDetectedTitle('');
      setIngredients([]);
      setSauces([]);
    }
    setError('');
    setShowCategoryDropdown(false);
  }, [editingRecipe, isModalOpen]);

  // 从菜谱内容自动检测食材分类
  const autoDetectCategory = () => {
    if (!content.trim()) return { bestCategory: null, ingredientsWithCategory: [] };

    // 从内容中提取食材
    const ingredientNames = extractAllIngredientsFromContent(content);

    // 如果提取不到食材，尝试从已有的 ingredients 列表中获取
    const allIngredients = ingredientNames.length > 0
      ? ingredientNames
      : ingredients.map(i => i.name);

    // 统计每个分类的出现次数
    const categoryCount: Record<string, number> = {};
    const ingredientsWithCategory: {name: string; category: IngredientCategory | null; selected: boolean}[] = [];

    for (const ingName of allIngredients) {
      const detected = detectIngredientCategory(ingName);
      // 默认选中已识别的食材，未识别的不选中
      ingredientsWithCategory.push({ name: ingName, category: detected, selected: detected !== null });
      if (detected) {
        categoryCount[detected] = (categoryCount[detected] || 0) + 1;
      }
    }

    // 找出出现最多的分类
    let maxCount = 0;
    let bestCategory: IngredientCategory | null = null;

    for (const [cat, count] of Object.entries(categoryCount)) {
      if (count > maxCount) {
        maxCount = count;
        bestCategory = cat as IngredientCategory;
      }
    }

    return { bestCategory, ingredientsWithCategory };
  };

  // 切换食材选中状态
  const toggleIngredientSelection = (index: number) => {
    setDetectedIngredients(prev =>
      prev.map((ing, i) =>
        i === index ? { ...ing, selected: !ing.selected } : ing
      )
    );
  };

  // 全选/取消全选
  const toggleSelectAll = (select: boolean) => {
    setDetectedIngredients(prev =>
      prev.map(ing => ({ ...ing, selected: select }))
    );
  };

  // 获取用户选中的食材（用于筛选）
  const getSelectedIngredients = () => {
    return detectedIngredients.filter(ing => ing.selected);
  };

  // 添加自定义食材分类
  const handleAddCustomCategory = () => {
    if (newCategoryName.trim()) {
      // 添加到自定义分类
      addCustomIngredientCategory(newCategoryName.trim());
      // 如果正在编辑某个食材的分类，则更新该食材的分类
      if (editingIngredientIndex !== null) {
        setDetectedIngredients(prev =>
          prev.map((item, i) =>
            i === editingIngredientIndex ? { ...item, category: newCategoryName.trim() as IngredientCategory, selected: true } : item
          )
        );
      }
      // 关闭输入框并清空
      setNewCategoryName('');
      setShowAddCategoryInput(false);
      setEditingIngredientIndex(null);
    }
  };

  // 取消添加新分类
  const handleCancelAddCategory = () => {
    setNewCategoryName('');
    setShowAddCategoryInput(false);
  };

  // 处理内容变化并自动检测分类
  const handleContentChange = (text: string) => {
    setContent(text);
    // 自动识别标题
    if (!title && !isEditing) {
      const detected = extractTitleFromContent(text);
      setDetectedTitle(detected);
    }
    // 自动检测食材分类
    const { bestCategory, ingredientsWithCategory } = autoDetectCategory();
    setAutoDetectedCategory(bestCategory);
    setDetectedIngredients(ingredientsWithCategory);
    if (!ingredientCategory && bestCategory) {
      setIngredientCategory(bestCategory);
    }
  };

  // 添加食材（自动热量计算）
  const addIngredient = () => {
    if (!newIngredient.name.trim()) return;

    // 尝试自动获取热量信息
    const calorieInfo = getIngredientCalorieInfo(newIngredient.name);
    const unit = calorieInfo?.unit || newIngredient.unit;
    const calories = calorieInfo?.calories || parseFloat(newIngredient.calories) || 50;

    setIngredients([
      ...ingredients,
      {
        name: newIngredient.name.trim(),
        calories,
        unit,
        amount: parseFloat(newIngredient.amount) || 1,
      },
    ]);
    setNewIngredient({ name: '', calories: '', unit: 'g', amount: '1' });
  };

  // 删除食材
  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // 添加酱料（自动热量计算）
  const addSauce = () => {
    if (!newSauce.name.trim()) return;

    // 尝试自动获取热量信息
    const calorieInfo = getIngredientCalorieInfo(newSauce.name);
    const unit = calorieInfo?.unit || newSauce.unit;
    const calories = calorieInfo?.calories || parseFloat(newSauce.calories) || 10;

    setSauces([
      ...sauces,
      {
        name: newSauce.name.trim(),
        calories,
        unit,
        amount: parseFloat(newSauce.amount) || 1,
      },
    ]);
    setNewSauce({ name: '', calories: '', unit: '勺', amount: '1' });
  };

  // 删除酱料
  const removeSauce = (index: number) => {
    setSauces(sauces.filter((_, i) => i !== index));
  };

  // 添加自定义制作方式
  const handleAddCustomMethod = () => {
    if (newCookingMethod.trim()) {
      addCustomCookingMethod(newCookingMethod.trim());
      setNewCookingMethod('');
    }
  };

  // 格式化菜谱内容
  const formatContent = () => {
    if (!content.trim()) return;
    const lines = content.split('\n');
    const formattedLines = lines.map(line => {
      let formatted = line.trim();
      formatted = formatted.replace(/[，,]+/g, '，').replace(/[。.]+/g, '。');
      formatted = formatted.replace(/[：:]+/g, '：');
      formatted = formatted.replace(/^(\d+)[\.、\)]+\s*/, '$1. ');
      return formatted;
    }).filter(line => line.length > 0);
    setContent(formattedLines.join('\n'));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const textFile = files.find((f) =>
      ['.txt', '.doc', '.docx'].some((ext) => f.name.toLowerCase().endsWith(ext))
    );

    if (!textFile) {
      setError('请上传 .txt 格式的文件');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      let text = '';
      if (textFile.name.endsWith('.txt')) {
        text = await textFile.text();
      } else {
        setError('支持 .txt 格式。其他格式请手动复制内容。');
        setIsUploading(false);
        return;
      }

      const fileName = textFile.name.replace(/\.[^.]+$/, '');
      if (!title && fileName) {
        setTitle(fileName.substring(0, 30));
      }

      const lines = text.split('\n').filter((l) => l.trim());
      const formattedLines = lines.map(line => {
        let formatted = line.trim();
        formatted = formatted.replace(/[，,]+/g, '，').replace(/[。.]+/g, '。');
        formatted = formatted.replace(/[：:]+/g, '：');
        formatted = formatted.replace(/^(\d+)[\.、\)]+\s*/, '$1. ');
        return formatted;
      });

      setContent(formattedLines.join('\n'));
    } catch (err) {
      setError('文件读取失败，请重试');
    }

    setIsUploading(false);
  };

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
      let formatted = line.trim();
      formatted = formatted.replace(/[，,]+/g, '，').replace(/[。.]+/g, '。');
      return formatted;
    });
    const formattedText = formattedLines.join('\n');
    setContent(formattedText);

    // 自动识别标题
    if (!title && !isEditing) {
      const detected = extractTitleFromContent(formattedText);
      setDetectedTitle(detected);
    }
    // 自动检测食材分类
    const { bestCategory, ingredientsWithCategory } = autoDetectCategory();
    setAutoDetectedCategory(bestCategory);
    setDetectedIngredients(ingredientsWithCategory);
    if (!ingredientCategory && bestCategory) {
      setIngredientCategory(bestCategory);
    }
  };

  // 应用识别的标题
  const applyDetectedTitle = () => {
    if (detectedTitle) {
      setTitle(detectedTitle);
      setDetectedTitle('');
    }
  };

  const handleSubmit = () => {
    const finalTitle = title.trim() || detectedTitle || '';
    if (!finalTitle) {
      setError('请输入菜谱标题');
      return;
    }
    if (!content.trim()) {
      setError('请输入菜谱内容');
      return;
    }

    const finalCategory = ingredientCategory || null;
    const finalTotalCalories = Math.round(totalCalories);
    // 获取用户选中的食材
    const finalSelectedIngredients = detectedIngredients
      .filter(ing => ing.selected)
      .map(ing => ({ name: ing.name, category: ing.category }));

    if (isEditing && editingRecipe) {
      updateRecipe(editingRecipe.id, {
        title: title.trim(),
        content: content.trim(),
        cookingMethod,
        ingredientCategory: finalCategory,
        ingredients,
        sauces,
        totalCalories: finalTotalCalories,
        selectedIngredients: finalSelectedIngredients,
      });
    } else {
      addRecipe({
        title: title.trim(),
        content: content.trim(),
        cookingMethod,
        ingredientCategory: finalCategory,
        ingredients,
        sauces,
        totalCalories: finalTotalCalories,
        selectedIngredients: finalSelectedIngredients,
      });
    }

    closeModal();
  };

  const handleClose = () => {
    closeModal();
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Upload className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {isEditing ? '编辑菜谱' : '上传菜谱'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditing ? '修改菜谱信息' : '分享你的美食心得'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              菜谱标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：红烧肉、蒜蓉西兰花..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                       text-gray-700 placeholder-gray-400 text-base
                       focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300
                       transition-all"
            />
            {/* Detected Title Hint */}
            {detectedTitle && !title && (
              <div className="mt-2 flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm text-green-700">
                  检测到标题：
                </span>
                <span className="text-sm font-medium text-green-800">
                  {detectedTitle}
                </span>
                <button
                  onClick={applyDetectedTitle}
                  className="ml-auto px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-medium
                           hover:bg-green-600 transition-colors"
                >
                  应用
                </button>
              </div>
            )}
          </div>

          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
              ${
                isDragging
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200 hover:bg-gray-50'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isUploading ? '读取中...' : '拖拽文件上传，或点击选择文件'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">支持 .txt 格式</p>
              </div>
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                菜谱内容 <span className="text-red-500">*</span>
              </label>
              <button
                onClick={formatContent}
                disabled={!content.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Type className="w-3.5 h-3.5" />
                格式化
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="粘贴菜谱内容到这里...

参考格式：
食材：
- 番茄 2个
- 鸡蛋 3个

步骤：
1. 番茄切块，鸡蛋打散
2. 热锅倒油，先炒鸡蛋
3. 再炒番茄，调味出锅"
              className="w-full h-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                       text-gray-700 placeholder-gray-400 text-base
                       focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300
                       transition-all resize-none"
              style={{ lineHeight: '1.8' }}
            />
          </div>

          {/* Calories Section */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-gray-700">热量计算</span>
            </div>

            {/* Total Calories Display */}
            <div className="bg-white rounded-lg p-3 mb-4 flex items-center justify-between">
              <span className="text-gray-600">总热量</span>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-orange-500">{Math.round(totalCalories)}</span>
                <span className="text-sm text-gray-500">大卡</span>
              </div>
            </div>

            {/* Ingredients Input */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">食材</span>
                <span className="text-xs text-gray-400">{ingredients.length} 项</span>
              </div>
              {/* Added Ingredients */}
              {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-white rounded-full px-3 py-1 text-sm border border-gray-200">
                      <span className="text-gray-700">{ing.name}</span>
                      <span className="text-orange-500 font-medium">{Math.round(ing.calories * ing.amount)}卡</span>
                      <button onClick={() => removeIngredient(idx)} className="ml-1 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Add Ingredient Input */}
              <div className="space-y-2">
                {/* 自动建议显示 */}
                {newIngredient.name && getIngredientCalorieInfo(newIngredient.name) && (
                  <div className="text-xs text-green-600 flex items-center gap-1 px-1">
                    <Sparkles className="w-3 h-3" />
                    <span>自动建议：{getIngredientCalorieInfo(newIngredient.name)?.calories} {getIngredientCalorieInfo(newIngredient.name)?.unit}/份</span>
                  </div>
                )}
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="text"
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    placeholder="食材名称"
                    className="flex-1 min-w-[100px] px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-300"
                  />
                  <input
                    type="number"
                    value={newIngredient.calories}
                    onChange={(e) => setNewIngredient({ ...newIngredient, calories: e.target.value })}
                    placeholder={getIngredientCalorieInfo(newIngredient.name)?.unit || "热量"}
                    className="w-16 sm:w-20 px-2 sm:px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-300"
                  />
                  <input
                    type="number"
                    value={newIngredient.amount}
                    onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                    placeholder="数量"
                    className="w-14 sm:w-16 px-2 sm:px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-300"
                  />
                  <button
                    onClick={addIngredient}
                    className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">输入食材名会自动匹配标准热量，如需修改请手动编辑</p>
              </div>
            </div>

            {/* Sauces Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">酱料</span>
                <span className="text-xs text-gray-400">{sauces.length} 项</span>
              </div>
              {/* Added Sauces */}
              {sauces.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {sauces.map((sauce, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-white rounded-full px-3 py-1 text-sm border border-gray-200">
                      <span className="text-gray-700">{sauce.name}</span>
                      <span className="text-orange-500 font-medium">{Math.round(sauce.calories * sauce.amount)}卡</span>
                      <button onClick={() => removeSauce(idx)} className="ml-1 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Add Sauce Input */}
              <div className="space-y-2">
                {/* 自动建议显示 */}
                {newSauce.name && getIngredientCalorieInfo(newSauce.name) && (
                  <div className="text-xs text-green-600 flex items-center gap-1 px-1">
                    <Sparkles className="w-3 h-3" />
                    <span>自动建议：{getIngredientCalorieInfo(newSauce.name)?.calories} {getIngredientCalorieInfo(newSauce.name)?.unit}/份</span>
                  </div>
                )}
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="text"
                    value={newSauce.name}
                    onChange={(e) => setNewSauce({ ...newSauce, name: e.target.value })}
                    placeholder="酱料名称"
                    className="flex-1 min-w-[100px] px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-300"
                  />
                  <input
                    type="number"
                    value={newSauce.calories}
                    onChange={(e) => setNewSauce({ ...newSauce, calories: e.target.value })}
                    placeholder={getIngredientCalorieInfo(newSauce.name)?.unit || "热量"}
                    className="w-16 sm:w-20 px-2 sm:px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-300"
                  />
                  <input
                    type="number"
                    value={newSauce.amount}
                    onChange={(e) => setNewSauce({ ...newSauce, amount: e.target.value })}
                    placeholder="数量"
                    className="w-14 sm:w-16 px-2 sm:px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-300"
                  />
                  <button
                    onClick={addSauce}
                    className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">添加调味料、酱汁等（会自动匹配标准热量）</p>
              </div>
            </div>
          </div>

          {/* Category Selectors */}
          <div className="space-y-4">
            {/* Cooking Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                烹饪方式 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={cookingMethod}
                  onChange={(e) => setCookingMethod(e.target.value as CookingMethod)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           text-gray-700 appearance-none cursor-pointer text-base
                           focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                >
                  {allCookingMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {/* Custom Method Input */}
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newCookingMethod}
                  onChange={(e) => setNewCookingMethod(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomMethod()}
                  placeholder="添加自定义分类（如：烘焙）"
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-300"
                />
                <button
                  onClick={handleAddCustomMethod}
                  disabled={!newCookingMethod.trim()}
                  className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {customCookingMethods.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  已添加：{customCookingMethods.join('、')}
                </p>
              )}
            </div>

            {/* Ingredient Category - Auto-detected */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                食材分类
              </label>
              <div className="relative">
                <select
                  value={ingredientCategory}
                  onChange={(e) => setIngredientCategory(e.target.value as IngredientCategory | '')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           text-gray-700 appearance-none cursor-pointer text-base
                           focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                >
                  <option value="">不选择</option>
                  {allIngredientCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {/* Auto-detected hint */}
              {autoDetectedCategory && !ingredientCategory && (
                <div className="mt-2 flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <Sparkles className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-green-700">
                    根据菜谱内容，建议分类为：
                  </span>
                  <button
                    onClick={() => setIngredientCategory(autoDetectedCategory)}
                    className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-medium
                             hover:bg-green-600 transition-colors"
                  >
                    {autoDetectedCategory}
                  </button>
                </div>
              )}
              {/* Current auto-detection hint (when not manually changed) */}
              {autoDetectedCategory && ingredientCategory === autoDetectedCategory && (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  已根据食材内容自动分类
                </p>
              )}
            </div>

            {/* Auto-detected Ingredients List */}
            {detectedIngredients.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-700">自动识别的食材</span>
                    <span className="text-xs text-gray-400">（勾选用于筛选）</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleSelectAll(true)}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      全选
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => toggleSelectAll(false)}
                      className="text-xs text-gray-500 hover:text-gray-600"
                    >
                      取消全选
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detectedIngredients.map((ing, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                          ing.selected
                            ? ing.category
                              ? 'bg-green-100 border-green-300 text-gray-800'
                              : 'bg-gray-50 border-gray-200 text-gray-600'
                            : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                        }`}
                      >
                        {/* 复选框 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleIngredientSelection(idx);
                          }}
                          className="focus:outline-none"
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                            ing.selected ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                          }`}>
                            {ing.selected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                        </button>
                        <span>{ing.name}</span>
                        {ing.category && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingIngredientIndex(editingIngredientIndex === idx ? null : idx);
                              setShowAddCategoryInput(false);
                            }}
                            className="text-xs text-green-600 hover:text-green-700 flex items-center gap-0.5"
                            title="点击修改分类"
                          >
                            → {ing.category}
                            <span className="text-gray-400">(改)</span>
                          </button>
                        )}
                        {!ing.category && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingIngredientIndex(editingIngredientIndex === idx ? null : idx);
                              setShowAddCategoryInput(false);
                            }}
                            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-0.5"
                            title="点击手动分类"
                          >
                            (未识别)
                          </button>
                        )}
                      </div>
                      {/* 分类选择下拉菜单（未识别或修改分类时显示） */}
                      {editingIngredientIndex === idx && (
                        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-40">
                          <div className="px-3 py-1.5 text-xs text-gray-400 border-b border-gray-100">
                            {ing.category ? '修改分类' : '选择分类'}
                          </div>
                          {allIngredientCategories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => {
                                setDetectedIngredients(prev =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, category: cat as IngredientCategory, selected: true } : item
                                  )
                                );
                                setEditingIngredientIndex(null);
                              }}
                              className={`w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                                ing.category === cat ? 'text-green-600 font-medium bg-green-50' : 'text-gray-700'
                              }`}
                            >
                              <span>{cat}</span>
                              {ing.category === cat && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            {showAddCategoryInput && editingIngredientIndex === idx ? (
                              <div className="px-2 py-1">
                                <input
                                  type="text"
                                  value={newCategoryName}
                                  onChange={(e) => setNewCategoryName(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                                  placeholder="输入新分类名"
                                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-green-400"
                                  autoFocus
                                />
                                <div className="flex gap-1 mt-1">
                                  <button
                                    onClick={handleAddCustomCategory}
                                    disabled={!newCategoryName.trim()}
                                    className="flex-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                  >
                                    确认
                                  </button>
                                  <button
                                    onClick={handleCancelAddCategory}
                                    className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowAddCategoryInput(true)}
                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 text-blue-500 flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                添加新分类
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* 点击其他地方关闭分类编辑 */}
                {(editingIngredientIndex !== null || showAddCategoryInput) && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      setEditingIngredientIndex(null);
                      setShowAddCategoryInput(false);
                      setNewCategoryName('');
                    }}
                  />
                )}
                <p className="text-xs text-gray-400 mt-2">
                  勾选的食材将用于筛选。点击食材右侧的分类标签可修改分类，点击"+添加新分类"可创建新分类
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl
                     font-medium shadow-lg shadow-orange-200
                     hover:bg-orange-600 transition-colors"
          >
            <Check className="w-4 h-4" />
            {isEditing ? '保存修改' : '保存菜谱'}
          </button>
        </div>
      </div>
    </div>
  );
}