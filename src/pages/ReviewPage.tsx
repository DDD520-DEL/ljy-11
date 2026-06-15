import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Brain,
  TrendingUp,
  Clock,
  Target,
  Flag,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { MarkdownViewer } from '../components/MarkdownViewer';
import { ReviewRating, ReviewPriorityLevel } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useI18n } from '../i18n';

export default function ReviewPage() {
  const { getReviewQueue, submitReview, cards, links, activeSpaceId, knowledgeSpaces } = useStore();
  const { language, t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const dateLocale = language === 'zh-CN' ? zhCN : enUS;

  const ratingLabels: Record<ReviewRating, { label: string; color: string; description: string }> = {
    0: { label: t('review.score0Label'), color: 'bg-rose-500', description: t('review.score0Desc') },
    1: { label: t('review.score1Label'), color: 'bg-orange-500', description: t('review.score1Desc') },
    2: { label: t('review.score2Label'), color: 'bg-amber-500', description: t('review.score2Desc') },
    3: { label: t('review.score3Label'), color: 'bg-yellow-500', description: t('review.score3Desc') },
    4: { label: t('review.score4Label'), color: 'bg-lime-500', description: t('review.score4Desc') },
    5: { label: t('review.score5Label'), color: 'bg-emerald-500', description: t('review.score5Desc') },
  };

  const priorityBadge: Record<ReviewPriorityLevel, { label: string; color: string }> = {
    high: { label: t('review.highPriority'), color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    medium: { label: t('review.mediumPriority'), color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    low: { label: t('review.lowPriority'), color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  };

  const reviewQueue = getReviewQueue();
  const currentCard = reviewQueue[currentIndex];

  const cardLinks = currentCard
    ? links.filter(
        (l) => l.sourceCardId === currentCard.id || l.targetCardId === currentCard.id
      )
    : [];

  const handleRating = async (rating: ReviewRating) => {
    if (!currentCard || isAnimating) return;

    setIsAnimating(true);
    await submitReview(currentCard.id, rating);
    setCompletedToday((prev) => prev + 1);
    setShowAnswer(false);

    setTimeout(() => {
      if (currentIndex < reviewQueue.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleSkip = () => {
    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const progress =
    reviewQueue.length > 0
      ? ((currentIndex + (showAnswer ? 0.5 : 0)) / reviewQueue.length) * 100
      : 100;

  if (reviewQueue.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center"
      >
        <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-emerald-mastered/20 to-teal-500/20 flex items-center justify-center">
          <TrendingUp className="w-12 h-12 text-emerald-mastered" />
        </div>
        <h1 className="font-display text-4xl font-bold text-white mb-2">
          {t('review.completedTitle')}
        </h1>
        <p className="text-white/60 mb-2">{t('review.completedSubtitle')}</p>
        <p className="text-white/40 mb-8">
          {t('review.completedDescPrefix')} {completedToday} {t('review.completedDescSuffix')}
        </p>
        <div className="glass-card p-6 max-w-md">
          <h3 className="font-display text-lg font-bold text-white mb-4">
            {t('review.statsTitle')}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-amber-gold">{cards.length}</p>
              <p className="text-xs text-white/50">{t('review.statsTotalCards')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-mastered">
                {links.length}
              </p>
              <p className="text-xs text-white/50">{t('review.statsKnowledgeLinks')}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            {t('review.title')}
          </h1>
          <p className="text-white/60">
            {t('review.subtitle')}
            {activeSpaceId && knowledgeSpaces.find((s) => s.id === activeSpaceId) && (
              <span className="ml-2 text-amber-gold">
                · {knowledgeSpaces.find((s) => s.id === activeSpaceId)!.icon} {knowledgeSpaces.find((s) => s.id === activeSpaceId)!.name}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {currentIndex + 1} / {reviewQueue.length}
            </p>
            <p className="text-xs text-white/50">{t('review.todayProgress')}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-gold/20 to-amber-gold-light/20 flex items-center justify-center">
            <Brain className="w-8 h-8 text-amber-gold" />
          </div>
        </div>
      </div>

      <div className="glass-card p-2">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-gold to-amber-gold-light rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card p-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-amber-gold" />
            <div>
              <p className="text-xl font-bold text-white">
                {reviewQueue.length}
              </p>
              <p className="text-xs text-white/50">{t('review.toReview')}</p>
            </div>
          </div>
        </div>
        <div className="stat-card p-4">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-mastered" />
            <div>
              <p className="text-xl font-bold text-white">{completedToday}</p>
              <p className="text-xs text-white/50">{t('review.completed')}</p>
            </div>
          </div>
        </div>
        <div className="stat-card p-4">
          <div className="flex items-center gap-3">
            <Flag className="w-5 h-5 text-rose-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">{reviewQueue.filter(c => c.reviewPriority === 'high').length}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">{reviewQueue.filter(c => c.reviewPriority === 'medium').length}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-400">{reviewQueue.filter(c => c.reviewPriority === 'low').length}</span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">{t('review.priority')}</p>
            </div>
          </div>
        </div>
        <div className="stat-card p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-rose-review-light" />
            <div>
              <p className="text-xl font-bold text-white">
                {currentCard?.reviewInterval || 1}
              </p>
              <p className="text-xs text-white/50">{t('review.intervalLabel')}</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentCard && (
          <motion.div
            key={currentCard.id + (showAnswer ? '-answer' : '-question')}
            initial={{ opacity: 0, y: 20, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -20, rotateX: 15 }}
            transition={{ duration: 0.4 }}
            className="glass-card p-8 min-h-[400px] flex flex-col"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs bg-amber-gold/20 text-amber-gold rounded-full">
                    #{currentIndex + 1}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${priorityBadge[currentCard.reviewPriority].color}`}>
                    <Flag className="w-3 h-3 inline mr-0.5" />
                    {priorityBadge[currentCard.reviewPriority].label}
                  </span>
                  {currentCard.lastReviewedAt && (
                    <span className="text-xs text-white/40">
                      {t('review.lastReviewPrefix')}
                      {formatDistanceToNow(new Date(currentCard.lastReviewedAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </span>
                  )}
                  {currentCard.customNextReviewDate && (
                    <span className="text-xs text-blue-400/70">
                      {t('review.customDatePrefix')}{new Date(currentCard.customNextReviewDate).toLocaleDateString(language === 'zh-CN' ? 'zh-CN' : 'en-US')}
                    </span>
                  )}
                </div>
                <h2 className="font-display text-3xl font-bold text-white">
                  {currentCard.title}
                </h2>
              </div>
              <div className="flex gap-1.5">
                {currentCard.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag-chip text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              {showAnswer ? (
                <div className="w-full max-w-2xl">
                  <MarkdownViewer content={currentCard.content} />
                  {cardLinks.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <p className="text-sm text-white/50 mb-3">{t('review.relatedLinks')}</p>
                      <div className="flex flex-wrap gap-2">
                        {cardLinks.slice(0, 5).map((link) => {
                          const linkedCardId =
                            link.sourceCardId === currentCard.id
                              ? link.targetCardId
                              : link.sourceCardId;
                          const linkedCard = cards.find(
                            (c) => c.id === linkedCardId
                          );
                          return linkedCard ? (
                            <span
                              key={link.id}
                              className="tag-chip text-xs bg-amber-gold/10 border-amber-gold/30 text-amber-gold"
                            >
                              {linkedCard.title}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-gold/20 to-amber-gold-light/20 flex items-center justify-center animate-pulse">
                    <BookOpen className="w-10 h-10 text-amber-gold" />
                  </div>
                  <p className="text-xl text-white/80 mb-2">
                    {t('review.recallHintTitle')}
                  </p>
                  <p className="text-white/50">
                    {t('review.recallHintDesc')}
                  </p>
                </div>
              )}
            </div>

            {!showAnswer && (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full btn-primary py-4 text-lg"
              >
                {t('review.showAnswer')}
              </button>
            )}

            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-center text-white/70">
                  {t('review.howWellRemembered')}
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {([0, 1, 2, 3, 4, 5] as ReviewRating[]).map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      disabled={isAnimating}
                      className="group relative"
                    >
                      <div
                        className={`p-4 rounded-xl ${ratingLabels[rating].color} transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50`}
                      >
                        <p className="text-xl font-bold text-white">
                          {rating}
                        </p>
                      </div>
                      <p className="text-xs text-white/60 mt-1 group-hover:text-white transition-colors">
                        {ratingLabels[rating].label}
                      </p>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs text-white/80 bg-deep-space px-2 py-1 rounded">
                        {ratingLabels[rating].description}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSkip}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('review.reviewLater')}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card p-6">
        <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-gold" />
          {t('review.sm2Title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/70">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="font-medium text-white mb-2">{t('review.sm2Score02Title')}</p>
            <p className="text-xs text-white/50">
              {t('review.sm2Score02Desc')}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="font-medium text-white mb-2">{t('review.sm2Score34Title')}</p>
            <p className="text-xs text-white/50">
              {t('review.sm2Score34Desc')}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="font-medium text-white mb-2">{t('review.sm2Score5Title')}</p>
            <p className="text-xs text-white/50">
              {t('review.sm2Score5Desc')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
