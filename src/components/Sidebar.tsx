import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Network,
  Upload,
  Download,
  BarChart3,
  BookOpen,
  Brain,
  Tag,
  Search,
  LayoutTemplate,
  Star,
  Plus,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  X,
  Check,
  Settings,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { KnowledgeSpace } from '../types';

interface SidebarProps {
  onOpenSearch: () => void;
}

const spaceIcons = ['📁', '📂', '🗂️', '📋', '📌', '📎', '🔖', '💡', '🧠', '🎯', '🚀', '⭐'];
const spaceColors = [
  '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
];

export function Sidebar({ onOpenSearch }: SidebarProps) {
  const location = useLocation();
  const {
    cards,
    knowledgeSpaces,
    activeSpaceId,
    getReviewQueue,
    getFavoriteCards,
    setActiveSpaceId,
    createSpace,
    updateSpace,
    deleteSpace,
  } = useStore();
  const reviewCount = getReviewQueue().length;
  const favoriteCount = getFavoriteCards().length;

  const [spacesExpanded, setSpacesExpanded] = useState(true);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDesc, setNewSpaceDesc] = useState('');
  const [newSpaceIcon, setNewSpaceIcon] = useState('📁');
  const [newSpaceColor, setNewSpaceColor] = useState('#f59e0b');
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [editSpaceName, setEditSpaceName] = useState('');
  const [editSpaceDesc, setEditSpaceDesc] = useState('');

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return;
    await createSpace({
      name: newSpaceName.trim(),
      description: newSpaceDesc.trim(),
      icon: newSpaceIcon,
      color: newSpaceColor,
    });
    setNewSpaceName('');
    setNewSpaceDesc('');
    setNewSpaceIcon('📁');
    setNewSpaceColor('#f59e0b');
    setShowCreateSpace(false);
  };

  const handleStartEdit = (space: KnowledgeSpace) => {
    setEditingSpaceId(space.id);
    setEditSpaceName(space.name);
    setEditSpaceDesc(space.description);
  };

  const handleSaveEdit = async () => {
    if (!editingSpaceId || !editSpaceName.trim()) return;
    await updateSpace(editingSpaceId, {
      name: editSpaceName.trim(),
      description: editSpaceDesc.trim(),
    });
    setEditingSpaceId(null);
  };

  const handleDeleteSpace = async (id: string) => {
    if (confirm('确定要删除此知识空间吗？空间内的卡片将移至"未分类"。')) {
      await deleteSpace(id);
    }
  };

  const getCardCountForSpace = (spaceId: string | null) => {
    if (spaceId === null) {
      return cards.filter((c) => !c.spaceId).length;
    }
    return cards.filter((c) => c.spaceId === spaceId).length;
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: '仪表盘' },
    { path: '/favorites', icon: Star, label: '我的收藏' },
    { path: '/cards', icon: FileText, label: '知识卡片' },
    { path: '/templates', icon: LayoutTemplate, label: '模板管理' },
    { path: '/tags', icon: Tag, label: '标签管理' },
    { path: '/graph', icon: Network, label: '知识图谱' },
    { path: '/import', icon: Upload, label: '数据导入' },
    { path: '/export', icon: Download, label: '数据导出' },
    { path: '/trajectory', icon: BarChart3, label: '阅读轨迹' },
    { path: '/review', icon: BookOpen, label: '复习中心' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-card rounded-none border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-gold to-amber-gold-light flex items-center justify-center animate-pulse-glow">
            <Brain className="w-5 h-5 text-deep-space" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">智识</h1>
            <p className="text-xs text-white/50">知识网络平台</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm transition-all duration-200 hover:bg-white/10 hover:text-white/60 hover:border-white/20"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">全局搜索...</span>
          <kbd className="text-xs px-1.5 py-0.5 rounded bg-white/5 border border-white/10">⌘K</kbd>
        </button>
      </div>

      <nav className="p-4 space-y-1 overflow-y-auto flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.path === '/favorites' && favoriteCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-amber-gold text-deep-space rounded-full font-medium">
                  {favoriteCount}
                </span>
              )}
              {item.path === '/review' && reviewCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-rose-review text-white rounded-full">
                  {reviewCount}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 mt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setSpacesExpanded(!spacesExpanded)}
              className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wider font-medium hover:text-white/70 transition-colors"
            >
              {spacesExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
              知识空间
            </button>
            <button
              onClick={() => setShowCreateSpace(true)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
              title="创建知识空间"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {spacesExpanded && (
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveSpaceId(null)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                  activeSpaceId === null
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <FolderOpen className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left truncate">全部</span>
                <span className="text-xs text-white/40">{cards.length}</span>
              </button>

              {knowledgeSpaces.map((space) => (
                <div key={space.id} className="group relative">
                  {editingSpaceId === space.id ? (
                    <div className="px-3 py-2 space-y-2 bg-white/5 rounded-xl">
                      <input
                        type="text"
                        value={editSpaceName}
                        onChange={(e) => setEditSpaceName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') setEditingSpaceId(null);
                        }}
                        className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-white/30"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editSpaceDesc}
                        onChange={(e) => setEditSpaceDesc(e.target.value)}
                        placeholder="描述（可选）"
                        className="w-full bg-transparent border-none outline-none text-xs text-white/70 placeholder-white/30"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 rounded hover:bg-white/10 text-emerald-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingSpaceId(null)}
                          className="p-1 rounded hover:bg-white/10 text-white/50"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveSpaceId(space.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                        activeSpaceId === space.id
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                      }`}
                    >
                      <span className="shrink-0 text-base leading-none">{space.icon}</span>
                      <span className="flex-1 text-left truncate">{space.name}</span>
                      <span className="text-xs text-white/40">{getCardCountForSpace(space.id)}</span>
                      <div className="hidden group-hover:flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(space);
                          }}
                          className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSpace(space.id);
                          }}
                          className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-rose-review-light transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {activeSpaceId === space.id && (
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: space.color }}
                        />
                      )}
                    </button>
                  )}
                </div>
              ))}

              {showCreateSpace && (
                <div className="px-3 py-2 space-y-2 bg-white/5 rounded-xl border border-white/10">
                  <input
                    type="text"
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateSpace();
                      if (e.key === 'Escape') setShowCreateSpace(false);
                    }}
                    placeholder="空间名称"
                    className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-white/30"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={newSpaceDesc}
                    onChange={(e) => setNewSpaceDesc(e.target.value)}
                    placeholder="描述（可选）"
                    className="w-full bg-transparent border-none outline-none text-xs text-white/70 placeholder-white/30"
                  />
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {spaceIcons.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setNewSpaceIcon(icon)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
                            newSpaceIcon === icon
                              ? 'bg-white/20 ring-1 ring-white/40'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {spaceColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewSpaceColor(color)}
                          className={`w-6 h-6 rounded-full transition-all ${
                            newSpaceColor === color
                              ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-deep-space scale-110'
                              : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCreateSpace(false)}
                      className="flex-1 px-2 py-1.5 text-xs text-white/50 hover:text-white/70 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleCreateSpace}
                      disabled={!newSpaceName.trim()}
                      className="flex-1 px-2 py-1.5 text-xs bg-amber-gold/20 text-amber-gold rounded-lg hover:bg-amber-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      创建
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        <NavLink
          to="/settings"
          className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
        >
          <Settings className="w-5 h-5" />
          <span className="flex-1">系统设置</span>
        </NavLink>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-mastered to-teal-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">{cards.length}</p>
              <p className="text-xs text-white/50">
                {activeSpaceId
                  ? knowledgeSpaces.find((s) => s.id === activeSpaceId)?.name || '知识卡片'
                  : '全部卡片'}
              </p>
            </div>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-gold to-amber-gold-light rounded-full"
              style={{ width: `${Math.min(cards.length * 10, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
