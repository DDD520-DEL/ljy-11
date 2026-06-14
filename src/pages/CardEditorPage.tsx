import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
  Link,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { MarkdownViewer } from '../components/MarkdownViewer';
import CardVersionHistory from '../components/CardVersionHistory';
import { LinkSuggestion } from '../types';

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
  } = useStore();

  const card = !isNew ? cards.find((c) => c.id === id) : null;

  const [title, setTitle] = useState(card?.title || '');
  const [content, setContent] = useState(card?.content || '');
  const [tags, setTags] = useState<string[]>(card?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!content) return;
    const result = await suggestLinks(content);
    setSuggestions(result);
  }, [content, suggestLinks]);

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

  const handleInsertLink = (cardTitle: string) => {
    setContent(content + ` [[${cardTitle}]]`);
  };

  const handleCreateLink = async (targetCardId: string) => {
    if (!id || isNew) {
      alert('请先保存卡片后再添加关联');
      return;
    }
    await createLink(id, targetCardId);
    setSuggestions(suggestions.filter((s) => s.cardId !== targetCardId));
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

          <div className="glass-card">
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    !showPreview
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  编辑
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    showPreview
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  预览
                </button>
              </div>
              <button
                onClick={handleSuggestLinks}
                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-amber-gold/10 text-amber-gold rounded-lg hover:bg-amber-gold/20 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                智能建议
              </button>
            </div>
            {!showPreview ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始编写内容...

使用 [[卡片标题]] 创建双向链接
支持 Markdown 语法"
                className="w-full h-96 p-6 bg-transparent border-none outline-none resize-none font-mono text-sm text-white placeholder-white/30"
              />
            ) : (
              <div className="p-6">
                <MarkdownViewer content={content || '*暂无内容*'} />
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
              关联建议
            </h3>
            {suggestions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.cardId}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-gold/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        {suggestion.cardTitle}
                      </span>
                      <span className="text-xs text-amber-gold">
                        {(suggestion.similarity * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mb-2">{suggestion.reason}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInsertLink(suggestion.cardTitle)}
                        className="flex-1 px-2 py-1.5 text-xs bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                      >
                        插入引用
                      </button>
                      {!isNew && (
                        <button
                          onClick={() => handleCreateLink(suggestion.cardId)}
                          className="flex-1 px-2 py-1.5 text-xs bg-amber-gold/20 text-amber-gold rounded-lg hover:bg-amber-gold/30 transition-colors"
                        >
                          建立关联
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 text-center py-8">
                输入内容后将自动建议关联卡片
              </p>
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
    </motion.div>
  );
}
