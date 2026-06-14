import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  GitCompare,
  X,
  Clock,
  FileText,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { CardVersion } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CardVersionHistoryProps {
  versions: CardVersion[];
  currentTitle: string;
  currentContent: string;
  currentTags: string[];
  onRestore: (versionId: string) => Promise<void>;
}

interface DiffSegment {
  type: 'same' | 'added' | 'removed';
  value: string;
}

function computeDiff(oldText: string, newText: string): DiffSegment[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const maxLen = Math.max(oldLines.length, newLines.length);
  const result: DiffSegment[] = [];

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i] ?? '';
    const newLine = newLines[i] ?? '';

    if (oldLine === newLine) {
      if (oldLine !== undefined || i < oldLines.length) {
        result.push({ type: 'same', value: oldLine + '\n' });
      }
    } else {
      if (i < oldLines.length) {
        result.push({ type: 'removed', value: oldLine + '\n' });
      }
      if (i < newLines.length) {
        result.push({ type: 'added', value: newLine + '\n' });
      }
    }
  }

  return result;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CardVersionHistory({
  versions,
  currentTitle,
  currentContent,
  currentTags,
  onRestore,
}: CardVersionHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const compareVersion = useMemo(
    () => versions.find((v) => v.id === compareVersionId) || null,
    [versions, compareVersionId]
  );

  const diff = useMemo(() => {
    if (!compareVersion) return null;
    return computeDiff(compareVersion.content, currentContent);
  }, [compareVersion, currentContent]);

  const titleDiff = useMemo(() => {
    if (!compareVersion) return null;
    return computeDiff(compareVersion.title, currentTitle);
  }, [compareVersion, currentTitle]);

  const handleRestore = async (versionId: string) => {
    if (!confirm('确定要回退到此版本吗？当前内容将保存为新版本。')) return;
    setRestoringId(versionId);
    try {
      await onRestore(versionId);
    } finally {
      setRestoringId(null);
      setCompareVersionId(null);
    }
  };

  return (
    <div className="glass-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-amber-gold" />
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              版本历史
            </h3>
            <p className="text-sm text-white/60">
              共 {versions.length} 个版本（最多保留 20 个）
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-white/60" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/60" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-6">
              {versions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">暂无历史版本</p>
                  <p className="text-white/30 text-xs mt-1">
                    保存卡片后将自动创建版本快照
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {compareVersion && diff && (
                    <div className="bg-white/5 rounded-xl p-4 border border-amber-gold/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GitCompare className="w-4 h-4 text-amber-gold" />
                          <span className="text-sm font-medium text-amber-gold">
                            对比: {format(new Date(compareVersion.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })} → 当前版本
                          </span>
                        </div>
                        <button
                          onClick={() => setCompareVersionId(null)}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                        >
                          <X className="w-4 h-4 text-white/60" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-white/50 mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> 标题
                          </div>
                          <div className="font-mono text-xs space-y-0.5 bg-black/20 rounded-lg p-2">
                            {titleDiff?.map((seg, i) => (
                              <div
                                key={i}
                                className={cn(
                                  'whitespace-pre-wrap',
                                  seg.type === 'added' && 'bg-emerald-500/20 text-emerald-300 px-1 rounded',
                                  seg.type === 'removed' && 'bg-rose-500/20 text-rose-300 line-through px-1 rounded',
                                  seg.type === 'same' && 'text-white/80'
                                )}
                              >
                                {seg.type === 'added' && '+ '}
                                {seg.type === 'removed' && '- '}
                                {seg.value}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-white/50 mb-1 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> 标签
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {compareVersion.tags.map((tag) => {
                              const hasTag = currentTags.includes(tag);
                              return (
                                <span
                                  key={tag}
                                  className={cn(
                                    'text-xs px-2 py-0.5 rounded-full',
                                    hasTag
                                      ? 'bg-white/10 text-white/70'
                                      : 'bg-rose-500/20 text-rose-300 line-through'
                                  )}
                                >
                                  {tag}
                                </span>
                              );
                            })}
                            {currentTags
                              .filter((t) => !compareVersion.tags.includes(t))
                              .map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300"
                                >
                                  + {tag}
                                </span>
                              ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-white/50 mb-1">内容差异</div>
                          <div className="font-mono text-xs space-y-0.5 max-h-64 overflow-auto bg-black/20 rounded-lg p-2">
                            {diff.map((seg, i) => (
                              <div
                                key={i}
                                className={cn(
                                  'whitespace-pre-wrap leading-relaxed',
                                  seg.type === 'added' && 'bg-emerald-500/20 text-emerald-300 px-1 rounded',
                                  seg.type === 'removed' && 'bg-rose-500/20 text-rose-300 line-through px-1 rounded',
                                  seg.type === 'same' && 'text-white/60'
                                )}
                              >
                                {seg.type === 'added' && '+ '}
                                {seg.type === 'removed' && '- '}
                                {seg.value}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-96 overflow-auto pr-1">
                    {versions.map((version, index) => (
                      <motion.div
                        key={version.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          'p-3 rounded-xl border transition-all',
                          compareVersionId === version.id
                            ? 'bg-amber-gold/10 border-amber-gold/40'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                              <span className="text-sm font-medium text-white truncate">
                                {format(new Date(version.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                              </span>
                              {index === 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-gold/20 text-amber-gold flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" /> 最新
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-white/60 truncate mb-1">
                              {version.title || '(无标题)'}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] text-white/40">
                                {formatSize(version.size)}
                              </span>
                              {version.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {version.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {version.tags.length > 3 && (
                                    <span className="text-[10px] text-white/40">
                                      +{version.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() =>
                                setCompareVersionId(
                                  compareVersionId === version.id ? null : version.id
                                )
                              }
                              className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                compareVersionId === version.id
                                  ? 'bg-amber-gold/20 text-amber-gold'
                                  : 'hover:bg-white/10 text-white/60 hover:text-white'
                              )}
                              title="与当前版本对比"
                            >
                              <GitCompare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRestore(version.id)}
                              disabled={restoringId === version.id}
                              className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-white/60 hover:text-emerald-400 transition-colors disabled:opacity-50"
                              title="回退到此版本"
                            >
                              <RotateCcw
                                className={cn(
                                  'w-4 h-4',
                                  restoringId === version.id && 'animate-spin'
                                )}
                              />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
