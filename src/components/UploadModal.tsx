import { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, ChevronDown, Check, AlertCircle, Type, Plus, Trash2, Flame, Sparkles, ChevronRight, ChevronDown as ChevronDownIcon } from 'lucide-react';
import {
  useRecipeStore,
  COOKING_METHODS,
  INGREDIENT_CATEGORIES,
  DEFAULT_INGREDIENT_SUB_CATEGORIES,
  getAllCookingMethods,
  getAllIngredientCategories,
  detectIngredientCategory,
  extractAllIngredientsFromContent,
  getIngredientData,
  smartCalculateRecipeCalories,
  cleanIngredientName,
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
  // 份数设置
  const [servings, setServings] = useState(2);
  // 热量计算开关
  const [enableCalories, setEnableCalories] = useState(true);
  // 是否展开计算详情
  const [showCalorieDetails, setShowCalorieDetails] = useState(false);

  // 获取所有可用的制作方式
  const allCookingMethods = getAllCookingMethods(customCookingMethods);
  // 获取所有可用的食材分类
  const allIngredientCategories = getAllIngredientCategories(customIngredientCategories);

  // 智能计算总热量（使用新的智能计算系统）
  const calorieEstimate = smartCalculateRecipeCalories([
    ...ingredients.map(i => ({ name: i.name, amount: i.amount, unit: i.unit })),
    ...sauces.map(s => ({ name: s.name, amount: s.amount, unit: s.unit })),
  ]);

  const totalCaloriesMin = calorieEstimate.totalMin;
  const totalCaloriesMax = calorieEstimate.totalMax;
  const totalCalories = Math.round((totalCaloriesMin + totalCaloriesMax) / 2);

  // 格式化热量显示
  const getFormattedCalories = () => {
    if (totalCaloriesMin === totalCaloriesMax) {
      return `≈ ${totalCaloriesMin} kcal`;
    }
    return `≈ ${totalCaloriesMin}–${totalCaloriesMax} kcal`;
  };

  // 计算每份热量
  const getPerServingCalories = () => {
    if (servings <= 0) return `≈ ${totalCaloriesMin}–${totalCaloriesMax} kcal/份`;
    const perMin = Math.round(totalCaloriesMin / servings);
    const perMax = Math.round(totalCaloriesMax / servings);
    if (perMin === perMax) {
      return `≈ ${perMin} kcal/份`;
    }
    return `≈ ${perMin}–${perMax} kcal/份`;
  };

  // 获取可靠度文字
  const getReliabilityText = () => {
    switch (calorieEstimate.reliability) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '中';
    }
  };

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

  // 当开启热量计算或内容变化时，自动解析食材和分类
  useEffect(() => {
    if (content.trim()) {
      const { parsedIngredients, parsedSauces } = parseIngredientsAndSaucesFromContent(content);

      // 更新食材和酱料（只有为空时才自动填充）
      if (ingredients.length === 0 && parsedIngredients.length > 0) {
        setIngredients(parsedIngredients);
      }
      if (sauces.length === 0 && parsedSauces.length > 0) {
        setSauces(parsedSauces);
      }

      // 自动检测食材分类（使用解析后的食材名称）
      const { bestCategory, ingredientsWithCategory } = autoDetectCategory(parsedIngredients, parsedSauces);
      setAutoDetectedCategory(bestCategory);
      setDetectedIngredients(ingredientsWithCategory);
      if (!ingredientCategory && bestCategory) {
        setIngredientCategory(bestCategory);
      }
    }
  }, [content]);

  // 从菜谱内容自动检测食材分类
  const autoDetectCategory = (parsedIngredients: Ingredient[], parsedSauces: Sauce[]) => {
    if (!content.trim()) return { bestCategory: null, ingredientsWithCategory: [] };

    // 优先使用解析后的食材列表，否则从内容中提取
    let allIngredientNames: string[] = [];

    if (parsedIngredients.length > 0) {
      allIngredientNames = parsedIngredients.map(i => i.name);
    } else {
      allIngredientNames = extractAllIngredientsFromContent(content);
    }

    // 统计每个分类的出现次数
    const categoryCount: Record<string, number> = {};
    const ingredientsWithCategory: {name: string; category: IngredientCategory | null; selected: boolean}[] = [];

    for (const ingName of allIngredientNames) {
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

  // 从内容中解析食材和酱料（包含数量和单位）
  const parseIngredientsAndSaucesFromContent = (text: string): { parsedIngredients: Ingredient[], parsedSauces: Sauce[] } => {
    const parsedIngredients: Ingredient[] = [];
    const parsedSauces: Sauce[] = [];
    const lines = text.split('\n');
    let inIngredientsSection = false;
    let inSaucesSection = false;

    // 调料关键词
    const sauceKeywords = ['调料', '调味料', '调味汁', '酱料', '调味', '腌料'];

    // 酱料/调味料列表（用于判断）
    const knownSauces = [
      '盐', '鸡精', '味精', '胡椒粉', '黑胡椒', '白胡椒', '五香粉', '花椒', '八角', '桂皮',
      '生抽', '老抽', '酱油', '蚝油', '豆瓣酱', '番茄酱', '辣椒酱', '料酒', '醋', '米醋',
      '香油', '芝麻油', '橄榄油', '植物油', '食用油', '白糖', '红糖', '冰糖', '蜂蜜',
      '淀粉', '生粉', '柠檬汁', '百里香', '辣椒粉'
    ];

    for (const line of lines) {
      const trimmed = line.trim();

      // 跳过空行
      if (!trimmed) continue;

      // 跳过做法部分
      if (trimmed.startsWith('步骤') || trimmed.startsWith('做法') || trimmed.startsWith('制作')) {
        inIngredientsSection = false;
        inSaucesSection = false;
        continue;
      }

      // 检测食材区域开始
      if (trimmed.match(/^[食材主料配料材料锅底菜底肉海鲜]+[：:：]?$/)) {
        inIngredientsSection = true;
        inSaucesSection = false;
        continue;
      }

      // 检测调料区域开始
      const isSauceLine = sauceKeywords.some(k => trimmed.match(new RegExp(`^${k}[：:]?$`)));
      if (isSauceLine) {
        inSaucesSection = true;
        inIngredientsSection = false;
        continue;
      }

      // 解析列表项（带标记的格式）
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+[.、]/.test(trimmed)) {
        let text = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+[.、]\s*/, '');

        // 解析食材
        const parsed = parseIngredientLine(text, inSaucesSection);
        if (parsed && !parsedIngredients.some(i => i.name === parsed.name) && !parsedSauces.some(s => s.name === parsed.name)) {
          if (knownSauces.includes(parsed.name) || inSaucesSection) {
            parsedSauces.push(parsed);
          } else {
            parsedIngredients.push(parsed);
          }
        }
      }
      // 解析纯文本格式（无标记，如 "胡萝卜 2根"）
      else if (inIngredientsSection || inSaucesSection) {
        // 检查是否是食材格式：中文开头 + 可能有数字和单位
        if (/^[\u4e00-\u9fa5]/.test(trimmed)) {
          const parsed = parseIngredientLine(trimmed, inSaucesSection);
          if (parsed && !parsedIngredients.some(i => i.name === parsed.name) && !parsedSauces.some(s => s.name === parsed.name)) {
            if (knownSauces.includes(parsed.name)) {
              parsedSauces.push(parsed);
            } else {
              parsedIngredients.push(parsed);
            }
          }
        }
      }
    }

    // 如果没有检测到区域但有内容，尝试从整段文本中提取
    if (parsedIngredients.length === 0 && parsedSauces.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('步骤') || trimmed.startsWith('做法')) continue;

        // 解析纯文本格式
        if (/^[\u4e00-\u9fa5]/.test(trimmed)) {
          const parsed = parseIngredientLine(trimmed, false);
          if (parsed && !parsedIngredients.some(i => i.name === parsed.name) && !parsedSauces.some(s => s.name === parsed.name)) {
            if (knownSauces.includes(parsed.name)) {
              parsedSauces.push(parsed);
            } else {
              parsedIngredients.push(parsed);
            }
          }
        }
      }
    }

    return { parsedIngredients, parsedSauces };
  };

  // 解析单行食材文本
  const parseIngredientLine = (text: string, isSauceContext: boolean): Ingredient | null => {
    // 移除括号后的内容（如 "盐（少许）" -> "盐"）
    let cleanText = text.replace(/[（(].*[)）]/, '').trim();

    if (!cleanText) return null;

    // 解析食材名称和数量
    // 格式: "食材名 数量单位" 或 "食材名（备注）"
    // 支持多种单位格式
    const match = cleanText.match(/^(.+?)\s+(\d+\.?\d*)\s*(ml|ML|毫升|克|g|个|根|只|勺|杯|块|条|份|分钟|两|斤)?/);

    let name = cleanText;
    let amount = 1;
    let unit = isSauceContext ? '勺' : '份';

    if (match) {
      name = match[1].trim();
      amount = parseFloat(match[2]) || 1;
      unit = match[3] || unit;
    }

    // 清理食材名称（去除动作词前缀）
    name = cleanIngredientName(name);

    // 跳过空名称
    if (!name || name.length < 2) return null;

    // 获取热量数据
    const data = getIngredientData(name);
    const calories = data?.calories || 50;

    return { name, calories, unit, amount };
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
    // 自动从内容中解析食材和酱料（包含数量）
    const { parsedIngredients, parsedSauces } = parseIngredientsAndSaucesFromContent(text);
    // 只有在没有手动添加过食材时才自动填充
    if (ingredients.length === 0 && parsedIngredients.length > 0) {
      setIngredients(parsedIngredients);
    }
    if (sauces.length === 0 && parsedSauces.length > 0) {
      setSauces(parsedSauces);
    }
    // 自动检测食材分类（使用解析后的食材）
    const { bestCategory, ingredientsWithCategory } = autoDetectCategory(parsedIngredients, parsedSauces);
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
    const data = getIngredientData(newIngredient.name);
    // 使用默认单位，用户可手动修改
    const calories = data?.calories || parseFloat(newIngredient.calories) || 50;

    setIngredients([
      ...ingredients,
      {
        name: newIngredient.name.trim(),
        calories,
        unit: newIngredient.unit,
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
    const data = getIngredientData(newSauce.name);
    // 使用默认单位，用户可手动修改
    const calories = data?.calories || parseFloat(newSauce.calories) || 10;

    setSauces([
      ...sauces,
      {
        name: newSauce.name.trim(),
        calories,
        unit: newSauce.unit,
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

      const formattedText = formattedLines.join('\n');
      setContent(formattedText);

      // 自动识别标题
      if (!title && fileName) {
        setDetectedTitle(fileName.substring(0, 30));
      }
      // 自动从内容中解析食材和酱料（包含数量）
      const { parsedIngredients, parsedSauces } = parseIngredientsAndSaucesFromContent(formattedText);
      if (ingredients.length === 0 && parsedIngredients.length > 0) {
        setIngredients(parsedIngredients);
      }
      if (sauces.length === 0 && parsedSauces.length > 0) {
        setSauces(parsedSauces);
      }
      // 自动检测食材分类
      const { bestCategory, ingredientsWithCategory } = autoDetectCategory(parsedIngredients, parsedSauces);
      setAutoDetectedCategory(bestCategory);
      setDetectedIngredients(ingredientsWithCategory);
      if (!ingredientCategory && bestCategory) {
        setIngredientCategory(bestCategory);
      }
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
    // 自动从内容中解析食材和酱料（包含数量）
    const { parsedIngredients, parsedSauces } = parseIngredientsAndSaucesFromContent(formattedText);
    // 只有在没有手动添加过食材时才自动填充
    if (ingredients.length === 0 && parsedIngredients.length > 0) {
      setIngredients(parsedIngredients);
    }
    if (sauces.length === 0 && parsedSauces.length > 0) {
      setSauces(parsedSauces);
    }
    // 自动检测食材分类
    const { bestCategory, ingredientsWithCategory } = autoDetectCategory(parsedIngredients, parsedSauces);
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
    const finalTotalCalories = Math.round((totalCaloriesMin + totalCaloriesMax) / 2);
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
        totalCaloriesMin: Math.round(totalCaloriesMin),
        totalCaloriesMax: Math.round(totalCaloriesMax),
        servings,
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
        totalCaloriesMin: Math.round(totalCaloriesMin),
        totalCaloriesMax: Math.round(totalCaloriesMax),
        servings,
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-gray-700">热量估算</span>
              </div>
              {/* 热量开关 */}
              <button
                onClick={() => setEnableCalories(!enableCalories)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  enableCalories ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {enableCalories ? '已开启' : '已关闭'}
              </button>
            </div>

            {enableCalories && (
              <>
                {/* Simple Estimate Display */}
                <div className="bg-white rounded-lg p-3 mb-3">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-orange-500">{getFormattedCalories()}</span>
                    {servings > 1 && (
                      <div className="mt-1 text-sm text-gray-500">
                        {servings}人份 · {getPerServingCalories()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      calorieEstimate.reliability === 'high' ? 'bg-green-100 text-green-700' :
                      calorieEstimate.reliability === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      估算可靠度：{getReliabilityText()}
                    </span>
                    <button
                      onClick={() => setShowCalorieDetails(!showCalorieDetails)}
                      className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      {showCalorieDetails ? '收起详情' : '查看计算详情'}
                      {showCalorieDetails ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Details */}
                {showCalorieDetails && calorieEstimate.details.length > 0 && (
                  <div className="bg-white/80 rounded-lg p-3 mb-3 text-sm">
                    <div className="space-y-1.5">
                      {calorieEstimate.details.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">{item.name}</span>
                            <span className="text-gray-400 text-xs">{item.displayAmount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.status === 'calculated' && (
                              <span className="text-orange-500 font-medium">
                                ≈ {item.minCal === item.maxCal ? `${item.minCal}` : `${item.minCal}–${item.maxCal}`} kcal
                              </span>
                            )}
                            {item.status === 'zero' && (
                              <span className="text-gray-400">0 kcal</span>
                            )}
                            {item.status === 'ignored' && (
                              <span className="text-gray-400 italic">已忽略</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-400">
                      部分食材使用常见单位或模糊用量估算，结果仅供参考。
                    </div>
                  </div>
                )}

                {/* Servings Control */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">份数</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{servings}</span>
                    <button
                      onClick={() => setServings(servings + 1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Ingredients & Sauces - Auto-detected from content */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">食材</span>
                      {ingredients.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                          自动识别
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{ingredients.length} 项</span>
                  </div>
                  {/* Auto-detected Ingredients */}
                  {ingredients.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {ingredients.map((ing, idx) => {
                        const result = smartCalculateRecipeCalories([{ name: ing.name, amount: ing.amount, unit: ing.unit }]);
                        const item = result.details[0];
                        return (
                          <div key={idx} className="group flex items-center gap-1 bg-white rounded-full px-3 py-1 text-sm border border-gray-200 hover:border-red-300 transition-colors">
                            <span className="text-gray-700">{ing.name}</span>
                            <span className="text-orange-500 font-medium">
                              {item.status === 'calculated' ? `≈ ${item.minCal === item.maxCal ? item.minCal : `${item.minCal}–${item.maxCal}`}卡` :
                               item.status === 'zero' ? '0卡' : '已忽略'}
                            </span>
                            <button
                              onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                              className="ml-1 w-4 h-4 rounded-full bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="删除"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      从菜谱内容中自动提取
                    </div>
                  )}
                </div>

                {/* Sauces - Auto-detected from content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">酱料</span>
                      {sauces.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                          自动识别
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{sauces.length} 项</span>
                  </div>
                  {/* Auto-detected Sauces */}
                  {sauces.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {sauces.map((sauce, idx) => {
                        const result = smartCalculateRecipeCalories([{ name: sauce.name, amount: sauce.amount, unit: sauce.unit }]);
                        const item = result.details[0];
                        return (
                          <div key={idx} className="group flex items-center gap-1 bg-white rounded-full px-3 py-1 text-sm border border-gray-200 hover:border-red-300 transition-colors">
                            <span className="text-gray-700">{sauce.name}</span>
                            <span className="text-orange-500 font-medium">
                              {item.status === 'calculated' ? `≈ ${item.minCal === item.maxCal ? item.minCal : `${item.minCal}–${item.maxCal}`}卡` :
                               item.status === 'zero' ? '0卡' : '已忽略'}
                            </span>
                            <button
                              onClick={() => setSauces(sauces.filter((_, i) => i !== idx))}
                              className="ml-1 w-4 h-4 rounded-full bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="删除"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      从菜谱内容中自动提取
                    </div>
                  )}
                </div>
              </>
            )}
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