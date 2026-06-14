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
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { MarkdownViewer } from '../components/MarkdownViewer';
import { ReviewRating } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const ratingLabels: Record<ReviewRating, { label: string; color: string; description: string }> = {
  0: { label: '完全忘记', color: 'bg-rose-500', description: '完全无法回忆' },
  1: { label: '几乎忘记', color: 'bg-orange-500', description: '几乎无法回忆' },
  2: { label: '困难回忆', color: 'bg-amber-500', description: '回忆有困难' },
  3: { label: '勉强回忆', color: 'bg-yellow-500', description: '勉强能够回忆' },
  4: { label: '轻松回忆', color: 'bg-lime-500', description: '轻松回忆' },
  5: { label: '完美回忆', color: 'bg-emerald-500', description: '完美回忆' },
};

export default function ReviewPage() {
  const { getReviewQueue, submitReview, cards, links } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
          太棒了！
        </h1>
        <p className="text-white/60 mb-2">今日复习已完成</p>
        <p className="text-white/40 mb-8">
          你已经完成了 {completedToday} 张卡片的复习
        </p>
        <div className="glass-card p-6 max-w-md">
          <h3 className="font-display text-lg font-bold text-white mb-4">
            学习统计
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-amber-gold">{cards.length}</p>
              <p className="text-xs text-white/50">总卡片数</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-mastered">
                {links.length}
              </p>
              <p className="text-xs text-white/50">知识关联</p>
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
            复习中心
          </h1>
          <p className="text-white/60">
            基于间隔重复算法，智能推荐复习内容
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {currentIndex + 1} / {reviewQueue.length}
            </p>
            <p className="text-xs text-white/50">今日进度</p>
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
              <p className="text-xs text-white/50">待复习</p>
            </div>
          </div>
        </div>
        <div className="stat-card p-4">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-mastered" />
            <div>
              <p className="text-xl font-bold text-white">{completedToday}</p>
              <p className="text-xs text-white/50">已完成</p>
            </div>
          </div>
        </div>
        <div className="stat-card p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xl font-bold text-white">
                {currentCard?.reviewCount || 0}
              </p>
              <p className="text-xs text-white/50">复习次数</p>
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
              <p className="text-xs text-white/50">复习间隔(天)</p>
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
                  {currentCard.lastReviewedAt && (
                    <span className="text-xs text-white/40">
                      上次复习:{' '}
                      {formatDistanceToNow(new Date(currentCard.lastReviewedAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
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
                      <p className="text-sm text-white/50 mb-3">相关链接</p>
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
                    回忆这张卡片的内容...
                  </p>
                  <p className="text-white/50">
                    点击下方按钮查看答案，然后评估你的记忆程度
                  </p>
                </div>
              )}
            </div>

            {!showAnswer && (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full btn-primary py-4 text-lg"
              >
                显示答案
              </button>
            )}

            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-center text-white/70">
                  你对这张卡片的记忆程度如何？
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
                    稍后复习
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
          SM-2 算法说明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/70">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="font-medium text-white mb-2">评分 0-2</p>
            <p className="text-xs text-white/50">
              记忆困难，重置复习间隔为1天，重新开始学习
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="font-medium text-white mb-2">评分 3-4</p>
            <p className="text-xs text-white/50">
              记忆一般，按正常间隔递增，略微降低难度系数
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="font-medium text-white mb-2">评分 5</p>
            <p className="text-xs text-white/50">
              记忆完美，延长复习间隔，提高难度系数
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
