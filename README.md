---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022100f9ff4e8896a792c3e2357a48cf3f1d36b163b8f98b02b4e8159e86635d9220670220294ec6248e9dedfd9a1cbf6199427029c1accec7bb63aefc8505d83dc4c133ec
    ReservedCode2: 304502204d73957c53dbd660c20aaf66912463b83459e5d4b70e43a9b9e851ac453b54c6022100b35d8eef927c29854c4188e75bd9ed78bb7480ef3f081b33862170627e687607
---

# 食谱收藏

> 轻量级菜谱管理工具，支持自动分类、卡路里计算、数据导入导出。

![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white)

---

## 1. 功能亮点

- 📂 **自动分类**：根据菜谱内容自动识别 19 种制作方式（炒、煎、炸、蒸、煮、炖、焯、烫、烤、微波、高压、凉拌、红烧、焖、烩、煲、酱料、饮品、甜品）
- 🔍 **智能搜索**：支持按标题和内容关键词搜索
- 🔢 **卡路里计算**：自动解析食材和酱料，实时计算总热量，支持移动端自适应输入
- 🌳 **二级分类筛选**：支持 8 大食材类目（青菜类、根茎类、瓜果类、豆制品、肉类、海鲜、主食、蛋奶），每个类目下包含多个细分食材，点击展开手风琴查看
- 🔄 **多维筛选排序**：支持按食材分类、制作方式、上传时间、首字母排序，采用手风琴交互方式，可多选组合
- 💾 **数据导出/导入**：支持 JSON、HTML、Markdown 三种格式导出，JSON 格式导入备份
- 📱 **响应式设计**：适配桌面端和移动端，热量计算输入框自适应屏幕宽度

---

## 2. 食材分类体系

### 一级分类（8类）

| 分类 | 说明 |
|------|------|
| 青菜类 | 白菜、菠菜、生菜、油麦菜、西兰花等 |
| 根茎类 | 土豆、红薯、山药、胡萝卜、白萝卜、生姜等 |
| 瓜果类 | 南瓜、冬瓜、黄瓜、茄子、番茄、玉米等 |
| 豆制品 | 豆腐、干豆腐、豆皮、豆干、豆浆、腐竹等 |
| 肉类 | 猪肉、牛肉、羊肉、鸡肉、鸭肉、排骨等 |
| 海鲜 | 鱼、虾、蟹、贝类、海带、紫菜等 |
| 主食 | 米饭、面条、馒头、饺子、包子、面包等 |
| 蛋奶 | 鸡蛋、鸭蛋、鹌鹑蛋、牛奶、酸奶、奶酪等 |

> 新上传菜谱中的食材会自动添加到二级分类列表中供筛选使用

---

## 3. 支持格式一览

| 格式 | 读取 | 写入 | 备注 |
|------|:--:|:--:|------|
| `.json` | ✅ | ✅ | 完整数据备份，包含所有菜谱信息 |
| `.html` | ❌ | ✅ | 可直接在浏览器打开的菜谱文档 |
| `.md` | ❌ | ✅ | Markdown 格式，适合笔记软件使用 |

---

## 4. 隐私与安全

- 所有数据存储在浏览器本地（localStorage），不上传至任何第三方服务器
- 不收集用户行为数据、不追踪、无广告
- 菜谱数据仅存在于用户本地，换设备或清缓存后可通过导入备份恢复

---

## 5. 项目结构

```
recipe-collector/
├── src/
│   ├── components/
│   │   ├── CategoryTabs.tsx      # 分类标签栏
│   │   ├── ErrorBoundary.tsx      # 错误边界
│   │   ├── FilterSection.tsx      # 筛选排序区域（手风琴交互）
│   │   ├── Header.tsx             # 顶部导航栏
│   │   ├── RecipeCard.tsx         # 菜谱卡片组件
│   │   ├── RecipeDetailModal.tsx # 菜谱详情弹窗
│   │   ├── RecipeGrid.tsx         # 菜谱网格布局
│   │   └── UploadModal.tsx       # 上传菜谱弹窗（含热量计算）
│   ├── hooks/
│   │   └── use-mobile.tsx         # 移动端检测 Hook
│   ├── lib/
│   │   └── utils.ts               # 工具函数
│   ├── store/
│   │   └── recipeStore.ts         # Zustand 状态管理（含二级分类数据）
│   ├── utils/
│   │   └── exportUtils.ts         # 导出导入工具
│   ├── App.css                    # 应用样式
│   ├── App.tsx                    # 应用主组件
│   ├── index.css                  # 全局样式
│   └── main.tsx                   # 入口文件
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions 部署配置
├── index.html                     # 主页面
├── package.json                   # 依赖配置
├── vite.config.ts                 # Vite 配置
├── tsconfig.json                  # TypeScript 配置
├── SPEC.md                        # 项目规格说明
└── README.md                      # 项目说明文档
```

---

## 6. 技术栈

- **构建工具**：Vite 6
- **前端框架**：React 18 + TypeScript
- **样式方案**：Tailwind CSS
- **状态管理**：Zustand + persist
- **图标库**：Lucide React
- **部署**：云端部署

---

## 7. 使用提示

1. **数据存储在本地**：菜谱数据保存在浏览器 localStorage，换设备或清缓存后需重新导入备份
2. **建议定期备份**：重要菜谱可通过「更多 → 导出 JSON 备份」保存
3. **食材二级分类**：上传菜谱后，系统会自动提取食材名称添加到二级分类供筛选
4. **手风琴交互**：筛选排序区域采用手风琴展开/折叠设计，点击即可展开查看选项
5. **浏览器缓存**：更新后如界面无变化，请尝试强制刷新（`Ctrl + Shift + R`）

---

## 8. 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

---

## License

[MIT](LICENSE) © MiniMax Agent
