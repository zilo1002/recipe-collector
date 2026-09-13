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

// 常见食材热量参考（每100g的热量）
export const COMMON_INGREDIENTS_CALORIES: Record<string, number> = {
  '番茄': 15, '西红柿': 15, '黄瓜': 15, '南瓜': 22, '冬瓜': 12,
  '茄子': 21, '土豆': 76, '红薯': 99, '胡萝卜': 25, '白萝卜': 21,
  '菠菜': 24, '白菜': 17, '青菜': 14, '生菜': 15, '油菜': 23,
  '西兰花': 34, '菜花': 24, '洋葱': 40, '大蒜': 128,
  '猪肉': 395, '五花肉': 395, '里脊肉': 155, '排骨': 278,
  '牛肉': 125, '牛腩': 248, '牛腱': 100,
  '鸡肉': 167, '鸡胸肉': 133, '鸡腿': 181,
  '鸡蛋': 144, '蛋白': 52, '蛋黄': 322,
  '豆腐': 81, '北豆腐': 101, '南豆腐': 50, '干豆腐': 150, '豆皮': 302, '豆干': 140,
  '鲈鱼': 99, '鲫鱼': 108, '草鱼': 113, '虾': 85, '虾仁': 48, '蟹': 97,
  '米饭': 116, '面条': 284, '面粉': 344,
  '油': 884, '食用油': 884, '植物油': 884,
  '盐': 0, '糖': 400, '冰糖': 397, '白砂糖': 400,
  '生抽': 20, '老抽': 20, '酱油': 20, '蚝油': 20,
  '料酒': 10, '醋': 11, '米醋': 11,
  '淀粉': 330, '生粉': 330,
  '葱': 30, '姜': 46, '蒜': 126, '葱花': 30, '姜片': 46,
};

// 食材标准用量（用于自动计算热量）
// 格式：{ 每单位热量, 标准单位, 标准单位量(克) }
export const INGREDIENT_STANDARD_UNITS: Record<string, { caloriesPerUnit: number; unit: string; gramsPerUnit: number }> = {
  // 蛋类（按个计算）
  '鸡蛋': { caloriesPerUnit: 72, unit: '个', gramsPerUnit: 50 },
  '鸭蛋': { caloriesPerUnit: 90, unit: '个', gramsPerUnit: 60 },
  '鹌鹑蛋': { caloriesPerUnit: 15, unit: '个', gramsPerUnit: 10 },
  // 肉类（按块/份计算）
  '豆腐': { caloriesPerUnit: 140, unit: '块', gramsPerUnit: 175 },
  '北豆腐': { caloriesPerUnit: 175, unit: '块', gramsPerUnit: 175 },
  '南豆腐': { caloriesPerUnit: 90, unit: '块', gramsPerUnit: 175 },
  '鸡胸肉': { caloriesPerUnit: 130, unit: '块', gramsPerUnit: 150 },
  '鸡腿': { caloriesPerUnit: 180, unit: '个', gramsPerUnit: 150 },
  '鸡翅': { caloriesPerUnit: 100, unit: '个', gramsPerUnit: 80 },
  // 蔬菜（按份计算）
  '番茄': { caloriesPerUnit: 30, unit: '个', gramsPerUnit: 200 },
  '西红柿': { caloriesPerUnit: 30, unit: '个', gramsPerUnit: 200 },
  '土豆': { caloriesPerUnit: 75, unit: '个', gramsPerUnit: 150 },
  '胡萝卜': { caloriesPerUnit: 30, unit: '根', gramsPerUnit: 120 },
  '黄瓜': { caloriesPerUnit: 25, unit: '根', gramsPerUnit: 200 },
  '茄子': { caloriesPerUnit: 25, unit: '个', gramsPerUnit: 150 },
  '南瓜': { caloriesPerUnit: 50, unit: '块', gramsPerUnit: 250 },
  // 调料（按勺/克计算）
  '油': { caloriesPerUnit: 45, unit: '勺', gramsPerUnit: 10 },
  '食用油': { caloriesPerUnit: 45, unit: '勺', gramsPerUnit: 10 },
  '植物油': { caloriesPerUnit: 45, unit: '勺', gramsPerUnit: 10 },
  '盐': { caloriesPerUnit: 0, unit: '克', gramsPerUnit: 1 },
  '糖': { caloriesPerUnit: 16, unit: '勺', gramsPerUnit: 10 },
  '冰糖': { caloriesPerUnit: 40, unit: '块', gramsPerUnit: 10 },
  '生抽': { caloriesPerUnit: 10, unit: '勺', gramsPerUnit: 10 },
  '老抽': { caloriesPerUnit: 10, unit: '勺', gramsPerUnit: 10 },
  '酱油': { caloriesPerUnit: 10, unit: '勺', gramsPerUnit: 10 },
  '蚝油': { caloriesPerUnit: 15, unit: '勺', gramsPerUnit: 15 },
  '料酒': { caloriesPerUnit: 10, unit: '勺', gramsPerUnit: 10 },
  '醋': { caloriesPerUnit: 3, unit: '勺', gramsPerUnit: 5 },
  '淀粉': { caloriesPerUnit: 33, unit: '勺', gramsPerUnit: 10 },
  '生粉': { caloriesPerUnit: 33, unit: '勺', gramsPerUnit: 10 },
  // 鱼类（按条/份计算）
  '鲈鱼': { caloriesPerUnit: 200, unit: '条', gramsPerUnit: 500 },
  '鲫鱼': { caloriesPerUnit: 180, unit: '条', gramsPerUnit: 300 },
  '草鱼': { caloriesPerUnit: 250, unit: '条', gramsPerUnit: 750 },
};

// 根据食材名称获取热量信息
export function getIngredientCalorieInfo(name: string): { calories: number; unit: string; amount: number } | null {
  // 精确匹配
  if (INGREDIENT_STANDARD_UNITS[name]) {
    const info = INGREDIENT_STANDARD_UNITS[name];
    return { calories: info.caloriesPerUnit, unit: info.unit, amount: 1 };
  }

  // 模糊匹配 - 去掉修饰词后匹配
  const cleanName = name.replace(/[的小大的中块片丝碎末]+$/, '');
  if (INGREDIENT_STANDARD_UNITS[cleanName]) {
    const info = INGREDIENT_STANDARD_UNITS[cleanName];
    return { calories: info.caloriesPerUnit, unit: info.unit, amount: 1 };
  }

  // 使用每100g热量表
  if (COMMON_INGREDIENTS_CALORIES[name]) {
    return { calories: COMMON_INGREDIENTS_CALORIES[name], unit: '100g', amount: 1 };
  }

  // 模糊匹配每100g热量表
  for (const [key, cal] of Object.entries(COMMON_INGREDIENTS_CALORIES)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return { calories: cal, unit: '100g', amount: 1 };
    }
  }

  return null;
}

// 根据用量计算实际热量
export function calculateCalories(name: string, amount: number, unit: string): number {
  const info = getIngredientCalorieInfo(name);
  if (!info) return 50; // 默认值

  // 如果单位匹配标准单位
  if (unit === info.unit) {
    return Math.round(info.calories * amount);
  }

  // 如果是100g单位，按比例计算
  if (info.unit === '100g') {
    return Math.round((info.calories / 100) * amount);
  }

  // 否则按标准单位换算
  const standardInfo = INGREDIENT_STANDARD_UNITS[name] || INGREDIENT_STANDARD_UNITS[cleanName(name)];
  if (standardInfo) {
    // 将用户输入的量转换为克
    const gramsPerUserUnit = getGramsPerUnit(unit, amount);
    const totalGrams = amount * gramsPerUserUnit;
    // 按比例计算热量
    return Math.round((standardInfo.caloriesPerUnit / standardInfo.gramsPerUnit) * totalGrams);
  }

  return Math.round(info.calories * amount);
}

// 辅助函数：清理食材名称
function cleanName(name: string): string {
  return name.replace(/[的小大的中块片丝碎末]+$/, '');
}

// 辅助函数：获取每单位对应的克数
function getGramsPerUnit(unit: string, amount: number): number {
  const unitMap: Record<string, number> = {
    'g': 1, '克': 1,
    'kg': 1000, '千克': 1000,
    'ml': 1, '毫升': 1,
    'l': 1000, '升': 1000,
    '勺': 10, '汤勺': 15,
    '茶匙': 3, '小勺': 3,
    '个': 50, '只': 50,
    '块': 30, '片': 20,
    '根': 100, '条': 100,
    '斤': 500, '两': 50,
  };
  return unitMap[unit] || 50;
}

// 计算总热量
export function calculateTotalCalories(ingredients: Ingredient[], sauces: Sauce[]): number {
  const ingredientsCalories = ingredients.reduce((sum, ing) => sum + (ing.calories * ing.amount), 0);
  const saucesCalories = sauces.reduce((sum, sauce) => sum + (sauce.calories * sauce.amount), 0);
  return Math.round(ingredientsCalories + saucesCalories);
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
        const caloriesPerUnit = COMMON_INGREDIENTS_CALORIES[name] || 50;
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
        const caloriesPerUnit = COMMON_INGREDIENTS_CALORIES[name] || 10;
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
