import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  StarOff,
  Tag,
  FileText,
  ArrowRight,
  Link,
  X,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { cards, links, getFavoriteCards, toggleFavorite, searchQuery, setSearchQuery, selectedTags, setSelectedTags } = useStore();
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'links'>('updated');

  const favoriteCards = useMemo(() => getFavoriteCards(), [cards]);

  const allTags = useMemo(() => {
    const tags = new Set(favoriteCards.flatMap((c) => c.tags));
    return Array.from(tags);
  }, [favoriteCards]);

  const filteredCards = useMemo(() => {
    let result = [...favoriteCards];

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
  }, [favoriteCards, searchQuery, selectedTags, sortBy, links]);

  const toggleTag = useCallback((tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }, [selectedTags, setSelectedTags]);

  const handleToggleFavorite = useCallback(async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(cardId);
  }, [toggleFavorite]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Star className="w-10 h-10 text-amber-gold fill-amber-gold" />
            我的收藏
          </h1>
          <p className="text-white/60">
            共收藏 {favoriteCards.length} 张卡片，{filteredCards.length} 个结果
          </p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜索收藏的卡片..."
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
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              清除筛选
            </button>
          )}
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
            </div>
          </div>
        )}
      </div>

      {favoriteCards.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
            <StarOff className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-2">
            还没有收藏的卡片
          </h3>
          <p className="text-white/50 mb-6">
            在浏览卡片时点击星标图标，将重要或常用的卡片添加到收藏夹
          </p>
          <button
            onClick={() => navigate('/cards')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            浏览所有卡片
          </button>
        </motion.div>
      ) : filteredCards.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
            <Search className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-2">
            没有找到匹配的收藏卡片
          </h3>
          <p className="text-white/50">
            尝试调整搜索条件或清除筛选
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card, index) => {
              const cardLinks = links.filter(
                (l) => l.sourceCardId === card.id || l.targetCardId === card.id
              );
              return (
                <motion.div
                  key={card.id}
                  variants={item}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/cards/${card.id}`)}
                  className="glass-card-hover p-5 cursor-pointer group relative ring-2 ring-amber-gold/30 border-amber-gold/20"
                >
                  <button
                    onClick={(e) => handleToggleFavorite(card.id, e)}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    title="取消收藏"
                  >
                    <Star className="w-5 h-5 text-amber-gold fill-amber-gold group-hover:scale-110 transition-transform" />
                  </button>

                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-gold/20 to-amber-gold-light/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5 text-amber-gold" />
                    </div>
                    <div className="flex items-center gap-1 text-white/40 text-sm mr-10">
                      <Link className="w-4 h-4" />
                      {cardLinks.length}
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-amber-gold transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-white/60 line-clamp-2 mb-3">
                    {card.content.replace(/\[\[([^\]]+)\]\]/g, '$1')}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
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
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-amber-gold group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
