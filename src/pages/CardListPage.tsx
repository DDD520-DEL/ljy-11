import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Tag,
  FileText,
  ArrowRight,
  Link,
  CheckSquare,
  Square,
  Trash2,
  Download,
  Tags,
  X,
  AlertCircle,
  FileJson,
  FileText as FileTextIcon,
  Star,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function CardListPage() {
  const navigate = useNavigate();
  const {
    cards,
    links,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    batchDeleteCards,
    batchAddTags,
    exportCardsToJSON,
    exportCardsToMarkdown,
    toggleFavorite,
    activeSpaceId,
    knowledgeSpaces,
    moveCardToSpace,
  } = useStore();
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'links'>('updated');
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const exitMultiSelectMode = useCallback(() => {
    setIsMultiSelectMode(false);
    setSelectedCardIds([]);
  }, []);

  useEffect(() => {
    if (!showExportMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const allTags = useMemo(() => {
    const tags = new Set(cards.flatMap((c) => c.tags));
    return Array.from(tags);
  }, [cards]);

  const filteredCards = useMemo(() => {
    let result = [...cards];

    if (activeSpaceId) {
      result = result.filter((c) => c.spaceId === activeSpaceId);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.content.toLowerCase().includes(query) ||
          c.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter((c) =>
        selectedTags.some((tag) => c.tags.includes(tag))
      );
    }

    if (sortBy === 'updated') {
      result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } else if (sortBy === 'created') {
      result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'links') {
      result.sort((a, b) => {
        const aLinks = links.filter(
          (l) => l.sourceCardId === a.id || l.targetCardId === a.id
        ).length;
        const bLinks = links.filter(
          (l) => l.sourceCardId === b.id || l.targetCardId === b.id
        ).length;
        return bLinks - aLinks;
      });
    }

    return result;
  }, [cards, searchQuery, selectedTags, sortBy, links, activeSpaceId]);

  useEffect(() => {
    if (isMultiSelectMode && filteredCards.length === 0) {
      exitMultiSelectMode();
    }
  }, [isMultiSelectMode, filteredCards.length, exitMultiSelectMode]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleCardSelection = (cardId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedCardIds.includes(cardId)) {
      setSelectedCardIds(selectedCardIds.filter((id) => id !== cardId));
    } else {
      setSelectedCardIds([...selectedCardIds, cardId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCardIds.length === filteredCards.length) {
      setSelectedCardIds([]);
    } else {
      setSelectedCardIds(filteredCards.map((c) => c.id));
    }
  };

  const enterMultiSelectMode = () => {
    setIsMultiSelectMode(true);
  };

  const handleCardClick = (cardId: string) => {
    if (isMultiSelectMode) {
      toggleCardSelection(cardId);
    } else {
      navigate(`/cards/${cardId}`);
    }
  };

  const handleBatchDelete = async () => {
    await batchDeleteCards(selectedCardIds);
    setShowDeleteConfirm(false);
    setSelectedCardIds([]);
  };

  const handleBatchAddTags = async () => {
    const tags = tagInput
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (tags.length === 0) return;

    await batchAddTags(selectedCardIds, tags);
    setShowTagModal(false);
    setTagInput('');
  };

  const handleExport = (format: 'json' | 'markdown') => {
    const content =
      format === 'json'
        ? exportCardsToJSON(selectedCardIds)
        : exportCardsToMarkdown(selectedCardIds);
    const mimeType = format === 'json' ? 'application/json' : 'text/markdown';
    const fileExtension = format === 'json' ? 'json' : 'md';

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `selected-cards-${dateStr}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportMenu(false);
  };

  const handleToggleFavorite = useCallback(async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(cardId);
  }, [toggleFavorite]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            知识卡片
          </h1>
          <p className="text-white/60">
            共 {cards.length} 张卡片，{filteredCards.length} 个结果
            {activeSpaceId && knowledgeSpaces.find((s) => s.id === activeSpaceId) && (
              <span className="ml-2 text-amber-gold">
                · {knowledgeSpaces.find((s) => s.id === activeSpaceId)!.icon} {knowledgeSpaces.find((s) => s.id === activeSpaceId)!.name}
              </span>
            )}
          </p>
        </div>
        {isMultiSelectMode ? (
          <div className="flex items-center gap-3">
            <button
              onClick={exitMultiSelectMode}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              取消多选
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={enterMultiSelectMode}
              className="btn-secondary flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              批量操作
            </button>
            <button
              onClick={() => navigate('/cards/new')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              新卡片
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isMultiSelectMode && selectedCardIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-4 border-amber-gold/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-gold font-medium">
                    已选择 {selectedCardIds.length} 张卡片
                  </span>
                  <span className="text-white/40 text-sm">
                    (共 {filteredCards.length} 个结果)
                  </span>
                </div>
                <button
                  onClick={toggleSelectAll}
                  className="text-sm text-amber-gold hover:text-amber-gold-light transition-colors"
                >
                  {selectedCardIds.length === filteredCards.length
                    ? '取消全选'
                    : '全选当前结果'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative" ref={exportMenuRef}>
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    批量导出
                  </button>
                  <AnimatePresence>
                    {showExportMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className="absolute right-0 top-full mt-2 glass-card p-2 z-10 w-48"
                      >
                        <button
                          onClick={() => handleExport('json')}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-left"
                        >
                          <FileJson className="w-4 h-4" />
                          导出为 JSON
                        </button>
                        <button
                          onClick={() => handleExport('markdown')}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-left"
                        >
                          <FileTextIcon className="w-4 h-4" />
                          导出为 Markdown
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => setShowTagModal(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Tags className="w-4 h-4" />
                  批量打标签
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-danger flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  批量删除
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜索卡片标题、内容或标签..."
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
            <option value="updated">最近更新</option>
            <option value="created">创建时间</option>
            <option value="links">关联数量</option>
          </select>
        </div>

        {allTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-white/40" />
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`tag-chip ${
                    selectedTags.includes(tag)
                      ? 'bg-amber-gold/20 border-amber-gold/50 text-amber-gold'
                      : ''
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-white/50 hover:text-white transition-colors"
                >
                  清除筛选
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredCards.map((card, index) => {
            const cardLinks = links.filter(
              (l) => l.sourceCardId === card.id || l.targetCardId === card.id
            );
            const isSelected = selectedCardIds.includes(card.id);
            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleCardClick(card.id)}
                className={`glass-card-hover p-5 cursor-pointer group relative ${
                  isSelected ? 'ring-2 ring-amber-gold border-amber-gold/50' : ''
                } ${card.isFavorite ? 'ring-2 ring-amber-gold/30 border-amber-gold/20' : ''}`}
              >
                {isMultiSelectMode ? (
                  <div
                    className="absolute top-4 right-4 z-10"
                    onClick={(e) => toggleCardSelection(card.id, e)}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-amber-gold" />
                    ) : (
                      <Square className="w-5 h-5 text-white/40 group-hover:text-white/60" />
                    )}
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleToggleFavorite(card.id, e)}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    title={card.isFavorite ? '取消收藏' : '添加收藏'}
                  >
                    <Star
                      className={`w-5 h-5 transition-all duration-200 ${
                        card.isFavorite
                          ? 'text-amber-gold fill-amber-gold scale-110'
                          : 'text-white/40 group-hover:text-white/60'
                      }`}
                    />
                  </button>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-gold/20 to-amber-gold-light/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-amber-gold" />
                  </div>
                  {!isMultiSelectMode && (
                    <div className="flex items-center gap-1 text-white/40 text-sm mr-10">
                      <Link className="w-4 h-4" />
                      {cardLinks.length}
                    </div>
                  )}
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-amber-gold transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-white/60 line-clamp-2 mb-3">
                  {card.content.replace(/\[\[([^\]]+)\]\]/g, '$1')}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {card.spaceId && knowledgeSpaces.find((s) => s.id === card.spaceId) && (
                      <span
                        className="px-1.5 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: (knowledgeSpaces.find((s) => s.id === card.spaceId)?.color || '#6b7280') + '20',
                          color: knowledgeSpaces.find((s) => s.id === card.spaceId)?.color || '#6b7280',
                        }}
                      >
                        {knowledgeSpaces.find((s) => s.id === card.spaceId)!.icon} {knowledgeSpaces.find((s) => s.id === card.spaceId)!.name}
                      </span>
                    )}
                    {card.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag-chip text-xs">
                        {tag}
                      </span>
                    ))}
                    {card.tags.length > 3 && (
                      <span className="tag-chip text-xs">
                        +{card.tags.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/40">
                    {formatDistanceToNow(card.updatedAt, {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/40">
                    复习间隔: {card.reviewInterval} 天
                  </span>
                  {!isMultiSelectMode && (
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-amber-gold group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredCards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
            <Search className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-2">
            没有找到卡片
          </h3>
          <p className="text-white/50 mb-6">
            尝试调整搜索条件或创建新的知识卡片
          </p>
          <button
            onClick={() => navigate('/cards/new')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            创建第一张卡片
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-rose-review/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-rose-review" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    确认删除
                  </h3>
                  <p className="text-sm text-white/60">
                    将删除 {selectedCardIds.length} 张卡片
                  </p>
                </div>
              </div>
              <p className="text-white/70 mb-6">
                此操作将永久删除选中的 {selectedCardIds.length} 张卡片及其关联链接。
                此操作不可撤销，确定要继续吗？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="flex-1 bg-rose-review text-white font-medium rounded-xl px-6 py-2.5 hover:bg-rose-review/80 transition-colors"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTagModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTagModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md"
            >
              <h3 className="font-display text-xl font-bold text-white mb-2">
                批量添加标签
              </h3>
              <p className="text-sm text-white/60 mb-4">
                为 {selectedCardIds.length} 张卡片添加标签
              </p>

              <div className="mb-4">
                <label className="block text-sm text-white/70 mb-2">
                  输入标签（用逗号或空格分隔多个标签）
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleBatchAddTags();
                  }}
                  placeholder="例如：重要, 待复习, 编程"
                  className="input-field w-full"
                  autoFocus
                />
              </div>

              {allTags.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-white/70 mb-2">常用标签：</p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          const currentTags = tagInput
                            .split(/[,，\s]+/)
                            .map((t) => t.trim())
                            .filter((t) => t.length > 0);
                          if (!currentTags.includes(tag)) {
                            setTagInput(
                              [...currentTags, tag].join(', ')
                            );
                          }
                        }}
                        className="tag-chip text-xs hover:bg-amber-gold/20 hover:border-amber-gold/50 hover:text-amber-gold"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTagModal(false);
                    setTagInput('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleBatchAddTags}
                  disabled={!tagInput.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加标签
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
