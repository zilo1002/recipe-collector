import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CookingMethod =
  | '炒' | '煎' | '炸' | '蒸' | '煮' | '炖'
  | '焯' | '烫' | '烤' | '微波' | '高压'
  | '凉拌' | '红烧' | '焖' | '烩' | '煲'
  | '酱料' | '饮品' | '甜品';

export type IngredientCategory = string;

export interface Ingredient {
  name: string;
  calories: number;
  unit: string;
  amount: number;
}

export interface Sauce {
  name: string;
  calories: number;
  unit: string;
  amount: number;
}

export interface Recipe {
  id: string;
  title: string;
  content: string;
  ingredients: Ingredient[];
  sauces: Sauce[];
  totalCalories: number;
  totalCaloriesMin?: number;  // 热量最小值（兼容旧数据）
  totalCaloriesMax?: number;  // 热量最大值（兼容旧数据）
  servings?: number;  // 份数（兼容旧数据）
  cookingMethod: CookingMethod;
  ingredientCategory: IngredientCategory | null;
  // 用户选中的食材（用于精确筛选）
  selectedIngredients: { name: string; category: IngredientCategory | null }[];
  createdAt: number;
}

export interface SortOptions {
  ingredientCategory: IngredientCategory | null;
  ingredientSubCategory: string | null; // 二级分类筛选
  alphabet: 'asc' | 'desc' | null;
  uploadTime: 'asc' | 'desc' | null;
  cookingMethod: CookingMethod | null;
}

interface RecipeStore {
  recipes: Recipe[];
  searchQuery: string;
  selectedCategory: CookingMethod | '全部';
  sortOptions: SortOptions;
  isModalOpen: boolean;
  editingRecipeId: string | null;
  customCookingMethods: string[];
  customIngredientCategories: string[];
  customIngredientSubCategories: string[]; // 自定义二级分类

  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  updateRecipe: (id: string, updates: Partial<Omit<Recipe, 'id' | 'createdAt'>>) => void;
  deleteRecipe: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: CookingMethod | '全部') => void;
  setSortOptions: (options: Partial<SortOptions>) => void;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  getFilteredRecipes: () => Recipe[];
  getRecipeById: (id: string) => Recipe | undefined;
  addCustomCookingMethod: (method: string) => void;
  addCustomIngredientCategory: (category: string) => void;
  removeCustomIngredientCategory: (category: string) => void;
  addCustomIngredientSubCategory: (subCategory: string) => void;
  getAllIngredientSubCategories: (parentCategory: IngredientCategory | null) => string[];
}

// 获取所有可用的制作方式（默认 + 自定义）
export function getAllCookingMethods(customMethods: string[] = []): CookingMethod[] {
  return [...COOKING_METHODS, ...customMethods.filter(m => !COOKING_METHODS.includes(m as CookingMethod)) as CookingMethod[]];
}

// 获取所有可用的食材分类（默认 + 自定义）
export function getAllIngredientCategories(customCategories: string[] = []): IngredientCategory[] {
  return [...INGREDIENT_CATEGORIES, ...customCategories.filter(c => !INGREDIENT_CATEGORIES.includes(c as IngredientCategory)) as IngredientCategory[]];
}

// 一级分类（固定）
export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  '青菜类', '根茎类', '瓜果类', '豆制品', '肉类', '海鲜', '主食', '蛋奶'
];

// 二级分类（默认 + 用户自定义）
export const DEFAULT_INGREDIENT_SUB_CATEGORIES: Record<IngredientCategory, string[]> = {
  '青菜类': ['白菜', '菠菜', '生菜', '油麦菜', '菜心', '小白菜', '茼蒿', '空心菜', '西兰花', '甘蓝', '韭菜', '芹菜', '香菜', '荠菜', '苋菜', '莴笋', '娃娃菜'],
  '根茎类': ['土豆', '红薯', '山药', '芋头', '莲藕', '胡萝卜', '白萝卜', '红萝卜', '牛蒡', '甜菜', '芥菜', '菱角', '荸荠', '生姜', '蒜', '洋葱'],
  '瓜果类': ['南瓜', '冬瓜', '西瓜', '黄瓜', '苦瓜', '丝瓜', '茄子', '番茄', '辣椒', '青椒', '彩椒', '玉米', '黄瓜', '西葫芦', '佛手瓜'],
  '豆制品': ['豆腐', '干豆腐', '豆皮', '豆干', '豆浆', '腐竹', '豆芽', '毛豆', '黄豆', '黑豆', '豆腐皮', '素鸡', '油豆腐', '豆泡', '纳豆'],
  '肉类': ['猪肉', '牛肉', '羊肉', '鸡肉', '鸭肉', '鹅肉', '排骨', '五花肉', '里脊', '腱子肉', '肥牛', '羊肉卷', '鸡翅', '鸡腿', '鸡胸', '鸡爪'],
  '海鲜': ['鱼', '鲈鱼', '鲫鱼', '草鱼', '鲤鱼', '鳊鱼', '黄鱼', '带鱼', '虾', '虾仁', '蟹', '蟹棒', '贝', '蛤蜊', '牡蛎', '章鱼', '鱿鱼', '海参', '海带', '紫菜'],
  '主食': ['米饭', '面条', '馒头', '饺子', '包子', '面包', '蛋糕', '饼干', '粥', '包子皮', '饺子皮', '馄饨', '烧麦', '春卷', '煎饼', '油条'],
  '蛋奶': ['鸡蛋', '鸭蛋', '鹌鹑蛋', '鹅蛋', '皮蛋', '牛奶', '酸奶', '奶酪', '黄油', '奶油', '芝士', '炼乳']
};

export const COOKING_METHODS: CookingMethod[] = [
  '炒', '煎', '炸', '蒸', '煮', '炖',
  '焯', '烫', '烤', '微波', '高压',
  '凉拌', '红烧', '焖', '烩', '煲', '酱料', '饮品', '甜品'
];

export const COOKING_METHOD_ICONS: Record<CookingMethod, string> = {
  '炒': '🔥', '煎': '🍳', '炸': '🍤', '蒸': '♨️', '煮': '🍲', '炖': '🥘',
  '焯': '💧', '烫': '🌊', '烤': '🎄', '微波': '📡', '高压': '⚡',
  '凉拌': '🥗', '红烧': '🍖', '焖': '🍚', '烩': '🍱', '煲': '🍵',
  '酱料': '🥫', '饮品': '🧃', '甜品': '🍰',
};

export const COOKING_METHOD_COLORS: Record<CookingMethod, string> = {
  '炒': 'bg-orange-100 text-orange-700', '煎': 'bg-yellow-100 text-yellow-700',
  '炸': 'bg-red-100 text-red-700', '蒸': 'bg-blue-100 text-blue-700',
  '煮': 'bg-cyan-100 text-cyan-700', '炖': 'bg-purple-100 text-purple-700',
  '焯': 'bg-teal-100 text-teal-700', '烫': 'bg-sky-100 text-sky-700',
  '烤': 'bg-amber-100 text-amber-700', '微波': 'bg-gray-100 text-gray-700',
  '高压': 'bg-rose-100 text-rose-700', '凉拌': 'bg-green-100 text-green-700',
  '红烧': 'bg-amber-100 text-amber-800', '焖': 'bg-orange-100 text-orange-800',
  '烩': 'bg-emerald-100 text-emerald-700', '煲': 'bg-yellow-100 text-yellow-800',
  '酱料': 'bg-pink-100 text-pink-700', '饮品': 'bg-violet-100 text-violet-700',
  '甜品': 'bg-fuchsia-100 text-fuchsia-700',
};

export const INGREDIENT_CATEGORY_COLORS: Record<IngredientCategory, string> = {
  '青菜类': 'bg-green-100 text-green-700',
  '根茎类': 'bg-amber-100 text-amber-700',
  '瓜果类': 'bg-orange-100 text-orange-700',
  '豆制品': 'bg-yellow-100 text-yellow-700',
  '肉类': 'bg-red-100 text-red-700',
  '海鲜': 'bg-blue-100 text-blue-700',
  '主食': 'bg-amber-100 text-amber-800',
  '蛋奶': 'bg-sky-100 text-sky-700',
};

// ============================================
// 新型卡路里计算系统
// ============================================

// 食材影响等级
export type IngredientImpact = 'high' | 'medium' | 'low' | 'minimal';

// 食材热量数据（每100g的热量）
export const CALORIES_DATA: Record<string, { calories: number; impact: IngredientImpact }> = {
  // 高热量食材
  '油': { calories: 900, impact: 'high' },
  '食用油': { calories: 900, impact: 'high' },
  '植物油': { calories: 900, impact: 'high' },
  '猪油': { calories: 900, impact: 'high' },
  '黄油': { calories: 800, impact: 'high' },
  '橄榄油': { calories: 884, impact: 'high' },
  '糖': { calories: 400, impact: 'high' },
  '白砂糖': { calories: 400, impact: 'high' },
  '冰糖': { calories: 400, impact: 'high' },
  '红糖': { calories: 380, impact: 'high' },
  '蜂蜜': { calories: 320, impact: 'high' },
  '花生酱': { calories: 590, impact: 'high' },
  '芝麻酱': { calories: 610, impact: 'high' },
  '沙拉酱': { calories: 440, impact: 'high' },
  '蛋黄酱': { calories: 680, impact: 'high' },
  '米饭': { calories: 116, impact: 'high' },
  '面条': { calories: 284, impact: 'high' },
  '馒头': { calories: 220, impact: 'high' },
  '面包': { calories: 280, impact: 'high' },
  '面粉': { calories: 344, impact: 'high' },
  // 肉类
  '猪肉': { calories: 395, impact: 'high' },
  '五花肉': { calories: 395, impact: 'high' },
  '肥肉': { calories: 807, impact: 'high' },
  '排骨': { calories: 278, impact: 'high' },
  '肥牛': { calories: 290, impact: 'high' },
  '牛肉': { calories: 125, impact: 'high' },
  '羊肉': { calories: 143, impact: 'high' },
  '鸡肉': { calories: 167, impact: 'high' },
  '鸭肉': { calories: 240, impact: 'high' },
  '腊肉': { calories: 350, impact: 'high' },
  '火腿': { calories: 270, impact: 'high' },
  '香肠': { calories: 290, impact: 'high' },
  '培根': { calories: 350, impact: 'high' },
  // 奶制品
  '牛奶': { calories: 54, impact: 'high' },
  '奶酪': { calories: 350, impact: 'high' },
  '奶油': { calories: 720, impact: 'high' },
  // 中等热量
  '豆腐': { calories: 81, impact: 'medium' },
  '北豆腐': { calories: 101, impact: 'medium' },
  '南豆腐': { calories: 50, impact: 'medium' },
  '干豆腐': { calories: 150, impact: 'medium' },
  '豆皮': { calories: 302, impact: 'medium' },
  '豆干': { calories: 140, impact: 'medium' },
  '鸡蛋': { calories: 144, impact: 'medium' },
  '鸭蛋': { calories: 180, impact: 'medium' },
  '鹌鹑蛋': { calories: 160, impact: 'medium' },
  '生抽': { calories: 20, impact: 'medium' },
  '老抽': { calories: 20, impact: 'medium' },
  '酱油': { calories: 20, impact: 'medium' },
  '蚝油': { calories: 20, impact: 'medium' },
  '豆瓣酱': { calories: 60, impact: 'medium' },
  '番茄酱': { calories: 80, impact: 'medium' },
  '辣椒酱': { calories: 40, impact: 'medium' },
  '料酒': { calories: 10, impact: 'medium' },
  '淀粉': { calories: 330, impact: 'medium' },
  '生粉': { calories: 330, impact: 'medium' },
  // 鱼类
  '鱼': { calories: 90, impact: 'medium' },
  '鲈鱼': { calories: 99, impact: 'medium' },
  '鲫鱼': { calories: 108, impact: 'medium' },
  '草鱼': { calories: 113, impact: 'medium' },
  '虾': { calories: 85, impact: 'medium' },
  '虾仁': { calories: 48, impact: 'medium' },
  '蟹': { calories: 97, impact: 'medium' },
  // 低热量
  '胡萝卜': { calories: 35, impact: 'low' },
  '红萝卜': { calories: 35, impact: 'low' },
  '白萝卜': { calories: 21, impact: 'low' },
  '番茄': { calories: 15, impact: 'low' },
  '西红柿': { calories: 15, impact: 'low' },
  '黄瓜': { calories: 15, impact: 'low' },
  '南瓜': { calories: 22, impact: 'low' },
  '冬瓜': { calories: 12, impact: 'low' },
  '茄子': { calories: 21, impact: 'low' },
  '土豆': { calories: 76, impact: 'low' },
  '红薯': { calories: 99, impact: 'low' },
  '山药': { calories: 57, impact: 'low' },
  '菠菜': { calories: 24, impact: 'low' },
  '白菜': { calories: 17, impact: 'low' },
  '青菜': { calories: 14, impact: 'low' },
  '生菜': { calories: 15, impact: 'low' },
  '油菜': { calories: 23, impact: 'low' },
  '西兰花': { calories: 34, impact: 'low' },
  '菜花': { calories: 24, impact: 'low' },
  '洋葱': { calories: 40, impact: 'low' },
  '大蒜': { calories: 128, impact: 'low' },
  '大蒜头': { calories: 128, impact: 'low' },
  '蒜': { calories: 128, impact: 'low' },
  '姜': { calories: 46, impact: 'low' },
  '姜片': { calories: 46, impact: 'low' },
  '葱': { calories: 30, impact: 'low' },
  '葱花': { calories: 30, impact: 'low' },
  '香菜': { calories: 23, impact: 'low' },
  '韭菜': { calories: 29, impact: 'low' },
  '芹菜': { calories: 14, impact: 'low' },
  '辣椒': { calories: 40, impact: 'low' },
  '青椒': { calories: 22, impact: 'low' },
  '红椒': { calories: 30, impact: 'low' },
  '彩椒': { calories: 26, impact: 'low' },
  '玉米': { calories: 112, impact: 'low' },
  '木耳': { calories: 27, impact: 'low' },
  '香菇': { calories: 26, impact: 'low' },
  '蘑菇': { calories: 22, impact: 'low' },
  '海带': { calories: 16, impact: 'low' },
  '紫菜': { calories: 35, impact: 'low' },
  // 极低热量（可忽略）
  '盐': { calories: 0, impact: 'minimal' },
  '醋': { calories: 11, impact: 'minimal' },
  '米醋': { calories: 11, impact: 'minimal' },
  '鸡精': { calories: 10, impact: 'minimal' },
  '味精': { calories: 0, impact: 'minimal' },
  '胡椒粉': { calories: 5, impact: 'minimal' },
  '黑胡椒': { calories: 6, impact: 'minimal' },
  '白胡椒': { calories: 6, impact: 'minimal' },
  '五香粉': { calories: 5, impact: 'minimal' },
  '花椒': { calories: 5, impact: 'minimal' },
  '八角': { calories: 5, impact: 'minimal' },
  '桂皮': { calories: 5, impact: 'minimal' },
  '辣椒粉': { calories: 5, impact: 'minimal' },
  '百里香': { calories: 1, impact: 'minimal' },
  '柠檬汁': { calories: 22, impact: 'low' },
};

// 单位转换（转为克或毫升）
const UNIT_TO_GRAMS: Record<string, number> = {
  'g': 1, '克': 1,
  'kg': 1000, '千克': 1000,
  '斤': 500, '两': 50,
  'ml': 1, '毫升': 1,
  'l': 1000, '升': 1000,
};

// 自然单位转换（转为克）
const NATURAL_UNIT_TO_GRAMS: Record<string, number> = {
  '个': 50, '只': 50,  // 默认50g/个
  '块': 30, '瓣': 10,
  '勺': 10, '汤勺': 15, '大勺': 15,
  '茶匙': 3, '小勺': 3,
  '碗': 200, '杯': 250,
  '把': 30, '小把': 10,
  '根': 50, '条': 100,
  '颗': 80, // 土豆等
  '段': 30,
  '片': 15,
};

// 模糊量词（转为克估算）
const VAGUE_QUANTITY: Record<string, { min: number; max: number; default: number }> = {
  '少许': { min: 1, max: 5, default: 3 },
  '一点': { min: 2, max: 8, default: 5 },
  '一点点': { min: 1, max: 5, default: 3 },
  '少量': { min: 3, max: 10, default: 5 },
  '适量': { min: 5, max: 20, default: 10 },  // 适量默认中等
  '普通': { min: 10, max: 20, default: 15 }, // 用户选择"普通"时
  '较多': { min: 20, max: 40, default: 30 }, // 用户选择"较多"时
  '一小撮': { min: 1, max: 5, default: 3 },
  '半勺': { min: 3, max: 8, default: 5 },
};

// 高热量食材列表（需要特殊处理"适量"）
const HIGH_IMPACT_FOR_VAGUE: string[] = [
  '油', '食用油', '植物油', '猪油', '黄油',
  '糖', '白砂糖', '冰糖', '红糖', '蜂蜜',
  '花生酱', '芝麻酱', '沙拉酱', '蛋黄酱',
  '米饭', '面条', '馒头', '面包', '面粉',
  '肥肉', '培根',
];

// 判断食材是否需要特殊处理"适量"
export function needsVagueQuantityPrompt(ingredientName: string): boolean {
  const cleanName = ingredientName.replace(/[的小大的中]+$/, '');
  return HIGH_IMPACT_FOR_VAGUE.some(high =>
    cleanName.includes(high) || high.includes(cleanName)
  );
}

// 解析数量字符串
export function parseQuantity(input: string): { amount: number; unit: string } | null {
  const trimmed = input.trim();

  // 匹配 "数字+单位" 格式
  const match = trimmed.match(/^(\d+\.?\d*)\s*(g|克|kg|千克|ml|毫升|l|升|个|只|块|片|勺|汤勺|茶匙|小勺|碗|杯|把|根|条|瓣|斤|两)?$/);
  if (match) {
    return { amount: parseFloat(match[1]), unit: match[2] || '个' };
  }

  // 匹配 "半" 开头
  if (trimmed.startsWith('半')) {
    const rest = trimmed.slice(1);
    if (VAGUE_QUANTITY[rest] || NATURAL_UNIT_TO_GRAMS[rest]) {
      return { amount: 0.5, unit: rest };
    }
    return { amount: 0.5, unit: '个' };
  }

  return null;
}

// 解析模糊量词
export function parseVagueQuantity(input: string): { type: 'vague'; range: [number, number] } | null {
  const trimmed = input.trim();
  if (VAGUE_QUANTITY[trimmed]) {
    const info = VAGUE_QUANTITY[trimmed];
    return { type: 'vague', range: [info.min, info.max] };
  }
  return null;
}

// 获取食材热量数据
export function getIngredientData(name: string): { calories: number; impact: IngredientImpact } | null {
  // 精确匹配
  if (CALORIES_DATA[name]) {
    return CALORIES_DATA[name];
  }

  // 清理后匹配
  const cleanName = name.replace(/[的小大的中块片丝碎末]+$/, '');
  if (CALORIES_DATA[cleanName]) {
    return CALORIES_DATA[cleanName];
  }

  // 模糊匹配
  for (const [key, data] of Object.entries(CALORIES_DATA)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return data;
    }
  }

  return null;
}

// 计算单个食材的热量（返回区间）
export function calculateSingleCalories(
  name: string,
  amount: number,
  unit: string
): { min: number; max: number; isEstimate: boolean } {
  const data = getIngredientData(name);

  // 无法识别的食材
  if (!data) {
    return { min: 30, max: 80, isEstimate: true }; // 默认估算
  }

  // 极低影响的食材
  if (data.impact === 'minimal') {
    return { min: data.calories * amount, max: data.calories * amount, isEstimate: false };
  }

  // 确定单位对应的克数
  let gramsPerUnit = UNIT_TO_GRAMS[unit] || NATURAL_UNIT_TO_GRAMS[unit];
  if (!gramsPerUnit) {
    gramsPerUnit = 50; // 默认
  }

  const totalGrams = amount * gramsPerUnit;
  const caloriesPer100g = data.calories;

  return {
    min: Math.round((caloriesPer100g / 100) * totalGrams * 0.9),
    max: Math.round((caloriesPer100g / 100) * totalGrams * 1.1),
    isEstimate: ['low', 'medium'].includes(data.impact),
  };
}

// 热量估算结果
export interface CalorieEstimate {
  totalMin: number;
  totalMax: number;
  reliability: 'high' | 'medium' | 'low';
  details: {
    name: string;
    min: number;
    max: number;
    unit: string;
    amount: number;
  }[];
}

// 计算整道菜热量
export function calculateRecipeCalories(
  items: { name: string; amount: number; unit: string }[]
): CalorieEstimate {
  let totalMin = 0;
  let totalMax = 0;
  let estimateCount = 0;
  const details: CalorieEstimate['details'] = [];

  for (const item of items) {
    const result = calculateSingleCalories(item.name, item.amount, item.unit);
    totalMin += result.min;
    totalMax += result.max;
    if (result.isEstimate) estimateCount++;

    details.push({
      name: item.name,
      min: result.min,
      max: result.max,
      unit: item.unit,
      amount: item.amount,
    });
  }

  // 判断可靠度
  let reliability: 'high' | 'medium' | 'low';
  if (items.length === 0) {
    reliability = 'low';
  } else {
    const estimateRatio = estimateCount / items.length;
    if (estimateRatio < 0.3) {
      reliability = 'high';
    } else if (estimateRatio < 0.6) {
      reliability = 'medium';
    } else {
      reliability = 'low';
    }
  }

  return {
    totalMin,
    totalMax,
    reliability,
    details,
  };
}

// 格式化热量显示
export function formatCalories(min: number, max: number): string {
  if (min === max) {
    return `≈ ${min} kcal`;
  }
  return `≈ ${min}–${max} kcal`;
}

// 计算每份热量
export function calculatePerServing(
  totalMin: number,
  totalMax: number,
  servings: number
): { min: number; max: number } {
  if (servings <= 0) servings = 1;
  return {
    min: Math.round(totalMin / servings),
    max: Math.round(totalMax / servings),
  };
}

// ============================================
// 智能卡路里计算系统（根据用户需求重新设计）
// ============================================

// 判断是否为模糊量词
const VAGUE_UNITS = ['适量', '少许', '一点', '一点点', '少量', '随意', '若干', '一些', '几滴', '适量', '按喜好'];

// 判断是否为可选食材关键词
const OPTIONAL_KEYWORDS = ['可选', '可加', '可不加', '随喜好', '随意'];

// 智能计算单个食材
export interface SmartCalorieResult {
  name: string;
  displayAmount: string; // 显示的数量
  minCal: number;
  maxCal: number;
  status: 'calculated' | 'ignored' | 'zero'; // 计算结果、已忽略、零热量
  reason?: string; // 忽略原因
}

export function smartCalculateIngredient(
  name: string,
  amount: number | string,
  unit: string
): SmartCalorieResult {
  const result: SmartCalorieResult = {
    name: cleanIngredientName(name),
    displayAmount: `${amount}${unit}`,
    minCal: 0,
    maxCal: 0,
    status: 'calculated',
  };

  // 获取食材数据
  const data = getIngredientData(result.name);

  // 处理模糊量词
  const amountStr = String(amount);
  const isVague = VAGUE_UNITS.some(v => amountStr.includes(v));
  const isOptional = OPTIONAL_KEYWORDS.some(k => name.includes(k));

  // 规则1: 极低影响食材 → 0 kcal
  if (data?.impact === 'minimal') {
    result.status = 'zero';
    result.minCal = 0;
    result.maxCal = 0;
    return result;
  }

  // 规则2: 低影响 + 模糊量词 → 忽略
  if (data?.impact === 'low' && isVague) {
    result.status = 'ignored';
    result.reason = '已忽略（低影响+模糊用量）';
    return result;
  }

  // 规则3: 可选食材 + 低/中影响 → 忽略
  if (isOptional && (!data || data.impact === 'low' || data.impact === 'medium')) {
    result.status = 'ignored';
    result.reason = '已忽略（可选食材）';
    return result;
  }

  // 规则4: 高/中影响 → 必须计算
  if (data) {
    // 确定单位对应的克数
    let gramsPerUnit = UNIT_TO_GRAMS[unit] || NATURAL_UNIT_TO_GRAMS[unit];
    if (!gramsPerUnit) {
      gramsPerUnit = 50; // 默认
    }

    // 解析数量为数字
    const amountNum = typeof amount === 'string' ? parseFloat(amount) || 1 : amount;
    const totalGrams = amountNum * gramsPerUnit;
    const caloriesPer100g = data.calories;

    result.minCal = Math.round((caloriesPer100g / 100) * totalGrams * 0.9);
    result.maxCal = Math.round((caloriesPer100g / 100) * totalGrams * 1.1);
  } else {
    // 无法识别，估算
    result.minCal = 30;
    result.maxCal = 80;
  }

  return result;
}

// 智能计算整道菜
export interface SmartCalorieEstimate {
  totalMin: number;
  totalMax: number;
  reliability: 'high' | 'medium' | 'low';
  details: SmartCalorieResult[];
  calculatedCount: number;
  ignoredCount: number;
}

export function smartCalculateRecipeCalories(
  items: { name: string; amount: number | string; unit: string }[]
): SmartCalorieEstimate {
  let totalMin = 0;
  let totalMax = 0;
  let calculatedCount = 0;
  let ignoredCount = 0;
  const details: SmartCalorieResult[] = [];

  for (const item of items) {
    const result = smartCalculateIngredient(item.name, item.amount, item.unit);
    details.push(result);

    if (result.status === 'calculated') {
      totalMin += result.minCal;
      totalMax += result.maxCal;
      calculatedCount++;
    } else if (result.status === 'ignored') {
      ignoredCount++;
    }
    // zero 不加不减
  }

  // 判断可靠度
  let reliability: 'high' | 'medium' | 'low';
  if (items.length === 0) {
    reliability = 'low';
  } else {
    const ignoredRatio = ignoredCount / items.length;
    if (ignoredRatio < 0.3) {
      reliability = 'high';
    } else if (ignoredRatio < 0.6) {
      reliability = 'medium';
    } else {
      reliability = 'low';
    }
  }

  return {
    totalMin,
    totalMax,
    reliability,
    details,
    calculatedCount,
    ignoredCount,
  };
}

// 原始热量计算函数（保留兼容性）
export function calculateCalories(name: string, amount: number, unit: string): number {
  const result = calculateSingleCalories(name, amount, unit);
  return Math.round((result.min + result.max) / 2);
}

// 计算总热量（保留兼容性）
export function calculateTotalCalories(ingredients: Ingredient[], sauces: Sauce[]): number {
  const allItems = [
    ...ingredients.map(i => ({ name: i.name, amount: i.amount, unit: i.unit })),
    ...sauces.map(s => ({ name: s.name, amount: s.amount, unit: s.unit })),
  ];
  const estimate = calculateRecipeCalories(allItems);
  return Math.round((estimate.totalMin + estimate.totalMax) / 2);
}

// 从内容中解析食材
export function parseIngredientsFromContent(content: string): { ingredients: Ingredient[], sauces: Sauce[] } {
  const ingredients: Ingredient[] = [];
  const sauces: Sauce[] = [];

  const lines = content.split('\n');
  let inIngredientsSection = false;
  let inSauceSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.match(/^[食材主料配料]+[：:]/)) {
      inIngredientsSection = true;
      inSauceSection = false;
      continue;
    }
    if (trimmed.match(/^[调料调味料调味汁酱料]+[：:]/)) {
      inSauceSection = true;
      inIngredientsSection = false;
      continue;
    }
    if (trimmed.startsWith('步骤') || trimmed.startsWith('做法') || trimmed.startsWith('制作')) {
      inIngredientsSection = false;
      inSauceSection = false;
      continue;
    }

    if (inIngredientsSection && (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+[.、]/.test(trimmed))) {
      const text = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+[.、]\s*/, '');
      const match = text.match(/^(.+?)\s+(\d+)(个|克|g|斤|两|勺|杯|块|条|份)?/);
      if (match) {
        const name = match[1].trim();
        const amount = parseFloat(match[2]);
        const unit = match[3] || '份';
        const data = getIngredientData(name);
        const caloriesPerUnit = data?.calories || 50;
        ingredients.push({ name, calories: caloriesPerUnit, unit, amount });
      }
    }

    if (inSauceSection && (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+[.、]/.test(trimmed))) {
      const text = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+[.、]\s*/, '');
      const match = text.match(/^(.+?)\s+(\d+)(个|克|g|勺|杯|ml|毫升|份)?/);
      if (match) {
        const name = match[1].trim();
        const amount = parseFloat(match[2]);
        const unit = match[3] || '勺';
        const data = getIngredientData(name);
        const caloriesPerUnit = data?.calories || 10;
        sauces.push({ name, calories: caloriesPerUnit, unit, amount });
      }
    }
  }

  return { ingredients, sauces };
}

// 从食材名称中检测一级分类
export function detectIngredientCategory(ingredientName: string): IngredientCategory | null {
  const searchText = ingredientName;

  for (const [category, subCategories] of Object.entries(DEFAULT_INGREDIENT_SUB_CATEGORIES)) {
    for (const subCategory of subCategories) {
      if (searchText.includes(subCategory) || subCategory.includes(searchText)) {
        return category as IngredientCategory;
      }
    }
  }
  return null;
}

// 从食材列表中检测二级分类
export function detectIngredientSubCategory(ingredientName: string, parentCategory: IngredientCategory): string | null {
  const subCategories = DEFAULT_INGREDIENT_SUB_CATEGORIES[parentCategory] || [];

  for (const subCategory of subCategories) {
    if (ingredientName.includes(subCategory) || subCategory.includes(ingredientName) ||
        ingredientName.length >= 2 && subCategory.includes(ingredientName.substring(0, 2))) {
      return subCategory;
    }
  }
  return null;
}

// 烹饪动作词列表（用于从食材名中去除）
const COOKING_VERBS = [
  '炖', '煮', '炒', '煎', '炸', '蒸', '烤', '焯', '烫', '焖', '烩', '煲',
  '红烧', '凉拌', '卤', '熏', '腌', '泡', '酿', '醉', '风干', '腊', '酱'
];

// 去除食材名称中的动作词前缀
export function cleanIngredientName(name: string): string {
  let cleaned = name.trim();

  // 去除烹饪动作词前缀
  for (const verb of COOKING_VERBS) {
    if (cleaned.startsWith(verb)) {
      cleaned = cleaned.slice(verb.length);
      break;
    }
  }

  return cleaned.trim();
}

// 从菜谱内容中自动提取所有食材名称（支持更多格式）
export function extractAllIngredientsFromContent(content: string): string[] {
  const ingredientNames: string[] = [];
  const lines = content.split('\n');
  let inIngredientsSection = false;
  let braceCount = 0; // 用于跟踪标题后的数量

  for (const line of lines) {
    const trimmed = line.trim();

    // 跳过调料部分
    if (trimmed.match(/^[调料调味料调味汁酱料腌.+]+[：:]/)) {
      inIngredientsSection = false;
      continue;
    }
    // 跳过做法部分
    if (trimmed.startsWith('步骤') || trimmed.startsWith('做法') || trimmed.startsWith('制作') || trimmed === '做法') {
      inIngredientsSection = false;
      continue;
    }

    // 检测食材区域开始（包括用户示例中的无标题列表格式）
    // 格式1: 有标题的，如 "食材："、"主料："、"材料："
    if (trimmed.match(/^[食材主料配料材料锅底菜底肉.牛肉海鲜]+[：:：]?$/)) {
      inIngredientsSection = true;
      braceCount = 0;
      continue;
    }

    // 格式2: 无标题的列表（直接以 - 开头且不在做法区域）
    // 如果还没有进入做法部分，且内容看起来像食材列表
    if (!inIngredientsSection && !trimmed.startsWith('步骤') && !trimmed.startsWith('做法') && !trimmed.startsWith('制作')) {
      // 检查是否是食材格式：- 食材名 或 1. 食材名
      if ((trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+[.、]/.test(trimmed)) && !trimmed.match(/^[步骤做法制作]+/)) {
        inIngredientsSection = true;
        braceCount = 0;
      }
    }

    // 如果在食材区域
    if (inIngredientsSection) {
      // 检测是否到了调料或做法部分
      if (trimmed.match(/^[调料调味汁酱料.+汁]+[：:]/)) {
        inIngredientsSection = false;
        continue;
      }
      if (trimmed.startsWith('步骤') || trimmed.startsWith('做法') || trimmed.startsWith('制作') || trimmed === '做法') {
        inIngredientsSection = false;
        continue;
      }

      // 提取食材名称
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+[.、]/.test(trimmed)) {
        let text = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+[.、]\s*/, '');

        // 移除数量和单位，保留食材名
        const match = text.match(/^(.+?)\s+(\d+)(个|克|g|斤|两|勺|杯|块|条|份|分钟|ml|毫升|喜欢|少许|适量)?/);
        if (match) {
          text = match[1].trim();
        }

        // 移除括号后的内容（如 "盐（少许）" -> "盐"）
        text = text.replace(/[（(].*[)）]/, '').trim();

        // 去除动作词前缀，只保留有效食材名
        const cleanedText = cleanIngredientName(text);

        // 过滤掉非食材项
        if (cleanedText && !['喜欢什么放什么'].includes(cleanedText)) {
          if (!ingredientNames.includes(cleanedText)) {
            ingredientNames.push(cleanedText);
          }
        }

        braceCount++;
        // 如果连续超过10行都不是列表格式，可能已经离开食材区域
        if (braceCount > 10 && !trimmed.startsWith('-') && !trimmed.startsWith('•') && !/^\d+[.、]/.test(trimmed)) {
          inIngredientsSection = false;
        }
      } else if (trimmed && !trimmed.match(/^[步骤做法制作]+/)) {
        // 非空行且不在列表中，计数
        braceCount++;
      }
    }
  }

  return ingredientNames;
}

// 获取所有二级分类（一级分类对应的 + 自定义）
export function getAllSubCategoriesForCategory(
  parentCategory: IngredientCategory | null,
  customSubCategories: string[]
): string[] {
  if (!parentCategory) return [];

  const defaultSubs = DEFAULT_INGREDIENT_SUB_CATEGORIES[parentCategory] || [];
  const allSubs = [...new Set([...defaultSubs, ...customSubCategories])];
  return allSubs;
}

export const SAMPLE_RECIPES: Omit<Recipe, 'id' | 'createdAt'>[] = [
  {
    title: '番茄炒蛋',
    content: `食材：
- 番茄 2个
- 鸡蛋 3个
- 葱花 适量

调料：
- 盐 适量
- 食用油 1勺

步骤：
1. 番茄洗净切块，鸡蛋打散加少许盐搅匀
2. 热锅凉油，倒入蛋液炒至凝固盛出
3. 锅中留底油，放入番茄块翻炒出汁
4. 加入炒好的鸡蛋，调入盐翻炒均匀
5. 撒上葱花即可出锅`,
    ingredients: [
      { name: '番茄', calories: 15, unit: '个', amount: 2 },
      { name: '鸡蛋', calories: 144, unit: '个', amount: 3 },
    ],
    sauces: [
      { name: '食用油', calories: 40, unit: '勺', amount: 1 },
      { name: '盐', calories: 0, unit: '适量', amount: 1 },
    ],
    totalCalories: 492,
    totalCaloriesMin: 440,
    totalCaloriesMax: 550,
    servings: 2,
    cookingMethod: '炒',
    ingredientCategory: '瓜果类',
    selectedIngredients: [
      { name: '番茄', category: '瓜果类' },
      { name: '鸡蛋', category: '蛋奶' },
    ],
  },
  {
    title: '清蒸鲈鱼',
    content: `食材：
- 鲈鱼 1条
- 姜丝 15g
- 葱丝 10g

调料：
- 蒸鱼豉油 2勺
- 料酒 1勺
- 食用油 1勺

步骤：
1. 鲈鱼去鳞、去内脏，洗净后在鱼身两面划几刀
2. 鱼身抹上料酒和盐，腌制10分钟
3. 盘底铺上葱段和姜片，放上鲈鱼
4. 蒸锅水开后放入鱼，大火蒸8-10分钟
5. 出锅后撒上葱丝姜丝，淋上热油和蒸鱼豉油即可`,
    ingredients: [
      { name: '鲈鱼', calories: 99, unit: '条', amount: 1 },
      { name: '葱', calories: 10, unit: 'g', amount: 25 },
    ],
    sauces: [
      { name: '蒸鱼豉油', calories: 10, unit: '勺', amount: 2 },
      { name: '料酒', calories: 5, unit: '勺', amount: 1 },
      { name: '食用油', calories: 40, unit: '勺', amount: 1 },
    ],
    totalCalories: 154,
    totalCaloriesMin: 140,
    totalCaloriesMax: 180,
    servings: 2,
    cookingMethod: '蒸',
    ingredientCategory: '海鲜',
    selectedIngredients: [
      { name: '鲈鱼', category: '海鲜' },
    ],
  },
  {
    title: '红烧肉',
    content: `食材：
- 五花肉 500g
- 冰糖 30g

调料：
- 生抽 2勺
- 老抽 1勺
- 料酒 2勺
- 八角 2个
- 桂皮 1小块
- 姜片 10g
- 葱段 10g

步骤：
1. 五花肉切块，冷水下锅焯水去血沫，捞出备用
2. 热锅不放油，小火放入五花肉煎出油脂
3. 加入冰糖炒至糖色，倒入肉块翻炒上色
4. 加入生抽、老抽、料酒、八角、桂皮、姜片
5. 倒入开水没过肉块，大火烧开转小火炖40分钟
6. 大火收汁，汤汁浓稠即可出锅`,
    ingredients: [
      { name: '五花肉', calories: 395, unit: 'g', amount: 5 },
      { name: '冰糖', calories: 100, unit: 'g', amount: 0.3 },
    ],
    sauces: [
      { name: '生抽', calories: 10, unit: '勺', amount: 2 },
      { name: '老抽', calories: 5, unit: '勺', amount: 1 },
      { name: '料酒', calories: 5, unit: '勺', amount: 2 },
    ],
    totalCalories: 2030,
    totalCaloriesMin: 1900,
    totalCaloriesMax: 2200,
    servings: 4,
    cookingMethod: '红烧',
    ingredientCategory: '肉类',
    selectedIngredients: [
      { name: '五花肉', category: '肉类' },
    ],
  },
  {
    title: '麻婆豆腐',
    content: `食材：
- 豆腐 1块
- 肉末 100g
- 豆瓣酱 1勺

调料：
- 花椒 适量
- 蒜末 适量
- 生抽 1勺

步骤：
1. 豆腐切块焯水备用
2. 热锅下油，炒香肉末
3. 加入豆瓣酱和花椒
4. 加入豆腐翻炒均匀
5. 调味出锅`,
    ingredients: [
      { name: '豆腐', calories: 81, unit: '块', amount: 1 },
      { name: '肉末', calories: 200, unit: 'g', amount: 1 },
    ],
    sauces: [
      { name: '豆瓣酱', calories: 15, unit: '勺', amount: 1 },
      { name: '生抽', calories: 10, unit: '勺', amount: 1 },
    ],
    totalCalories: 306,
    totalCaloriesMin: 280,
    totalCaloriesMax: 350,
    servings: 2,
    cookingMethod: '炒',
    ingredientCategory: '豆制品',
    selectedIngredients: [
      { name: '豆腐', category: '豆制品' },
      { name: '肉末', category: '肉类' },
    ],
  },
];

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      recipes: SAMPLE_RECIPES.map((r, i) => ({
        ...r,
        id: `sample-${i}`,
        createdAt: Date.now() - i * 86400000,
      })),
      searchQuery: '',
      selectedCategory: '全部',
      sortOptions: {
        ingredientCategory: null,
        ingredientSubCategory: null,
        alphabet: null,
        uploadTime: null,
        cookingMethod: null,
      },
      isModalOpen: false,
      editingRecipeId: null,
      customCookingMethods: [],
      customIngredientCategories: [],
      customIngredientSubCategories: [],

      addRecipe: (recipeData) => {
        // 自动从内容中提取食材，添加到二级分类
        const extractedIngredients = extractAllIngredientsFromContent(recipeData.content);
        const currentCustomSubs = get().customIngredientSubCategories;

        const newSubs: string[] = [];
        extractedIngredients.forEach(ingName => {
          const parentCat = recipeData.ingredientCategory;
          if (parentCat) {
            const detectedSub = detectIngredientSubCategory(ingName, parentCat);
            if (detectedSub && !currentCustomSubs.includes(detectedSub) &&
                !DEFAULT_INGREDIENT_SUB_CATEGORIES[parentCat]?.includes(detectedSub)) {
              newSubs.push(detectedSub);
            }
          }
        });

        // 只添加未分配分类的食材到自定义二级分类
        const unrecognizedIngredients = recipeData.selectedIngredients
          .filter(ing => ing.category === null && ing.name)
          .map(ing => ing.name.trim());

        const allNewSubs = [...new Set([...newSubs, ...unrecognizedIngredients])];

        const recipe: Recipe = {
          ...recipeData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };

        set((state) => ({
          recipes: [recipe, ...state.recipes],
          customIngredientSubCategories: [...new Set([...state.customIngredientSubCategories, ...allNewSubs])]
        }));
      },

      updateRecipe: (id, updates) => {
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteRecipe: (id) => {
        set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }));
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      setSortOptions: (options) => {
        // 检查是否同时设置了一级和二级分类
        const hasBothCategoryAndSub =
          options.ingredientCategory !== undefined &&
          options.ingredientSubCategory !== undefined;

        // 如果切换一级分类且没有同时设置二级分类，清空二级分类
        if (options.ingredientCategory !== undefined &&
            options.ingredientCategory !== get().sortOptions.ingredientCategory &&
            !hasBothCategoryAndSub) {
          set((state) => ({
            sortOptions: { ...state.sortOptions, ingredientCategory: options.ingredientCategory, ingredientSubCategory: null }
          }));
        } else {
          set((state) => ({ sortOptions: { ...state.sortOptions, ...options } }));
        }
      },

      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false, editingRecipeId: null }),
      toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),

      getRecipeById: (id) => get().recipes.find((r) => r.id === id),

      getFilteredRecipes: () => {
        const { recipes, searchQuery, selectedCategory, sortOptions } = get();
        let filtered = [...recipes];

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (r) =>
              r.title.toLowerCase().includes(query) ||
              r.content.toLowerCase().includes(query)
          );
        }

        if (selectedCategory !== '全部') {
          filtered = filtered.filter((r) => r.cookingMethod === selectedCategory);
        }

        const { ingredientCategory, ingredientSubCategory, alphabet, uploadTime, cookingMethod } = sortOptions;

        // 一级分类筛选 - 检查菜谱的主分类 OR selectedIngredients 中的食材分类
        if (ingredientCategory) {
          filtered = filtered.filter((r) => {
            // 如果菜谱的主分类匹配
            if (r.ingredientCategory === ingredientCategory) return true;
            // 或者 selectedIngredients 中有食材属于该分类
            const selectedIngs = r.selectedIngredients || [];
            return selectedIngs.some(ing => ing.category === ingredientCategory);
          });
        }

        // 二级分类筛选 - 检查菜谱的用户选中食材中是否包含该二级分类
        if (ingredientSubCategory) {
          filtered = filtered.filter((r) => {
            // 使用用户选中的食材进行筛选
            const selectedIngs = r.selectedIngredients || [];

            // 检查是否有食材名称匹配（考虑模糊匹配）
            const nameMatches = selectedIngs.some(ing => {
              if (!ing.name) return false;
              return ing.name.includes(ingredientSubCategory) ||
                ingredientSubCategory.includes(ing.name) ||
                (ing.name.length >= 2 && ingredientSubCategory.includes(ing.name.substring(0, 2)));
            });

            return nameMatches;
          });
        }

        if (cookingMethod) {
          filtered = filtered.filter((r) => r.cookingMethod === cookingMethod);
        }

        if (alphabet) {
          filtered.sort((a, b) => {
            const comparison = a.title.localeCompare(b.title, 'zh-CN');
            return alphabet === 'asc' ? comparison : -comparison;
          });
        }

        if (uploadTime) {
          filtered.sort((a, b) => {
            const comparison = a.createdAt - b.createdAt;
            return uploadTime === 'asc' ? comparison : -comparison;
          });
        }

        return filtered;
      },

      addCustomCookingMethod: (method: string) => {
        const trimmed = method.trim();
        if (!trimmed) return;
        const current = get().customCookingMethods;
        const allMethods = [...COOKING_METHODS, ...current];
        if (!allMethods.includes(trimmed as CookingMethod)) {
          set({ customCookingMethods: [...current, trimmed] });
        }
      },

      addCustomIngredientCategory: (category: string) => {
        const trimmed = category.trim();
        if (!trimmed) return;
        const current = get().customIngredientCategories;
        const allCategories = [...INGREDIENT_CATEGORIES, ...current];
        if (!allCategories.includes(trimmed as IngredientCategory)) {
          set({ customIngredientCategories: [...current, trimmed] });
        }
      },

      removeCustomIngredientCategory: (category: string) => {
        set((state) => ({
          customIngredientCategories: state.customIngredientCategories.filter(c => c !== category),
        }));
      },

      addCustomIngredientSubCategory: (subCategory: string) => {
        const trimmed = subCategory.trim();
        if (!trimmed) return;
        const current = get().customIngredientSubCategories;
        if (!current.includes(trimmed)) {
          set({ customIngredientSubCategories: [...current, trimmed] });
        }
      },

      getAllIngredientSubCategories: (parentCategory: IngredientCategory | null) => {
        if (!parentCategory) return [];
        const defaults = DEFAULT_INGREDIENT_SUB_CATEGORIES[parentCategory] || [];
        const custom = get().customIngredientSubCategories;
        return [...new Set([...defaults, ...custom])];
      },
    }),
    {
      name: 'recipe-storage',
    }
  )
);
