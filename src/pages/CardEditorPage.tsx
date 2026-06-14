import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
  Link,
  Sparkles,
  FileText,
  LayoutTemplate,
  Star,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { MarkdownViewer } from '../components/MarkdownViewer';
import CardVersionHistory from '../components/CardVersionHistory';
import { TemplateSelector } from '../components/TemplateSelector';
import { MarkdownToolbar, ViewMode, MarkdownAction } from '../components/MarkdownToolbar';
import { insertMarkdown } from '../utils/markdownEditor';
import { LinkSuggestion, CardTemplate } from '../types';

export default function CardEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const {
    cards,
    createCard,
    updateCard,
    deleteCard,
    getCardLinks,
    suggestLinks,
    createLink,
    startReading,
    endReading,
    getCardVersions,
    restoreCardVersion,
    toggleFavorite,
  } = useStore();

  const card = !isNew ? cards.find((c) => c.id === id) : null;

  const [title, setTitle] = useState(card?.title || '');
  const [content, setContent] = useState(card?.content || '');
  const [tags, setTags] = useState<string[]>(card?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [justLinkedId, setJustLinkedId] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const existingCard = !isNew ? cards.find((c) => c.id === id) : null;
  const cardLinks = existingCard ? getCardLinks(existingCard.id) : { outgoing: [], incoming: [] };
  const versions = !isNew && id ? getCardVersions(id) : [];

  const pendingEndRef = useRef<Promise<void> | null>(null);

  const handleRestore = async (versionId: string) => {
    if (!id) return;
    await restoreCardVersion(id, versionId);
    const updatedCard = useStore.getState().cards.find((c) => c.id === id);
    if (updatedCard) {
      setTitle(updatedCard.title);
      setContent(updatedCard.content);
      setTags(updatedCard.tags);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (pendingEndRef.current) {
        await pendingEndRef.current;
        pendingEndRef.current = null;
      }
      if (!isNew && card && !cancelled) {
        await startReading(card.id);
      }
    })();
    return () => {
      cancelled = true;
      pendingEndRef.current = endReading();
    };
  }, [id, card, startReading, endReading, isNew]);

  const handleSuggestLinks = useCallback(async () => {
    if (!content && !title) return;
    const combinedContent = title ? `${title}\n${content}` : content;
    const result = await suggestLinks(combinedContent, id && !isNew ? id : undefined);
    setSuggestions(result);
  }, [content, title, suggestLinks, id, isNew]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSuggestLinks();
    }, 1000);
    return () => clearTimeout(timer);
  }, [handleSuggestLinks]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('请输入卡片标题');
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        const newCard = await createCard({
          title: title.trim(),
          content,
          tags,
        });
        navigate(`/cards/${newCard.id}`);
      } else if (id) {
        await updateCard(id, {
          title: title.trim(),
          content,
          tags,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm('确定要删除这张卡片吗？此操作不可撤销。')) {
      await deleteCard(id);
      navigate('/cards');
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTemplateSelect = (template: CardTemplate) => {
    if (template.titleFormat && !title) {
      setTitle(template.titleFormat);
    }
    if (template.contentSkeleton && !content) {
      setContent(template.contentSkeleton);
    }
    if (template.defaultTags.length > 0) {
      const mergedTags = [...new Set([...tags, ...template.defaultTags])];
      setTags(mergedTags);
    }
    setShowTemplateSelector(false);
  };

  const handleInsertLink = (cardTitle: string) => {
    setContent(content + ` [[${cardTitle}]]`);
  };

  const handleInsertMarkdown = useCallback(
    (action: MarkdownAction, data?: { url?: string }) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.focus();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const result = insertMarkdown(content, start, end, action, { url: data?.url });
      setContent(result.newValue);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(result.newStart, result.newEnd);
      });
    },
    [content]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          handleInsertMarkdown('bold');
        } else if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          handleInsertMarkdown('italic');
        }
      }
    },
    [handleInsertMarkdown]
  );

  const handleCreateLink = async (targetCardId: string) => {
    if (!id || isNew) {
      alert('请先保存卡片后再添加关联');
      return;
    }
    setJustLinkedId(targetCardId);
    await createLink(id, targetCardId);
    setTimeout(() => {
      setJustLinkedId(null);
      setSuggestions((prev) => prev.filter((s) => s.cardId !== targetCardId));
    }, 600);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div
        variants={item}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cards')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              {isNew ? '创建新卡片' : '编辑卡片'}
            </h1>
            <p className="text-white/60 text-sm">
              使用 [[卡片标题]] 语法创建双向链接
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isNew && (
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <LayoutTemplate className="w-4 h-4" />
              使用模板
            </button>
          )}
          {!isNew && card && (
            <button
              onClick={() => toggleFavorite(card.id)}
              className={`btn-secondary flex items-center gap-2 transition-all ${
                card.isFavorite
                  ? 'bg-amber-gold/20 border-amber-gold/50 text-amber-gold'
                  : ''
              }`}
              title={card.isFavorite ? '取消收藏' : '添加收藏'}
            >
              <Star
                className={`w-4 h-4 ${card.isFavorite ? 'fill-amber-gold' : ''}`}
              />
              {card.isFavorite ? '已收藏' : '收藏'}
            </button>
          )}
          {!isNew && (
            <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 space-y-4">
            <input
              type="text"
              placeholder="卡片标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-display text-3xl font-bold text-white placeholder-white/30"
            />

            <div className="flex flex-wrap gap-2 items-center">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip group">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-rose-review-light transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <form onSubmit={handleAddTag} className="flex items-center">
                <input
                  type="text"
                  placeholder="添加标签..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-32 bg-transparent border-none outline-none text-sm text-white placeholder-white/30"
                />
                <button type="submit" className="p-1 hover:text-amber-gold transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <MarkdownToolbar
              onInsert={handleInsertMarkdown}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <div className="flex items-center justify-end px-4 py-2 border-b border-white/5 bg-white/[0.01]">
              <button
                onClick={handleSuggestLinks}
                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-amber-gold/10 text-amber-gold rounded-lg hover:bg-amber-gold/20 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                智能建议
              </button>
            </div>
            {viewMode === 'edit' ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="开始编写内容...

使用 [[卡片标题]] 创建双向链接
支持 Markdown 语法
快捷键: Ctrl+B 加粗, Ctrl+I 斜体"
                className="w-full h-96 p-6 bg-transparent border-none outline-none resize-none font-mono text-sm text-white placeholder-white/30"
              />
            ) : viewMode === 'preview' ? (
              <div className="p-6 h-96 overflow-y-auto">
                <MarkdownViewer content={content || '*暂无内容*'} />
              </div>
            ) : (
              <div className="flex h-96">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="开始编写内容...

使用 [[卡片标题]] 创建双向链接
支持 Markdown 语法
快捷键: Ctrl+B 加粗, Ctrl+I 斜体"
                  className="w-1/2 h-full p-6 bg-transparent border-none outline-none resize-none font-mono text-sm text-white placeholder-white/30 border-r border-white/10"
                />
                <div className="w-1/2 p-6 overflow-y-auto">
                  <MarkdownViewer content={content || '*暂无内容*'} />
                </div>
              </div>
            )}
          </div>

          {!isNew && existingCard && (
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Link className="w-5 h-5 text-amber-gold" />
                双向链接
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-white/60 mb-2">正向链接</h4>
                  {cardLinks.outgoing.length > 0 ? (
                    <div className="space-y-2">
                      {cardLinks.outgoing.map((link) => {
                        const targetCard = cards.find(
                          (c) => c.id === link.targetCardId
                        );
                        return (
                          <div
                            key={link.id}
                            onClick={() => navigate(`/cards/${link.targetCardId}`)}
                            className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          >
                            <FileText className="w-4 h-4 text-amber-gold" />
                            <span className="text-sm text-white">
                              {targetCard?.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-white/40">暂无正向链接</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm text-white/60 mb-2">反向链接</h4>
                  {cardLinks.incoming.length > 0 ? (
                    <div className="space-y-2">
                      {cardLinks.incoming.map((link) => {
                        const sourceCard = cards.find(
                          (c) => c.id === link.sourceCardId
                        );
                        return (
                          <div
                            key={link.id}
                            onClick={() => navigate(`/cards/${link.sourceCardId}`)}
                            className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          >
                            <FileText className="w-4 h-4 text-emerald-mastered" />
                            <span className="text-sm text-white">
                              {sourceCard?.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-white/40">暂无反向链接</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-gold" />
              可能相关的卡片
            </h3>
            {suggestions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.cardId}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      justLinkedId === suggestion.cardId
                        ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-400/50 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                        : 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-amber-gold/40 hover:shadow-lg hover:shadow-amber-gold/5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <button
                        onClick={() => navigate(`/cards/${suggestion.cardId}`)}
                        className="text-sm font-semibold text-white hover:text-amber-gold transition-colors text-left"
                      >
                        {suggestion.cardTitle}
                      </button>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-gold/15 text-amber-gold">
                        {(suggestion.similarity * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-white/60 mb-3 leading-relaxed">
                      {suggestion.reason.split(' | ').map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-1 last:mb-0">
                          <span className="text-amber-gold/70 mt-0.5">•</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInsertLink(suggestion.cardTitle)}
                        className="flex-1 px-3 py-2 text-xs font-medium bg-white/10 text-white rounded-lg hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        title="在正文中插入 [[卡片标题]] 引用"
                      >
                        插入引用
                      </button>
                      {!isNew ? (
                        justLinkedId === suggestion.cardId ? (
                          <div className="flex-1 px-3 py-2 text-xs font-medium bg-gradient-to-r from-emerald-500/25 to-emerald-500/15 text-emerald-400 rounded-lg flex items-center justify-center gap-1">
                            ✅ 关联成功
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCreateLink(suggestion.cardId)}
                            className="flex-1 px-3 py-2 text-xs font-medium bg-gradient-to-r from-amber-gold/25 to-amber-gold/15 text-amber-gold rounded-lg hover:from-amber-gold/35 hover:to-amber-gold/25 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm shadow-amber-gold/10"
                            title="一键创建双向链接"
                          >
                            🔗 建立关联
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="flex-1 px-3 py-2 text-xs font-medium bg-white/5 text-white/30 rounded-lg cursor-not-allowed"
                          title="请先保存卡片后再建立关联"
                        >
                          保存后关联
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-sm text-white/40 mb-1">
                  正在分析内容...
                </p>
                <p className="text-xs text-white/30">
                  输入标题和正文后将自动推荐相关卡片
                </p>
              </div>
            )}
          </div>

          {!isNew && existingCard && (
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold text-white mb-4">
                复习信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">复习次数</span>
                  <span className="text-white font-medium">
                    {existingCard.reviewCount} 次
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">当前间隔</span>
                  <span className="text-white font-medium">
                    {existingCard.reviewInterval} 天
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">难度系数</span>
                  <span className="text-white font-medium">
                    {existingCard.easeFactor.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">上次复习</span>
                  <span className="text-white font-medium">
                    {existingCard.lastReviewedAt
                      ? new Date(existingCard.lastReviewedAt).toLocaleDateString()
                      : '从未复习'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!isNew && (
            <CardVersionHistory
              versions={versions}
              currentTitle={title}
              currentContent={content}
              currentTags={tags}
              onRestore={handleRestore}
            />
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showTemplateSelector && (
          <TemplateSelector
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
