import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Tag,
  Search,
  Edit3,
  Trash2,
  X,
  Check,
  FileText,
  Merge,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function TagsPage() {
  const navigate = useNavigate();
  const { getTagStats, renameTag, deleteTag, mergeTags, setSelectedTags } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'count' | 'name' | 'recent'>('count');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [selectedTags, setSelectedTagsLocal] = useState<string[]>([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeTarget, setMergeTarget] = useState('');
  const [expandedTag, setExpandedTag] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const tagStats = useMemo(() => getTagStats(), [getTagStats]);

  const filteredTags = useMemo(() => {
    let result = [...tagStats];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(query));
    }

    if (sortBy === 'count') {
      result.sort((a, b) => b.cardCount - a.cardCount);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    } else if (sortBy === 'recent') {
      result.sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime());
    }

    return result;
  }, [tagStats, searchQuery, sortBy]);

  const totalCards = tagStats.reduce((sum, t) => sum + t.cardCount, 0);
  const uniqueTagCount = tagStats.length;

  const toggleTagSelection = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTagsLocal(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTagsLocal([...selectedTags, tagName]);
    }
  };

  const selectAllTags = () => {
    if (selectedTags.length === filteredTags.length) {
      setSelectedTagsLocal([]);
    } else {
      setSelectedTagsLocal(filteredTags.map((t) => t.name));
    }
  };

  const startEditing = (tagName: string) => {
    setEditingTag(tagName);
    setEditingValue(tagName);
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setEditingValue('');
  };

  const saveRename = async () => {
    if (!editingTag || !editingValue.trim()) return;
    if (editingValue.trim() === editingTag) {
      cancelEditing();
      return;
    }
    await renameTag(editingTag, editingValue.trim());
    cancelEditing();
  };

  const handleDelete = async (tagName: string) => {
    await deleteTag(tagName);
    setDeleteConfirm(null);
    setSelectedTagsLocal(selectedTags.filter((t) => t !== tagName));
  };

  const handleMerge = async () => {
    if (selectedTags.length === 0 || !mergeTarget.trim()) return;
    await mergeTags(selectedTags, mergeTarget.trim());
    setShowMergeModal(false);
    setSelectedTagsLocal([]);
    setMergeTarget('');
  };

  const filterByTag = (tagName: string) => {
    setSelectedTags([tagName]);
    navigate('/cards');
  };

  const tagColors = [
    'from-amber-gold to-amber-gold-light',
    'from-blue-500 to-cyan-500',
    'from-emerald-mastered to-teal-500',
    'from-rose-review to-pink-500',
    'from-purple-500 to-indigo-500',
    'from-orange-500 to-red-500',
    'from-teal-500 to-emerald-500',
    'from-pink-500 to-rose-500',
  ];

  const getTagColor = (index: number) => tagColors[index % tagColors.length];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            标签管理
          </h1>
          <p className="text-white/60">
            共 {uniqueTagCount} 个标签，关联 {totalCards} 张卡片
          </p>
        </div>
        {selectedTags.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/60">
              已选择 {selectedTags.length} 个标签
            </span>
            <button
              onClick={() => setShowMergeModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Merge className="w-4 h-4" />
              合并标签
            </button>
            <button
              onClick={() => setSelectedTagsLocal([])}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              取消选择
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-gold to-amber-gold-light flex items-center justify-center">
              <Tag className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{uniqueTagCount}</p>
          <p className="text-sm text-white/50">标签总数</p>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{totalCards}</p>
          <p className="text-sm text-white/50">关联卡片</p>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-mastered to-teal-500 flex items-center justify-center">
              <Merge className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {selectedTags.length}
          </p>
          <p className="text-sm text-white/50">已选择</p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜索标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="input-field w-auto"
          >
            <option value="count">按数量排序</option>
            <option value="name">按名称排序</option>
            <option value="recent">最近使用</option>
          </select>
          {filteredTags.length > 0 && (
            <button
              onClick={selectAllTags}
              className="btn-secondary text-sm"
            >
              {selectedTags.length === filteredTags.length
                ? '取消全选'
                : '全选'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTags.map((tag, index) => (
            <motion.div
              key={tag.name}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.03 }}
              className="glass-card-hover overflow-hidden"
            >
              <div className="p-4 flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.name)}
                  onChange={() => toggleTagSelection(tag.name)}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-amber-gold focus:ring-amber-gold cursor-pointer"
                />

                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTagColor(
                    index
                  )} flex items-center justify-center flex-shrink-0`}
                >
                  <Tag className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  {editingTag === tag.name ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename();
                          if (e.key === 'Escape') cancelEditing();
                        }}
                        autoFocus
                        className="input-field text-lg font-bold py-1 px-3 flex-1"
                      />
                      <button
                        onClick={saveRename}
                        className="p-2 rounded-lg bg-emerald-mastered/20 text-emerald-mastered hover:bg-emerald-mastered/30 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-display text-lg font-bold text-white truncate">
                      {tag.name}
                    </h3>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {tag.cardCount} 张卡片
                    </span>
                    <span>
                      最近使用:{' '}
                      {formatDistanceToNow(tag.lastUsedAt, {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => filterByTag(tag.name)}
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-amber-gold/20 hover:text-amber-gold transition-colors"
                    title="查看相关卡片"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startEditing(tag.name)}
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                    title="重命名"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(tag.name)}
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-rose-review/20 hover:text-rose-review transition-colors"
                    title="删除标签"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setExpandedTag(expandedTag === tag.name ? null : tag.name)
                    }
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                    title={expandedTag === tag.name ? '收起' : '展开卡片'}
                  >
                    {expandedTag === tag.name ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedTag === tag.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10 overflow-hidden"
                  >
                    <div className="p-4 bg-white/[0.02]">
                      <h4 className="text-sm font-medium text-white/70 mb-3">
                        相关卡片 ({tag.cards.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tag.cards.slice(0, 6).map((card) => (
                          <div
                            key={card.id}
                            onClick={() => navigate(`/cards/${card.id}`)}
                            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          >
                            <p className="text-sm font-medium text-white truncate">
                              {card.title}
                            </p>
                            <p className="text-xs text-white/40 mt-1">
                              {formatDistanceToNow(card.updatedAt, {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </p>
                          </div>
                        ))}
                        {tag.cards.length > 6 && (
                          <button
                            onClick={() => filterByTag(tag.name)}
                            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-amber-gold text-center transition-colors"
                          >
                            查看全部 {tag.cards.length} 张卡片
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {deleteConfirm === tag.name && (
                <div className="p-4 bg-rose-review/10 border-t border-rose-review/30">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-review flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        确定要删除标签「{tag.name}」吗？
                      </p>
                      <p className="text-xs text-white/50">
                        此操作将从 {tag.cardCount} 张卡片中移除该标签，不会删除卡片本身。
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(tag.name)}
                      className="px-4 py-2 bg-rose-review text-white rounded-lg text-sm font-medium hover:bg-rose-review/80 transition-colors"
                    >
                      确认删除
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 bg-white/10 text-white/70 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTags.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
            <Tag className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-2">
            没有找到标签
          </h3>
          <p className="text-white/50">
            {searchQuery ? '尝试调整搜索条件' : '在卡片中添加标签后会在这里显示'}
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {showMergeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMergeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md"
            >
              <h3 className="font-display text-xl font-bold text-white mb-2">
                合并标签
              </h3>
              <p className="text-sm text-white/60 mb-4">
                将 {selectedTags.length} 个标签合并为一个新标签
              </p>

              <div className="mb-4">
                <p className="text-sm text-white/70 mb-2">要合并的标签：</p>
                <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="tag-chip bg-amber-gold/20 text-amber-gold border-amber-gold/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-white/70 mb-2">
                  目标标签名称
                </label>
                <input
                  type="text"
                  value={mergeTarget}
                  onChange={(e) => setMergeTarget(e.target.value)}
                  placeholder="输入新的标签名称..."
                  className="input-field w-full"
                />
                <p className="text-xs text-white/40 mt-2">
                  所有选中标签将被替换为这个新标签
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMergeModal(false);
                    setMergeTarget('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleMerge}
                  disabled={!mergeTarget.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认合并
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
