import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CookingMethod =
  | '炒' | '煎' | '炸' | '蒸' | '煮' | '炖'
  | '焯' | '烫' | '烤' | '微波' | '高压'
  | '凉拌' | '红烧' | '焖' | '烩' | '煲'
  | '酱料' | '饮品' | '甜品';

export type IngredientCategory = '青菜类' | '根茎类' | '瓜果类' | '豆制品' | '肉类' | '海鲜' | '主食' | '蛋奶';

export interface Ingredient {
  name: string;
  calories: number; // 每份的热量（大卡）
  unit: string; // 单位，如"个"、"克"、"勺"等
  amount: number; // 数量
}

export interface Sauce {
  name: string;
  calories: number; // 热量（大卡）
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
  createdAt: number;
}

export interface SortOptions {
  ingredientCategory: IngredientCategory | null;
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
}

// 获取所有可用的制作方式（默认 + 自定义）
export function getAllCookingMethods(customMethods: string[] = []): CookingMethod[] {
  return [...COOKING_METHODS, ...customMethods.filter(m => !COOKING_METHODS.includes(m as CookingMethod)) as CookingMethod[]];
}

// 获取所有可用的食材分类（默认 + 自定义）
export function getAllIngredientCategories(customCategories: string[] = []): IngredientCategory[] {
  return [...INGREDIENT_CATEGORIES, ...customCategories.filter(c => !INGREDIENT_CATEGORIES.includes(c as IngredientCategory)) as IngredientCategory[]];
}

const cookingMethodKeywords: Record<CookingMethod, string[]> = {
  '炒': ['炒', '爆炒', '快炒', '滑炒'],
  '煎': ['煎', '烙', '平底锅'],
  '炸': ['炸', '酥炸', '油炸', '干炸'],
  '蒸': ['蒸', '清蒸', '粉蒸'],
  '煮': ['煮', '水煮', '白煮'],
  '炖': ['炖', '慢炖', '砂锅炖'],
  '焯': ['焯', '焯水', '飞水'],
  '烫': ['烫', '涮', '水烫'],
  '烤': ['烤箱', '空气炸锅', '烤', '烘烤'],
  '微波': ['微波', '微波炉'],
  '高压': ['高压锅', '快锅', '压力锅', '高压'],
  '凉拌': ['凉拌', '冷拌', '沙拉', '凉'],
  '红烧': ['红烧', '酱烧'],
  '焖': ['焖', '酱焖', '黄焖'],
  '烩': ['烩', '砂锅', '煲'],
  '煲': ['煲汤', '汤煲', '煲', '炖汤'],
  '酱料': ['酱料', '调味', '调料', '酱汁', '蘸料'],
  '饮品': ['奶茶', '咖啡', '茶饮', '果汁', '饮料', '奶昔', '气泡水', '柠檬水'],
  '甜品': ['蛋糕', '冰淇淋', '布丁', '甜点', '饼干', '巧克力', '糖果', '慕斯', '泡芙'],
};

const ingredientCategoryKeywords: Record<IngredientCategory, string[]> = {
  '青菜类': ['青菜', '白菜', '菠菜', '生菜', '油麦菜', '菜心', '小白菜', '茼蒿', '空心菜'],
  '根茎类': ['萝卜', '土豆', '红薯', '山药', '芋头', '莲藕', '胡萝卜', '牛蒡', '甜菜'],
  '瓜果类': ['南瓜', '冬瓜', '西瓜', '黄瓜', '苦瓜', '丝瓜', '茄子', '番茄', '辣椒'],
  '豆制品': ['豆腐', '豆皮', '豆干', '豆浆', '腐竹', '豆芽', '毛豆', '黄豆'],
  '肉类': ['猪肉', '牛肉', '羊肉', '鸡肉', '鸭肉', '鹅肉', '排骨', '五花肉', '里脊'],
  '海鲜': ['鱼', '虾', '蟹', '贝', '蛤蜊', '牡蛎', '章鱼', '鱿鱼', '海参'],
  '主食': ['米饭', '面条', '馒头', '饺子', '包子', '面包', '蛋糕', '饼干'],
  '蛋奶': ['鸡蛋', '鸭蛋', '鹌鹑蛋', '牛奶', '酸奶', '奶酪', '黄油', '奶油'],
};

export function detectCookingMethod(content: string): CookingMethod {
  const lowerContent = content;

  for (const [method, keywords] of Object.entries(cookingMethodKeywords)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        return method as CookingMethod;
      }
    }
  }

  return '炒'; // 默认分类
}

export function detectIngredientCategory(title: string, content: string): IngredientCategory | null {
  const searchText = title + content;

  for (const [category, keywords] of Object.entries(ingredientCategoryKeywords)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        return category as IngredientCategory;
      }
    }
  }

  return null;
}

export const COOKING_METHODS: CookingMethod[] = [
  '炒', '煎', '炸', '蒸', '煮', '炖',
  '焯', '烫', '烤', '微波', '高压',
  '凉拌', '红烧', '焖', '烩', '煲', '酱料', '饮品', '甜品'
];

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  '青菜类', '根茎类', '瓜果类', '豆制品', '肉类', '海鲜', '主食', '蛋奶'
];

export const COOKING_METHOD_ICONS: Record<CookingMethod, string> = {
  '炒': '🔥',
  '煎': '🍳',
  '炸': '🍤',
  '蒸': '♨️',
  '煮': '🍲',
  '炖': '🥘',
  '焯': '💧',
  '烫': '🌊',
  '烤': '🎄',
  '微波': '📡',
  '高压': '⚡',
  '凉拌': '🥗',
  '红烧': '🍖',
  '焖': '🍚',
  '烩': '🍱',
  '煲': '🍵',
  '酱料': '🥫',
  '饮品': '🧃',
  '甜品': '🍰',
};

export const COOKING_METHOD_COLORS: Record<CookingMethod, string> = {
  '炒': 'bg-orange-100 text-orange-700',
  '煎': 'bg-yellow-100 text-yellow-700',
  '炸': 'bg-red-100 text-red-700',
  '蒸': 'bg-blue-100 text-blue-700',
  '煮': 'bg-cyan-100 text-cyan-700',
  '炖': 'bg-purple-100 text-purple-700',
  '焯': 'bg-teal-100 text-teal-700',
  '烫': 'bg-sky-100 text-sky-700',
  '烤': 'bg-amber-100 text-amber-700',
  '微波': 'bg-gray-100 text-gray-700',
  '高压': 'bg-rose-100 text-rose-700',
  '凉拌': 'bg-green-100 text-green-700',
  '红烧': 'bg-amber-100 text-amber-800',
  '焖': 'bg-orange-100 text-orange-800',
  '烩': 'bg-emerald-100 text-emerald-700',
  '煲': 'bg-yellow-100 text-yellow-800',
  '酱料': 'bg-pink-100 text-pink-700',
  '饮品': 'bg-violet-100 text-violet-700',
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

export const COOKING_METHOD_DESCRIPTIONS: Record<CookingMethod, string> = {
  '炒': '炒锅快速烹调',
  '煎': '平底锅煎制',
  '炸': '油炸烹饪',
  '蒸': '蒸汽烹调',
  '煮': '水煮方式',
  '炖': '长时间慢炖',
  '焯': '焯水处理',
  '烫': '烫煮方式',
  '烤': '烤箱/空气炸锅',
  '微波': '微波炉加热',
  '高压': '高压锅烹饪',
  '凉拌': '冷食凉拌',
  '红烧': '红烧酱汁',
  '焖': '焖煮入味',
  '烩': '烩烧混合',
  '煲': '煲汤炖煮',
  '酱料': '调味酱料制作',
  '饮品': '各类饮品制作',
  '甜品': '各类甜点制作',
};

export const INGREDIENT_CATEGORY_DESCRIPTIONS: Record<IngredientCategory, string> = {
  '青菜类': '各类绿叶蔬菜',
  '根茎类': '根茎类蔬菜',
  '瓜果类': '瓜果类蔬菜',
  '豆制品': '豆类加工食品',
  '肉类': '各类肉类食材',
  '海鲜': '海鲜水产食材',
  '主食': '米面等主食',
  '蛋奶': '蛋类奶类制品',
};

// 常见食材热量参考（大卡/100g 或 每单位）
export const COMMON_INGREDIENTS_CALORIES: Record<string, number> = {
  // 蔬菜类
  '番茄': 15, '西红柿': 15, '黄瓜': 15, '南瓜': 22, '冬瓜': 12,
  '茄子': 21, '土豆': 76, '红薯': 99, '胡萝卜': 25, '白萝卜': 21,
  '菠菜': 24, '白菜': 17, '青菜': 14, '生菜': 15, '油菜': 23,
  '西兰花': 34, '菜花': 24, '洋葱': 40, '大蒜': 128,
  // 肉类
  '猪肉': 395, '五花肉': 395, '里脊肉': 155, '排骨': 278,
  '牛肉': 125, '牛腩': 248, '牛腱': 100,
  '鸡肉': 167, '鸡胸肉': 133, '鸡腿': 181,
  // 蛋类
  '鸡蛋': 144, '蛋白': 52, '蛋黄': 322,
  // 豆制品
  '豆腐': 81, '北豆腐': 101, '南豆腐': 50,
  '豆浆': 33, '豆皮': 302, '豆干': 140,
  // 海鲜
  '鱼': 90, '鲈鱼': 99, '鲫鱼': 108, '草鱼': 113,
  '虾': 85, '虾仁': 48, '蟹': 97,
  // 主食类
  '米饭': 116, '面条': 284, '面粉': 344,
  // 调料类
  '油': 884, '食用油': 884, '植物油': 884, '橄榄油': 884,
  '盐': 0, '糖': 400, '冰糖': 397, '白砂糖': 400,
  '生抽': 20, '老抽': 20, '酱油': 20, '蚝油': 20,
  '料酒': 10, '醋': 11, '米醋': 11,
  '淀粉': 330, '生粉': 330,
  // 其他
  '葱': 30, '姜': 46, '蒜': 126, '葱花': 30, '姜片': 46,
};

// 计算总热量
export function calculateTotalCalories(ingredients: Ingredient[], sauces: Sauce[]): number {
  const ingredientsCalories = ingredients.reduce((sum, ing) => sum + (ing.calories * ing.amount), 0);
  const saucesCalories = sauces.reduce((sum, sauce) => sum + (sauce.calories * sauce.amount), 0);
  return Math.round(ingredientsCalories + saucesCalories);
}

// 从内容中解析食材和酱料
export function parseIngredientsFromContent(content: string): { ingredients: Ingredient[], sauces: Sauce[] } {
  const ingredients: Ingredient[] = [];
  const sauces: Sauce[] = [];

  const lines = content.split('\n');
  let inIngredientsSection = false;
  let inSauceSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // 检测区域
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

    // 解析食材行
    if (inIngredientsSection && (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+[.、]/.test(trimmed))) {
      const text = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+[.、]\s*/, '');
      const match = text.match(/^(.+?)\s+(\d+)(个|克|g|斤|两|勺|杯|块|条|份)?/);

      if (match) {
        const name = match[1].trim();
        const amount = parseFloat(match[2]);
        const unit = match[3] || '份';
        const caloriesPerUnit = COMMON_INGREDIENTS_CALORIES[name] || 50; // 默认50大卡

        ingredients.push({
          name,
          calories: caloriesPerUnit,
          unit,
          amount
        });
      }
    }

    // 解析酱料行
    if (inSauceSection && (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+[.、]/.test(trimmed))) {
      const text = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+[.、]\s*/, '');
      const match = text.match(/^(.+?)\s+(\d+)(个|克|g|勺|杯|ml|毫升|份)?/);

      if (match) {
        const name = match[1].trim();
        const amount = parseFloat(match[2]);
        const unit = match[3] || '勺';
        const caloriesPerUnit = COMMON_INGREDIENTS_CALORIES[name] || 10; // 默认10大卡

        sauces.push({
          name,
          calories: caloriesPerUnit,
          unit,
          amount
        });
      }
    }
  }

  return { ingredients, sauces };
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
        alphabet: null,
        uploadTime: null,
        cookingMethod: null,
      },
      isModalOpen: false,
      editingRecipeId: null,
      customCookingMethods: [],
      customIngredientCategories: [],

      addRecipe: (recipeData) => {
        const recipe: Recipe = {
          ...recipeData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        set((state) => ({ recipes: [recipe, ...state.recipes] }));
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
        set((state) => ({ sortOptions: { ...state.sortOptions, ...options } }));
      },

      openModal: () => set({ isModalOpen: true }),

      closeModal: () => set({ isModalOpen: false, editingRecipeId: null }),

      toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),

      getRecipeById: (id) => {
        return get().recipes.find((r) => r.id === id);
      },

      getFilteredRecipes: () => {
        const { recipes, searchQuery, selectedCategory, sortOptions } = get();

        let filtered = [...recipes];

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (r) =>
              r.title.toLowerCase().includes(query) ||
              r.content.toLowerCase().includes(query)
          );
        }

        // Category filter
        if (selectedCategory !== '全部') {
          filtered = filtered.filter((r) => r.cookingMethod === selectedCategory);
        }

        // Sort options (multiple can be selected)
        const sortResults: Recipe[] = [];
        const { ingredientCategory, alphabet, uploadTime, cookingMethod } = sortOptions;

        if (ingredientCategory) {
          filtered = filtered.filter((r) => r.ingredientCategory === ingredientCategory);
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
        // 检查是否已存在（默认或自定义）
        const allMethods = [...COOKING_METHODS, ...current];
        if (!allMethods.includes(trimmed as CookingMethod)) {
          set({ customCookingMethods: [...current, trimmed] });
        }
      },

      addCustomIngredientCategory: (category: string) => {
        const trimmed = category.trim();
        if (!trimmed) return;
        const current = get().customIngredientCategories;
        // 检查是否已存在（默认或自定义）
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
    }),
    {
      name: 'recipe-storage',
    }
  )
);