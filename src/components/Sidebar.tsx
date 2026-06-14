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
} from 'lucide-react';
import { useStore } from '../store/useStore';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/cards', icon: FileText, label: '知识卡片' },
  { path: '/tags', icon: Tag, label: '标签管理' },
  { path: '/graph', icon: Network, label: '知识图谱' },
  { path: '/import', icon: Upload, label: '数据导入' },
  { path: '/export', icon: Download, label: '数据导出' },
  { path: '/trajectory', icon: BarChart3, label: '阅读轨迹' },
  { path: '/review', icon: BookOpen, label: '复习中心' },
];

export function Sidebar() {
  const location = useLocation();
  const { cards, getReviewQueue } = useStore();
  const reviewCount = getReviewQueue().length;

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

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
              {item.path === '/review' && reviewCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-rose-review text-white rounded-full">
                  {reviewCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-mastered to-teal-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">{cards.length}</p>
              <p className="text-xs text-white/50">知识卡片</p>
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
