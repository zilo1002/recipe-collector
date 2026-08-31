import { Search, ChefHat, Plus, MoreHorizontal, Download, Upload, Link2, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRecipeStore } from '@/store/recipeStore';
import { exportAllRecipes, importRecipesFromJSON } from '@/utils/exportUtils';

export default function Header() {
  const { searchQuery, setSearchQuery, openModal, recipes, addRecipe } = useRecipeStore();
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setShowMenu(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExport = (format: 'md' | 'html' | 'json') => {
    exportAllRecipes(recipes, format);
    setShowMenu(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedRecipes = await importRecipesFromJSON(file);
      importedRecipes.forEach(recipe => {
        const { id, createdAt, ...rest } = recipe;
        addRecipe({
          ...rest,
          createdAt: createdAt || Date.now(),
        } as any);
      });
      alert(`成功导入 ${importedRecipes.length} 道菜谱！`);
    } catch (err) {
      alert('导入失败：' + (err as Error).message);
    }
    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
    setShowMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-warm-gray/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-display font-bold text-secondary">
                食谱收藏
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">Recipe Vault</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索菜谱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-full
                         text-gray-700 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                         transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                           bg-gray-200 text-gray-500 hover:bg-gray-300 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2" ref={menuRef}>
            {/* More Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-200
                  ${showMenu ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                title="更多操作"
              >
                {copied ? <Check className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? '已复制' : '更多'}</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">
                    备份与导入
                  </div>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    导出 JSON 备份
                  </button>
                  <button
                    onClick={() => handleExport('html')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    导出 HTML 格式
                  </button>
                  <button
                    onClick={() => handleExport('md')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    导出 Markdown
                  </button>
                  <label className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    导入 JSON 备份
                    <input
                      ref={importInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>

                  <div className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100 mt-1">
                    分享
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Link2 className="w-4 h-4" />
                    复制链接
                  </button>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full
                       font-medium shadow-lg shadow-primary/25
                       hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30
                       active:scale-95 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">上传菜谱</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
