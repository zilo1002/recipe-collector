---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 30440220253bc896b8d91894dd5a706047ec657f826c081f1658c126360dafcdf302aa3b022032401a3f74ba3df801d23d9bc1f6f61c782d127c3349d263572b3e55ec4e73a6
    ReservedCode2: 3044022010ccb9b01962d06228f1ff0e7acd9569ee09b9ec87c9c403dafaa2132f493dbe022056e8dffada808c51b307afcfdc53182591c2a81f3ea608d41ce45e5570315638
---

# 食谱收藏

> 轻量级菜谱管理工具，支持自动分类、卡路里计算、数据导入导出。

![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white)

---

## 1. 功能亮点

- 📂 **自动分类**：根据菜谱内容自动识别 17 种制作方式（炒、煎、炸、蒸、煮、炖、焯、烫、烤、微波、高压、凉拌、红烧、焖、烩、煲、酱料）
- 🔍 **智能搜索**：支持按标题和内容关键词搜索
- 🔢 **卡路里计算**：自动解析食材和酱料，实时计算总热量
- 📊 **多维排序**：支持按蔬菜分类、制作方式、上传时间、首字母排序，可多选组合
- 💾 **数据导出/导入**：支持 JSON、HTML、Markdown 三种格式导出，JSON 格式导入备份
- 📱 **响应式设计**：适配桌面端和移动端

---

## 2. 支持格式一览

| 格式 | 读取 | 写入 | 备注 |
|------|:--:|:--:|------|
| `.json` | ✅ | ✅ | 完整数据备份，包含所有菜谱信息 |
| `.html` | ❌ | ✅ | 可直接在浏览器打开的菜谱文档 |
| `.md` | ❌ | ✅ | Markdown 格式，适合笔记软件使用 |

---

## 3. 隐私与安全

- 所有数据存储在浏览器本地（localStorage），不上传至任何第三方服务器
- 不收集用户行为数据、不追踪、无广告
- 菜谱数据仅存在于用户本地，换设备或清缓存后可通过导入备份恢复

---

## 4. 项目结构

```
recipe-collector/
├── src/
│   ├── components/
│   │   ├── CategoryTabs.tsx      # 分类标签栏
│   │   ├── ErrorBoundary.tsx      # 错误边界
│   │   ├── FilterSection.tsx      # 筛选排序区域
│   │   ├── Header.tsx             # 顶部导航栏
│   │   ├── RecipeCard.tsx         # 菜谱卡片组件
│   │   ├── RecipeDetailModal.tsx # 菜谱详情弹窗
│   │   ├── RecipeGrid.tsx         # 菜谱网格布局
│   │   └── UploadModal.tsx       # 上传菜谱弹窗
│   ├── hooks/
│   │   └── use-mobile.tsx         # 移动端检测 Hook
│   ├── lib/
│   │   └── utils.ts               # 工具函数
│   ├── store/
│   │   └── recipeStore.ts         # Zustand 状态管理
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

## 5. 技术栈

- **构建工具**：Vite 6
- **前端框架**：React 18 + TypeScript
- **样式方案**：Tailwind CSS
- **状态管理**：Zustand + persist
- **图标库**：Lucide React
- **部署**：GitHub Pages

---

## 6. 使用提示

1. **数据存储在本地**：菜谱数据保存在浏览器 localStorage，换设备或清缓存后需重新导入备份
2. **建议定期备份**：重要菜谱可通过「更多 → 导出 JSON 备份」保存
3. **浏览器缓存**：更新后如界面无变化，请尝试强制刷新（`Ctrl + Shift + R`）
4. **GitHub Pages 部署**：部署在子路径 `/recipe-collector/`，需配置 Vite base 为该路径

---

## 7. 快速开始

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
