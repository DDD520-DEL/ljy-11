import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, CheckCircle2, FileText, Clock, Flame, Network, TrendingUp, BarChart3 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { WeeklyReport } from '../types';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeeklyReportModal({ isOpen, onClose }: WeeklyReportModalProps) {
  const { getWeeklyReport, getWeeklyReportMarkdown } = useStore();
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'preview' | 'markdown'>('preview');

  const report = getWeeklyReport();
  const markdown = getWeeklyReportMarkdown();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `学习周报_${report.startDate}_${report.endDate}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatReadingTime = (seconds: number) => {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
  };

  const fmt = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const summaryItems = [
    { icon: TrendingUp, label: '复习完成率', value: `${report.reviewCompletionRate}%`, color: 'from-emerald-mastered to-teal-500' },
    { icon: FileText, label: '新增卡片', value: `${report.newCardsCount} 张`, color: 'from-amber-gold to-amber-gold-light' },
    { icon: Network, label: '新增关联', value: `${report.newLinksCount} 条`, color: 'from-blue-500 to-cyan-500' },
    { icon: Clock, label: '总阅读时长', value: formatReadingTime(report.totalReadingSeconds), color: 'from-purple-500 to-indigo-500' },
    { icon: Flame, label: '连续打卡', value: `${report.currentStreak} 天`, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[85vh]"
          >
            <div className="glass-card p-6 mx-4 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-gold/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-amber-gold" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white">学习周报</h2>
                    <p className="text-xs text-white/50">{fmt(report.startDate)} — {fmt(report.endDate)}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 mb-5 flex-shrink-0">
                <button
                  onClick={() => setTab('preview')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    tab === 'preview'
                      ? 'bg-amber-gold text-deep-space'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  预览
                </button>
                <button
                  onClick={() => setTab('markdown')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    tab === 'markdown'
                      ? 'bg-amber-gold text-deep-space'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Markdown
                </button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                {tab === 'preview' ? (
                  <PreviewView report={report} formatReadingTime={formatReadingTime} summaryItems={summaryItems} />
                ) : (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono leading-relaxed">
                      {markdown}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-5 flex-shrink-0">
                <button
                  onClick={handleCopy}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-mastered" />
                      <span className="text-emerald-mastered">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制 Markdown
                    </>
                  )}
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出 .md 文件
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PreviewView({ report, formatReadingTime, summaryItems }: {
  report: WeeklyReport;
  formatReadingTime: (s: number) => string;
  summaryItems: { icon: React.ElementType; label: string; value: string; color: string }[];
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {summaryItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-white/50">{item.label}</span>
              </div>
              <p className="text-lg font-bold text-white">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-4">
        <h3 className="font-display text-lg font-bold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-gold" />
          活跃与复习
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{report.activeDays}</p>
            <p className="text-xs text-white/50">活跃天数 / 7</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{report.totalReviews}</p>
            <p className="text-xs text-white/50">复习次数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{report.totalReviewCards}</p>
            <p className="text-xs text-white/50">复习卡片数</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-white/50 mb-1">
            <span>复习完成率</span>
            <span className="text-amber-gold">{report.reviewCompletionRate}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${report.reviewCompletionRate}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${
                report.reviewCompletionRate >= 80
                  ? 'bg-gradient-to-r from-emerald-mastered to-teal-500'
                  : report.reviewCompletionRate >= 50
                  ? 'bg-gradient-to-r from-amber-gold to-amber-gold-light'
                  : 'bg-gradient-to-r from-rose-review to-pink-500'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="font-display text-lg font-bold text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-gold" />
          最常访问卡片 Top {report.topVisitedCards.length}
        </h3>
        {report.topVisitedCards.length > 0 ? (
          <div className="space-y-2">
            {report.topVisitedCards.map((item, i) => (
              <div key={item.cardId} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0
                      ? 'bg-amber-gold text-deep-space'
                      : i === 1
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-white truncate">{item.cardTitle}</span>
                <span className="text-xs text-white/50">{item.visitCount}次</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40 text-center py-4">暂无阅读记录</p>
        )}
      </div>
    </div>
  );
}
