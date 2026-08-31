---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 304402205068ae16cbf02484db756aa259976aa2bcc23b7cc7bf2b9e1c2a610a402d0abc0220692493910fb63876e62428caf1cc517fe149dc3541334acfcbead35ef0931b13
    ReservedCode2: 3046022100e15ebdfeda7dea601c3ea55d4e4d98cbdc6d8eb6635d651d72fbefd0c96e37ba022100f2f5a607c08743ccc8c7c1d7031468184cd1acc9cf937711a28b5e9b82537670
---

# 菜谱收集网站 - Recipe Vault

## 1. Concept & Vision

一个现代化的菜谱收集与分类平台，让用户轻松整理、浏览和搜索个人菜谱收藏。界面采用温暖的厨房美学，融合现代极简主义与温馨的家庭烹饪氛围，让每次浏览都像翻阅一本心爱的食谱。

## 2. Design Language

### 色彩系统
- **Primary**: #E07A5F (温暖的陶土红)
- **Secondary**: #3D405B (深沉的厨房蓝)
- **Accent**: #81B29A (清新的香草绿)
- **Background**: #F4F1DE (奶油白)
- **Card Background**: #FFFFFF
- **Text Primary**: #2D2D2D
- **Text Secondary**: #6B7280

### 字体
- **标题**: "Playfair Display", serif
- **正文**: "Noto Sans SC", system-ui
- **装饰**: "Caveat", cursive

### 空间系统
- 基础单位: 8px
- 卡片圆角: 12px
- 阴影: 0 4px 20px rgba(0,0,0,0.08)

### 动效哲学
- 卡片悬停: scale 1.02, 阴影加深, 300ms ease-out
- 页面切换: 淡入淡出 200ms
- 标签切换: 滑动下划线 250ms ease-in-out

## 3. Layout & Structure

### 页面结构
1. **顶部导航栏**: Logo + 搜索栏 + 上传按钮
2. **分类标签栏**: 16种烹饪方式水平滚动
3. **筛选区域**: 排序选项（可多选）
4. **菜谱网格**: 响应式瀑布流卡片布局
5. **上传模态框**: 文档上传/文本输入

### 响应式策略
- Desktop (≥1280px): 4列网格
- Tablet (≥768px): 3列网格
- Mobile (<768px): 2列网格

## 4. Features & Interactions

### 核心功能

#### 4.1 菜谱上传
- **文本输入**: 大文本框直接粘贴菜谱内容
- **文档上传**: 支持 .txt, .doc, .docx 文件
- **自动解析**: 识别标题、配料、步骤
- **智能分类**: 基于关键词自动归类到16种烹饪方式

#### 4.2 分类系统
16种烹饪方式:
1. 炒 (Stir-fry)
2. 煎 (Pan-fry)
3. 炸 (Deep-fry)
4. 蒸 (Steam)
5. 煮 (Boil)
6. 炖 (Braise)
7. 焯 (Blanch)
8. 烫 (Scald)
9. 烤 (Oven/Air-fryer)
10. 微波 (Microwave)
11. 高压 (Pressure cooker)
12. 凉拌 (Cold dish)
13. 红烧 (Braised)
14. 焖 (Stew)
15. 烩 (Casserole)
16. 煲 (Soup)

#### 4.3 搜索功能
- 实时搜索菜谱标题和内容
- 高亮匹配关键词
- 空结果友好提示

#### 4.4 排序系统（可多选）
- **蔬菜分类**: 青菜类、根茎类、瓜果类、豆制品、肉类、海鲜
- **首字母排序**: A-Z, Z-A
- **上传时间**: 最新优先、最旧优先
- **制作方式**: 按烹饪类型

#### 4.5 菜谱卡片
- 显示: 标题、分类标签、简介、烹饪方式图标、上传时间
- 悬停: 显示完整内容预览
- 点击: 展开详情模态框

## 5. Component Inventory

### Navigation Bar
- Logo (带厨师帽图标)
- 搜索输入框 (带搜索图标)
- 上传按钮 (主色调)
- 状态: default, search active

### Category Tabs
- 水平滚动容器
- 16个分类标签 + "全部"
- 状态: selected, unselected, hover

### Filter Section
- 多选下拉/标签组
- 显示已选排序方式
- 重置按钮

### Recipe Card
- 图片占位 (食物插图)
- 标题 (最多2行)
- 分类标签 (小)
- 时间戳
- 状态: default, hover, expanded

### Upload Modal
- 标题输入
- 分类选择
- 内容文本区
- 文件上传区域
- 提交/取消按钮
- 状态: open, closed, uploading

### Empty State
- 友好插图
- 引导文案
- 上传按钮

## 6. Technical Approach

### 架构
- React 18 + TypeScript
- Tailwind CSS
- Zustand 状态管理
- localStorage 持久化

### 数据模型
```typescript
interface Recipe {
  id: string;
  title: string;
  content: string;
  category: string;
  subCategory: string;
  cookingMethod: string;
  ingredients: string[];
  createdAt: number;
}

interface SortOptions {
  vegetableCategory: string | null;
  alphabet: 'asc' | 'desc' | null;
  uploadTime: 'asc' | 'desc' | null;
  cookingMethod: string | null;
}
```

### 分类关键词映射
- 炒: 炒、爆炒、快炒
- 煎: 煎、烙
- 炸: 炸、酥炸
- 蒸: 蒸、清蒸
- 煮: 煮、汤
- 炖: 炖、红烧
- 焯: 焯水
- 烫: 烫、涮
- 烤: 烤箱、空气炸锅、烤
- 微波: 微波
- 高压: 高压锅、快锅
- 凉拌: 凉拌、沙拉
- 红烧: 红烧
- 焖: 焖、酱焖
- 烩: 烩、砂锅
- 煲: 煲汤、汤煲