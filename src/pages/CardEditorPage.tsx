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
  FolderOpen,
  Calendar,
  Flag,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import { useI18n } from '../i18n';
import { MarkdownViewer } from '../components/MarkdownViewer';
import CardVersionHistory from '../components/CardVersionHistory';
import CardRelationPanel from '../components/CardRelationPanel';
import { TemplateSelector } from '../components/TemplateSelector';
import { MarkdownToolbar, ViewMode, MarkdownAction } from '../components/MarkdownToolbar';
import { insertMarkdown } from '../utils/markdownEditor';
import { LinkSuggestion, CardTemplate, ReviewPriorityLevel } from '../types';

export default function CardEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const { language, t } = useI18n();
  const dateLocale = language === 'zh-CN' ? zhCN : enUS;

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
    knowledgeSpaces,
    activeSpaceId,
  } = useStore();

  const card = !isNew ? cards.find((c) => c.id === id) : null;

  const [title, setTitle] = useState(card?.title || '');
  const [content, setContent] = useState(card?.content || '');
  const [tags, setTags] = useState<string[]>(card?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null | undefined>(
    card?.spaceId !== undefined ? card.spaceId : (activeSpaceId || null)
  );
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [justLinkedId, setJustLinkedId] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [reviewPriority, setReviewPriority] = useState<ReviewPriorityLevel>(
    card?.reviewPriority || 'medium'
  );
  const [customNextReviewDate, setCustomNextReviewDate] = useState<string>(
    card?.customNextReviewDate
      ? new Date(card.customNextReviewDate).toISOString().split('T')[0]
      : ''
  );

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
      alert(t('editor.titleRequired'));
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        const newCard = await createCard({
          title: title.trim(),
          content,
          tags,
          spaceId: selectedSpaceId || undefined,
          reviewPriority,
          customNextReviewDate: customNextReviewDate ? new Date(customNextReviewDate) : undefined,
        });
        navigate(`/cards/${newCard.id}`);
      } else if (id) {
        await updateCard(id, {
          title: title.trim(),
          content,
          tags,
          spaceId: selectedSpaceId || undefined,
          reviewPriority,
          customNextReviewDate: customNextReviewDate ? new Date(customNextReviewDate) : null,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm(t('editor.deleteConfirm'))) {
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
      alert(t('editor.saveFirstHint'));
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
              {isNew ? t('editor.createTitle') : t('editor.editTitle')}
            </h1>
            <p className="text-white/60 text-sm">
              {t('editor.bidirectionalHint')}
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
              {t('editor.useTemplate')}
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
              title={card.isFavorite ? t('editor.removeFavoriteTitle') : t('editor.addFavoriteTitle')}
            >
              <Star
                className={`w-4 h-4 ${card.isFavorite ? 'fill-amber-gold' : ''}`}
              />
              {card.isFavorite ? t('editor.favorited') : t('editor.favorite')}
            </button>
          )}
          {!isNew && (
            <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              {t('editor.deleteButton')}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? t('editor.saving') : t('editor.saveButton')}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 space-y-4">
            <input
              type="text"
              placeholder={t('editor.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-display text-3xl font-bold text-white placeholder-white/30"
            />

            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-white/40" />
              <select
                value={selectedSpaceId || ''}
                onChange={(e) => setSelectedSpaceId(e.target.value || null)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 outline-none hover:border-white/20 transition-colors cursor-pointer"
              >
                <option value="">{t('editor.noSpace')}</option>
                {knowledgeSpaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.icon} {space.name}
                  </option>
                ))}
              </select>
              {selectedSpaceId && knowledgeSpaces.find((s) => s.id === selectedSpaceId) && (
                <span
                  className="px-2 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: (knowledgeSpaces.find((s) => s.id === selectedSpaceId)?.color || '#6b7280') + '20',
                    color: knowledgeSpaces.find((s) => s.id === selectedSpaceId)?.color || '#6b7280',
                  }}
                >
                  {knowledgeSpaces.find((s) => s.id === selectedSpaceId)!.name}
                </span>
              )}
            </div>

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
                  placeholder={t('editor.addTagPlaceholder')}
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
                {t('editor.smartSuggest')}
              </button>
            </div>
            {viewMode === 'edit' ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('editor.editModePlaceholder')}
                className="w-full h-96 p-6 bg-transparent border-none outline-none resize-none font-mono text-sm text-white placeholder-white/30"
              />
            ) : viewMode === 'preview' ? (
              <div className="p-6 h-96 overflow-y-auto">
                <MarkdownViewer content={content || t('editor.previewNoContent')} />
              </div>
            ) : (
              <div className="flex h-96">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('editor.editModePlaceholder')}
                  className="w-1/2 h-full p-6 bg-transparent border-none outline-none resize-none font-mono text-sm text-white placeholder-white/30 border-r border-white/10"
                />
                <div className="w-1/2 p-6 overflow-y-auto">
                  <MarkdownViewer content={content || t('editor.previewNoContent')} />
                </div>
              </div>
            )}
          </div>

          {!isNew && existingCard && (
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Link className="w-5 h-5 text-amber-gold" />
                {t('editor.bidirectionalLinks')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-white/60 mb-2">{t('editor.forwardLinks')}</h4>
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
                    <p className="text-sm text-white/40">{t('editor.noForwardLinks')}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm text-white/60 mb-2">{t('editor.backwardLinks')}</h4>
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
                    <p className="text-sm text-white/40">{t('editor.noBackwardLinks')}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="space-y-4">
          {!isNew && existingCard && (
            <CardRelationPanel cardId={existingCard.id} />
          )}

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-gold" />
              {t('editor.relatedCards')}
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
                      >
                        {t('editor.insertQuote')}
                      </button>
                      {!isNew ? (
                        justLinkedId === suggestion.cardId ? (
                          <div className="flex-1 px-3 py-2 text-xs font-medium bg-gradient-to-r from-emerald-500/25 to-emerald-500/15 text-emerald-400 rounded-lg flex items-center justify-center gap-1">
                            {t('editor.linkSuccess')}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCreateLink(suggestion.cardId)}
                            className="flex-1 px-3 py-2 text-xs font-medium bg-gradient-to-r from-amber-gold/25 to-amber-gold/15 text-amber-gold rounded-lg hover:from-amber-gold/35 hover:to-amber-gold/25 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm shadow-amber-gold/10"
                          >
                            {t('editor.createLink')}
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="flex-1 px-3 py-2 text-xs font-medium bg-white/5 text-white/30 rounded-lg cursor-not-allowed"
                          title={t('editor.saveFirstHint')}
                        >
                          {t('editor.saveThenLink')}
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
                  {t('editor.analyzingContent')}
                </p>
                <p className="text-xs text-white/30">
                  {t('editor.enterContentHint')}
                </p>
              </div>
            )}
          </div>

          {!isNew && existingCard && (
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-gold" />
                {t('editor.reviewSettings')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">{t('editor.reviewPriority')}</label>
                  <div className="flex gap-2">
                    {(['high', 'medium', 'low'] as ReviewPriorityLevel[]).map((level) => {
                      const config = {
                        high: { label: t('editor.priorityHigh'), color: 'bg-rose-500/20 border-rose-500/50 text-rose-400', activeColor: 'bg-rose-500/30 border-rose-500 text-rose-300' },
                        medium: { label: t('editor.priorityMedium'), color: 'bg-amber-500/20 border-amber-500/50 text-amber-400', activeColor: 'bg-amber-500/30 border-amber-500 text-amber-300' },
                        low: { label: t('editor.priorityLow'), color: 'bg-slate-500/20 border-slate-500/50 text-slate-400', activeColor: 'bg-slate-500/30 border-slate-500 text-slate-300' },
                      }[level];
                      const isActive = reviewPriority === level;
                      return (
                        <button
                          key={level}
                          onClick={() => setReviewPriority(level)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                            isActive ? config.activeColor : config.color
                          } hover:scale-105`}
                        >
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-white/40 mt-1.5">
                    {t('editor.priorityTip')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {t('editor.customReviewDate')}
                  </label>
                  <input
                    type="date"
                    value={customNextReviewDate}
                    onChange={(e) => setCustomNextReviewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none hover:border-white/20 transition-colors [color-scheme:dark]"
                  />
                  {customNextReviewDate && (
                    <button
                      onClick={() => setCustomNextReviewDate('')}
                      className="text-xs text-white/40 hover:text-white/60 mt-1 transition-colors"
                    >
                      {t('editor.clearCustomDate')}
                    </button>
                  )}
                  <p className="text-xs text-white/40 mt-1.5">
                    {t('editor.customDateTip')}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <h4 className="text-sm text-white/60 mb-2">{t('editor.reviewStats')}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">{t('editor.reviewCount')}</span>
                      <span className="text-white font-medium">
                        {existingCard.reviewCount}{t('editor.reviewCountUnit')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">{t('editor.currentInterval')}</span>
                      <span className="text-white font-medium">
                        {existingCard.reviewInterval}{t('editor.currentIntervalUnit')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">{t('editor.difficultyFactor')}</span>
                      <span className="text-white font-medium">
                        {existingCard.easeFactor.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">{t('editor.lastReview')}</span>
                      <span className="text-white font-medium">
                        {existingCard.lastReviewedAt
                          ? format(new Date(existingCard.lastReviewedAt), 'yyyy-MM-dd', { locale: dateLocale })
                          : t('editor.neverReviewed')}
                      </span>
                    </div>
                  </div>
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
