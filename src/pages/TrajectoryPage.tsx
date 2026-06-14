import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Clock,
  Calendar,
  ArrowRight,
  FileText,
  TrendingUp,
  Zap,
  Flame,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getLearningDays, getActiveDays } from '../utils/algorithm';
import WeeklyReportModal from '../components/WeeklyReportModal';

export default function TrajectoryPage() {
  const navigate = useNavigate();
  const { readingRecords, cards, getReadingHeatmap, reviewHistories, getStreakInfo } = useStore();
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  const heatmap = getReadingHeatmap();
  const streakInfo = getStreakInfo();
  const learningDays = useMemo(
    () => getLearningDays(readingRecords, reviewHistories),
    [readingRecords, reviewHistories]
  );
  const activeDays = useMemo(
    () => getActiveDays(learningDays),
    [learningDays]
  );
  const activeDaysInRange = useMemo(() => {
    const days = parseInt(timeRange);
    const cutoff = subDays(new Date(), days - 1);
    const cutoffStr = format(cutoff, 'yyyy-MM-dd');
    let count = 0;
    activeDays.forEach((date) => {
      if (date >= cutoffStr) {
        count++;
      }
    });
    return count;
  }, [activeDays, timeRange]);

  const filteredRecords = useMemo(() => {
    const days = parseInt(timeRange);
    const cutoff = subDays(new Date(), days);
    return readingRecords.filter((r) => new Date(r.startTime) >= cutoff);
  }, [readingRecords, timeRange]);

  const dailyStats = useMemo(() => {
    const stats = new Map<string, { count: number; duration: number }>();
    filteredRecords.forEach((record) => {
      const date = format(new Date(record.startTime), 'yyyy-MM-dd');
      const current = stats.get(date) || { count: 0, duration: 0 };
      stats.set(date, {
        count: current.count + 1,
        duration: current.duration + record.duration,
      });
    });
    return stats;
  }, [filteredRecords]);

  const totalDuration = filteredRecords.reduce((sum, r) => sum + r.duration, 0);
  const avgDuration =
    filteredRecords.length > 0
      ? Math.round(totalDuration / filteredRecords.length)
      : 0;

  const mostVisitedCards = useMemo(() => {
    const cardVisits = new Map<string, number>();
    filteredRecords.forEach((r) => {
      cardVisits.set(r.cardId, (cardVisits.get(r.cardId) || 0) + 1);
    });
    return Array.from(cardVisits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cardId, visits]) => ({
        card: cards.find((c) => c.id === cardId),
        visits,
      }))
      .filter((item) => item.card);
  }, [filteredRecords, cards]);

  const readingPath = useMemo(() => {
    const sorted = [...filteredRecords].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    return sorted.slice(-20);
  }, [filteredRecords]);

  const maxDuration = useMemo(() => {
    const values = Array.from(dailyStats.values()).map((s) => s.duration);
    return Math.max(...values, 1);
  }, [dailyStats]);

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
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            阅读轨迹
          </h1>
          <p className="text-white/60">
            记录和可视化你的知识探索路径
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWeeklyReport(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all bg-white/10 text-white/70 hover:bg-white/20 flex items-center gap-2"
            title="生成周报"
          >
            <Download className="w-4 h-4" />
            生成周报
          </button>
          {(['7', '30', '90'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-amber-gold text-deep-space'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {range}天
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-gold/20 to-amber-gold-light/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-gold" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {Math.floor(totalDuration / 60)}
          </p>
          <p className="text-sm text-white/50">总阅读时长 (分钟)</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {streakInfo.currentStreak}
          </p>
          <p className="text-sm text-white/50">连续打卡 (天)</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-mastered/20 to-teal-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-mastered" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{activeDays.size}</p>
          <p className="text-sm text-white/50">活跃天数</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-review/20 to-pink-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-rose-review-light" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {mostVisitedCards.length}
          </p>
          <p className="text-sm text-white/50">访问卡片数</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 glass-card p-6">
          <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-gold" />
            打卡热力图
          </h3>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[auto_repeat(53,1fr)] gap-1 min-w-[600px]">
              <div className="w-8" />
              {['一', '三', '五', '日'].map((day, i) => (
                <div
                  key={day}
                  className="text-xs text-white/40 text-center"
                  style={{ gridRow: i * 2 + 1 }}
                >
                  {day}
                </div>
              ))}
              {Array.from({ length: parseInt(timeRange) }).map((_, i) => {
                const date = subDays(new Date(), parseInt(timeRange) - 1 - i);
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayData = learningDays.get(dateStr);
                const isActive = activeDays.has(dateStr);
                const minutes = dayData ? Math.floor(dayData.duration / 60) : 0;
                const readCount = dayData?.readCount || 0;
                const reviewCount = dayData?.reviewCount || 0;
                const intensity = Math.min(minutes / 60, 1);
                const isFirstOfMonth = date.getDate() === 1;
                const weekStart = date.getDay() === 0;
                const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
                
                let bgColor = 'rgba(255, 255, 255, 0.05)';
                let borderColor = 'transparent';
                
                if (isActive) {
                  if (intensity > 0.6) {
                    bgColor = 'rgba(245, 158, 11, 0.9)';
                  } else if (intensity > 0.3) {
                    bgColor = 'rgba(245, 158, 11, 0.6)';
                  } else {
                    bgColor = 'rgba(245, 158, 11, 0.3)';
                  }
                }
                
                if (isToday) {
                  borderColor = 'rgba(245, 158, 11, 1)';
                }
                
                return (
                  <div key={i} className="relative">
                    {isFirstOfMonth && (
                      <span className="absolute -top-5 text-xs text-white/40">
                        {format(date, 'M月')}
                      </span>
                    )}
                    <div
                      className={`aspect-square rounded-sm transition-all duration-300 hover:scale-125 relative ${
                        weekStart ? 'mt-4' : ''
                      }`}
                      style={{
                        backgroundColor: bgColor,
                        border: `2px solid ${borderColor}`,
                      }}
                      title={`${dateStr}\n阅读: ${readCount}次 | 复习: ${reviewCount}次\n时长: ${minutes}分钟${isActive ? '\n✅ 已打卡' : ''}`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-white/40">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-white/10" />
                  <span>未打卡</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-amber-gold/30" />
                  <span>已打卡</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-amber-gold" />
                  <span>深度学习</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>
                  打卡率: {Math.round((activeDaysInRange / parseInt(timeRange)) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-gold" />
              每日阅读时长
            </h3>
            <div className="space-y-2">
              {Array.from(dailyStats.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(-14)
                .map(([date, stats]) => (
                  <div key={date} className="flex items-center gap-3">
                    <span className="text-xs text-white/40 w-16">
                      {format(new Date(date), 'MM-dd')}
                    </span>
                    <div className="flex-1 h-6 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-gold to-amber-gold-light rounded-full transition-all duration-500"
                        style={{
                          width: `${(stats.duration / maxDuration) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-white/60 w-12 text-right">
                      {Math.floor(stats.duration / 60)}m
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              最常访问
            </h3>
            <div className="space-y-3">
              {mostVisitedCards.map((item, index) => (
                <div
                  key={item.card!.id}
                  onClick={() => navigate(`/cards/${item.card!.id}`)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? 'bg-amber-gold text-deep-space'
                        : index === 1
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {item.card!.title}
                    </p>
                  </div>
                  <span className="text-xs text-white/50">
                    {item.visits}次
                  </span>
                </div>
              ))}
              {mostVisitedCards.length === 0 && (
                <p className="text-sm text-white/40 text-center py-4">
                  暂无阅读记录
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="glass-card p-6">
        <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-amber-gold" />
          阅读时间线
        </h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-amber-gold via-amber-gold/50 to-transparent" />
          <div className="space-y-4">
            {readingPath.map((record, index) => {
              const card = cards.find((c) => c.id === record.cardId);
              const fromCard = record.fromCardId
                ? cards.find((c) => c.id === record.fromCardId)
                : null;
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-deep-space border-2 border-amber-gold flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-gold animate-pulse" />
                  </div>
                  <div className="glass-card-hover p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {fromCard && (
                          <p className="text-xs text-white/50 mb-1">
                            从「{fromCard.title}」跳转而来
                          </p>
                        )}
                        <h4
                          onClick={() => navigate(`/cards/${record.cardId}`)}
                          className="font-medium text-white hover:text-amber-gold cursor-pointer transition-colors"
                        >
                          {card?.title || '未知卡片'}
                        </h4>
                      </div>
                      <span className="text-xs text-white/40">
                        {formatDistanceToNow(new Date(record.startTime), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {record.duration}秒
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {readingPath.length === 0 && (
              <p className="text-sm text-white/40 text-center py-8 pl-12">
                开始浏览知识卡片，你的阅读轨迹将在这里呈现
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <WeeklyReportModal isOpen={showWeeklyReport} onClose={() => setShowWeeklyReport(false)} />
    </motion.div>
  );
}
