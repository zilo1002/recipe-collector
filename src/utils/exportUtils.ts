import type { Recipe } from '@/store/recipeStore';

// 格式化日期
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// 单个菜谱转为 Markdown
export function recipeToMarkdown(recipe: Recipe): string {
  let md = `# ${recipe.title}\n\n`;

  md += `**制作方式**: ${recipe.cookingMethod}\n`;
  if (recipe.ingredientCategory) {
    md += `**食材分类**: ${recipe.ingredientCategory}\n`;
  }
  if (recipe.totalCalories > 0) {
    md += `**总热量**: ${recipe.totalCalories} 大卡\n`;
  }
  md += `**上传时间**: ${formatDate(recipe.createdAt)}\n\n`;

  // 食材
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    md += `## 食材\n\n`;
    recipe.ingredients.forEach(ing => {
      md += `- ${ing.name}: ${ing.amount}${ing.unit} (约${Math.round(ing.calories * ing.amount)}大卡)\n`;
    });
    md += '\n';
  }

  // 酱料
  if (recipe.sauces && recipe.sauces.length > 0) {
    md += `## 调料\n\n`;
    recipe.sauces.forEach(sauce => {
      md += `- ${sauce.name}: ${sauce.amount}${sauce.unit} (约${Math.round(sauce.calories * sauce.amount)}大卡)\n`;
    });
    md += '\n';
  }

  // 菜谱内容
  md += `## 做法\n\n${recipe.content}\n`;

  return md;
}

// 多个菜谱转为 Markdown
export function recipesToMarkdown(recipes: Recipe[]): string {
  return recipes.map(r => recipeToMarkdown(r)).join('\n---\n\n');
}

// 单个菜谱转为 HTML
export function recipeToHTML(recipe: Recipe): string {
  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${recipe.title}</title>
  <style>
    body { font-family: -apple-system, "Noto Sans SC", sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #3b82f6; margin-top: 24px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
    .meta span { margin-right: 20px; }
    .calories { color: #f97316; font-weight: bold; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>${recipe.title}</h1>
  <div class="meta">
    <span>制作方式: ${recipe.cookingMethod}</span>
    ${recipe.ingredientCategory ? `<span>食材分类: ${recipe.ingredientCategory}</span>` : ''}
    ${recipe.totalCalories > 0 ? `<span class="calories">总热量: ${recipe.totalCalories} 大卡</span>` : ''}
    <br>
    <span>上传时间: ${formatDate(recipe.createdAt)}</span>
  </div>
`;

  if (recipe.ingredients && recipe.ingredients.length > 0) {
    html += `  <h2>食材</h2>\n  <ul>\n`;
    recipe.ingredients.forEach(ing => {
      html += `    <li>${ing.name}: ${ing.amount}${ing.unit} (约${Math.round(ing.calories * ing.amount)}大卡)</li>\n`;
    });
    html += `  </ul>\n`;
  }

  if (recipe.sauces && recipe.sauces.length > 0) {
    html += `  <h2>调料</h2>\n  <ul>\n`;
    recipe.sauces.forEach(sauce => {
      html += `    <li>${sauce.name}: ${sauce.amount}${sauce.unit} (约${Math.round(sauce.calories * sauce.amount)}大卡)</li>\n`;
    });
    html += `  </ul>\n`;
  }

  html += `  <h2>做法</h2>\n  <div class="content">${recipe.content}</div>\n</body>\n</html>`;
  return html;
}

// 多个菜谱转为 HTML
export function recipesToHTML(recipes: Recipe[]): string {
  const recipesHTML = recipes.map(r => `
    <div class="recipe" style="margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid #e5e7eb;">
      <h2>${r.title}</h2>
      <div class="meta">
        <span>制作方式: ${r.cookingMethod}</span>
        ${r.ingredientCategory ? `<span>食材分类: ${r.ingredientCategory}</span>` : ''}
        ${r.totalCalories > 0 ? `<span class="calories">总热量: ${r.totalCalories} 大卡</span>` : ''}
        <br>
        <span>上传时间: ${formatDate(r.createdAt)}</span>
      </div>
      ${r.ingredients && r.ingredients.length > 0 ? `
        <h3>食材</h3>
        <ul>
          ${r.ingredients.map(ing => `<li>${ing.name}: ${ing.amount}${ing.unit} (约${Math.round(ing.calories * ing.amount)}大卡)</li>`).join('\n          ')}
        </ul>
      ` : ''}
      ${r.sauces && r.sauces.length > 0 ? `
        <h3>调料</h3>
        <ul>
          ${r.sauces.map(sauce => `<li>${sauce.name}: ${sauce.amount}${sauce.unit} (约${Math.round(sauce.calories * sauce.amount)}大卡)</li>`).join('\n          ')}
        </ul>
      ` : ''}
      <h3>做法</h3>
      <div class="content">${r.content}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的菜谱收藏</title>
  <style>
    body { font-family: -apple-system, "Noto Sans SC", sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #3b82f6; margin-top: 30px; }
    h3 { color: #1a1a1a; margin-top: 20px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
    .meta span { margin-right: 20px; }
    .calories { color: #f97316; font-weight: bold; }
    ul { padding-left: 20px; }
    li { margin: 6px 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>我的菜谱收藏</h1>
  <p style="color: #666;">共 ${recipes.length} 道菜谱</p>
  ${recipesHTML}
</body>
</html>`;
}

// 导出为 JSON（备份用）
export function recipesToJSON(recipes: Recipe[]): string {
  return JSON.stringify(recipes, null, 2);
}

// 下载文件
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 导出单个菜谱
export function exportSingleRecipe(recipe: Recipe, format: 'md' | 'html' | 'json'): void {
  const safeName = recipe.title.replace(/[<>:"/\\|?*]/g, '').substring(0, 30);
  const timestamp = new Date().toISOString().split('T')[0];

  switch (format) {
    case 'md':
      downloadFile(recipeToMarkdown(recipe), `${safeName}_${timestamp}.md`, 'text/markdown');
      break;
    case 'html':
      downloadFile(recipeToHTML(recipe), `${safeName}_${timestamp}.html`, 'text/html');
      break;
    case 'json':
      downloadFile(recipesToJSON([recipe]), `${safeName}_${timestamp}.json`, 'application/json');
      break;
  }
}

// 导出全部菜谱
export function exportAllRecipes(recipes: Recipe[], format: 'md' | 'html' | 'json'): void {
  const timestamp = new Date().toISOString().split('T')[0];

  switch (format) {
    case 'md':
      downloadFile(recipesToMarkdown(recipes), `菜谱备份_${timestamp}.md`, 'text/markdown');
      break;
    case 'html':
      downloadFile(recipesToHTML(recipes), `菜谱备份_${timestamp}.html`, 'text/html');
      break;
    case 'json':
      downloadFile(recipesToJSON(recipes), `菜谱备份_${timestamp}.json`, 'application/json');
      break;
  }
}

// 导入 JSON 备份
export function importRecipesFromJSON(file: File): Promise<Recipe[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          resolve(data);
        } else {
          reject(new Error('文件格式不正确'));
        }
      } catch {
        reject(new Error('JSON 解析失败'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}
