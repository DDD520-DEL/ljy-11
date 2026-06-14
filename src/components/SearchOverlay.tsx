import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, Tag, Hash } from 'lucide-react';
import { useStore } from '../store/useStore';

interface SearchResult {
  id: string;
  title: string;
  contentSnippet: string;
  tags: string[];
  score: number;
  titleMatches: number[];
  contentMatches: number[];
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findMatchPositions(text: string, keyword: string): number[] {
  const positions: number[] = [];
  const regex = new RegExp(escapeRegExp(keyword), 'gi');
  let match;
  while ((match = regex.exec(text)) !== null) {
    positions.push(match.index);
  }
  return positions;
}

function extractSnippet(content: string, keywords: string[], maxLen = 120): string {
  if (!keywords.length) return content.slice(0, maxLen);

  const lowerContent = content.toLowerCase();
  let bestPos = 0;
  let bestScore = -1;

  for (const kw of keywords) {
    const idx = lowerContent.indexOf(kw.toLowerCase());
    if (idx !== -1) {
      const score = keywords.reduce((s, k) => {
        const subIdx = lowerContent.indexOf(k.toLowerCase(), Math.max(0, idx - maxLen / 2));
        return s + (subIdx !== -1 && subIdx < idx + maxLen / 2 ? 1 : 0);
      }, 0);
      if (score > bestScore) {
        bestScore = score;
        bestPos = idx;
      }
    }
  }

  const start = Math.max(0, bestPos - Math.floor(maxLen / 3));
  const end = Math.min(content.length, start + maxLen);
  let snippet = content.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  return snippet;
}

function highlightText(text: string, keywords: string[]): React.ReactNode[] {
  if (!keywords.length) return [text];

  const parts: React.ReactNode[] = [];
  const regex = new RegExp(`(${keywords.map(escapeRegExp).join('|')})`, 'gi');
  const segments = text.split(regex);

  segments.forEach((seg, i) => {
    const isMatch = keywords.some(
      (kw) => seg.toLowerCase() === kw.toLowerCase()
    );
    if (isMatch) {
      parts.push(
        <mark key={i} className="search-highlight">
          {seg}
        </mark>
      );
    } else if (seg) {
      parts.push(seg);
    }
  });

  return parts;
}

function computeScore(
  card: { title: string; content: string; tags: string[] },
  keywords: string[]
): { score: number; titleMatches: number[]; contentMatches: number[] } {
  let score = 0;
  const titleMatches: number[] = [];
  const contentMatches: number[] = [];

  const lowerTitle = card.title.toLowerCase();
  const lowerContent = card.content.toLowerCase();

  for (const kw of keywords) {
    const lkw = kw.toLowerCase();
    const titleHit = lowerTitle.includes(lkw);
    const contentHit = lowerContent.includes(lkw);
    const tagHit = card.tags.some((t) => t.toLowerCase().includes(lkw));

    if (!titleHit && !contentHit && !tagHit) {
      return { score: 0, titleMatches: [], contentMatches: [] };
    }

    if (titleHit) {
      const count = (lowerTitle.match(new RegExp(escapeRegExp(lkw), 'g')) || []).length;
      score += 10 * count;
      titleMatches.push(...findMatchPositions(card.title, kw));
    }
    if (contentHit) {
      const count = (lowerContent.match(new RegExp(escapeRegExp(lkw), 'g')) || []).length;
      score += 3 * count;
      contentMatches.push(...findMatchPositions(card.content, kw));
    }
    if (tagHit) {
      score += 5;
    }
  }

  return { score, titleMatches, contentMatches };
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const navigate = useNavigate();
  const { cards } = useStore();
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const keywords = useMemo(
    () => query.split(/\s+/).filter((w) => w.length > 0),
    [query]
  );

  const allTags = useMemo(() => {
    const tags = new Set(cards.flatMap((c) => c.tags));
    return Array.from(tags).sort();
  }, [cards]);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!keywords.length && !selectedTags.length) return [];

    let result: SearchResult[] = [];

    for (const card of cards) {
      if (selectedTags.length > 0 && !selectedTags.some((tag) => card.tags.includes(tag))) {
        continue;
      }

      if (keywords.length === 0) {
        result.push({
          id: card.id,
          title: card.title,
          contentSnippet: extractSnippet(card.content, [], 100),
          tags: card.tags,
          score: 1,
          titleMatches: [],
          contentMatches: [],
        });
        continue;
      }

      const { score, titleMatches, contentMatches } = computeScore(card, keywords);
      if (score > 0) {
        result.push({
          id: card.id,
          title: card.title,
          contentSnippet: extractSnippet(card.content, keywords),
          tags: card.tags,
          score,
          titleMatches,
          contentMatches,
        });
      }
    }

    return result.sort((a, b) => b.score - a.score).slice(0, 50);
  }, [cards, keywords, selectedTags]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedTags([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, selectedTags]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleSelect = useCallback(
    (cardId: string) => {
      navigate(`/cards/${cardId}`);
      onClose();
    },
    [navigate, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Enter' && searchResults.length > 0) {
        handleSelect(searchResults[activeIndex].id);
        return;
      }
    },
    [onClose, searchResults, activeIndex, handleSelect]
  );

  useEffect(() => {
    if (!resultsRef.current) return;
    const activeEl = resultsRef.current.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl glass-card overflow-hidden flex flex-col"
            style={{ maxHeight: '75vh' }}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <Search className="w-5 h-5 text-amber-gold shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索卡片... 多关键词用空格分隔"
                className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-base"
              />
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-white/10 text-white/40 text-xs border border-white/10">
                ESC
              </kbd>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {allTags.length > 0 && (
              <div className="px-5 py-3 border-b border-white/10 overflow-x-auto">
                <div className="flex items-center gap-2 flex-nowrap">
                  <Hash className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <div className="flex items-center gap-1.5 flex-nowrap">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`tag-chip text-xs whitespace-nowrap ${
                          selectedTags.includes(tag)
                            ? 'bg-amber-gold/20 border-amber-gold/50 text-amber-gold'
                            : ''
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="text-xs text-white/40 hover:text-white/70 shrink-0"
                    >
                      清除
                    </button>
                  )}
                </div>
              </div>
            )}

            <div ref={resultsRef} className="flex-1 overflow-y-auto">
              {searchResults.length === 0 && (keywords.length > 0 || selectedTags.length > 0) && (
                <div className="px-5 py-12 text-center">
                  <Search className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">未找到匹配的卡片</p>
                  <p className="text-white/25 text-xs mt-1">
                    尝试不同的关键词或调整标签筛选
                  </p>
                </div>
              )}

              {searchResults.length === 0 && keywords.length === 0 && selectedTags.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <FileText className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">输入关键词开始搜索</p>
                  <p className="text-white/25 text-xs mt-1">
                    支持多关键词组合搜索，空格分隔
                  </p>
                </div>
              )}

              {searchResults.map((result, index) => (
                <div
                  key={result.id}
                  data-active={index === activeIndex}
                  onClick={() => handleSelect(result.id)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`px-5 py-4 cursor-pointer transition-colors border-b border-white/5 last:border-b-0 ${
                    index === activeIndex
                      ? 'bg-amber-gold/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-gold/20 to-amber-gold-light/20 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-amber-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-base font-bold text-white truncate">
                        {highlightText(result.title, keywords)}
                      </h4>
                      <p className="text-sm text-white/60 mt-1 leading-relaxed">
                        {highlightText(result.contentSnippet, keywords)}
                      </p>
                      {result.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Tag className="w-3 h-3 text-white/30" />
                          {result.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                selectedTags.includes(tag)
                                  ? 'bg-amber-gold/20 text-amber-gold'
                                  : 'bg-white/10 text-white/50'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-white/20 shrink-0 mt-1">
                      {result.score.toFixed(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-2.5 border-t border-white/10 flex items-center gap-4 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10">↑↓</kbd>
                导航
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10">Enter</kbd>
                打开
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10">Esc</kbd>
                关闭
              </span>
              {searchResults.length > 0 && (
                <span className="ml-auto">
                  {searchResults.length} 个结果
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
