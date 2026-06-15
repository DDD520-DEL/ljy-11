import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  RefreshCw,
  ArrowRight,
  Link2,
  FileText,
} from 'lucide-react';
import { Card } from '../types';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '../lib/utils';

export function getContentSummary(content: string, maxLength: number = 150): string {
  const cleanContent = content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleanContent.length <= maxLength) return cleanContent;
  return cleanContent.slice(0, maxLength) + '...';
}

function getRandomCard(cards: Card[], excludeId?: string): Card | null {
  if (cards.length === 0) return null;
  if (cards.length === 1) return cards[0];
  let available = cards;
  if (excludeId) {
    available = cards.filter((c) => c.id !== excludeId);
  }
  if (available.length === 0) return cards[0];
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

export default function DailyDiscovery() {
  const navigate = useNavigate();
  const { cards, links, getCardLinks } = useStore();
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (cards.length > 0 && !currentCard) {
      setCurrentCard(getRandomCard(cards));
    }
  }, [cards, currentCard]);

  const linkedCards = useMemo(() => {
    if (!currentCard) return [];
    const { outgoing, incoming } = getCardLinks(currentCard.id);
    const allLinks = [...outgoing, ...incoming];
    const linkedCardIds = new Set<string>();
    allLinks.forEach((link) => {
      if (link.sourceCardId !== currentCard.id) {
        linkedCardIds.add(link.sourceCardId);
      }
      if (link.targetCardId !== currentCard.id) {
        linkedCardIds.add(link.targetCardId);
      }
    });
    return cards.filter((c) => linkedCardIds.has(c.id));
  }, [currentCard, cards, getCardLinks]);

  const handleRefresh = () => {
    if (cards.length <= 1) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentCard(getRandomCard(cards, currentCard?.id));
      setIsRefreshing(false);
    }, 400);
  };

  const handleCardClick = (cardId: string) => {
    navigate(`/cards/${cardId}`);
  };

  if (cards.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-gold/30 to-amber-gold-light/30 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-amber-gold" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-white">每日发现</h3>
            <p className="text-xs text-white/50">温故知新，探索已有知识</p>
          </div>
        </div>
        <div className="text-center py-8 text-white/50">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>还没有知识卡片，快去创建第一张吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-gold/10 to-transparent rounded-bl-full" />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-gold/30 to-amber-gold-light/30 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-amber-gold" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-white">每日发现</h3>
              <p className="text-xs text-white/50">温故知新，探索已有知识</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || cards.length <= 1}
            className={cn(
              'p-2.5 rounded-xl transition-all duration-300',
              cards.length <= 1
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-amber-gold'
            )}
            title="换一张"
          >
            <RefreshCw
              className={cn('w-5 h-5', isRefreshing && 'animate-spin')}
            />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleCardClick(currentCard.id)}
              className="glass-card-hover p-5 cursor-pointer"
            >
              <div className="mb-3">
                <h4 className="font-display text-lg font-bold text-white mb-2 line-clamp-1">
                  {currentCard.title}
                </h4>
                <p className="text-xs text-white/40">
                  {formatDistanceToNow(currentCard.updatedAt, {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                  {currentCard.lastReviewedAt && (
                    <span className="ml-2">
                      · 上次复习{' '}
                      {formatDistanceToNow(currentCard.lastReviewedAt, {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                  )}
                </p>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-4 line-clamp-3">
                {getContentSummary(currentCard.content) || '暂无内容'}
              </p>

              {currentCard.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentCard.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                  {currentCard.tags.length > 5 && (
                    <span className="tag-chip text-white/40">
                      +{currentCard.tags.length - 5}
                    </span>
                  )}
                </div>
              )}

              {linkedCards.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Link2 className="w-4 h-4 text-amber-gold" />
                    <span className="text-xs font-medium text-white/70">
                      关联卡片 ({linkedCards.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {linkedCards.slice(0, 4).map((linkedCard) => (
                      <button
                        key={linkedCard.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(linkedCard.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 hover:bg-white/10 hover:border-amber-gold/30 hover:text-amber-gold transition-all duration-200"
                      >
                        {linkedCard.title}
                      </button>
                    ))}
                    {linkedCards.length > 4 && (
                      <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40">
                        +{linkedCards.length - 4} 更多
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-end text-amber-gold text-sm font-medium group">
                <span>查看详情</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
