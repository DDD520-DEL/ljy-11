import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FileText,
  Network,
  Clock,
  TrendingUp,
  Plus,
  BookOpen,
  ArrowRight,
  Sparkles,
  Bell,
  BellOff,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Settings,
  X,
  Flame,
  Trophy,
  BarChart3,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  getReviewStatsByDay,
  getConsecutiveDaysWithoutReview,
  getTodayReviewedCount,
  getCardsWeekOverWeek,
  getLinksWeekOverWeek,
  getReadingTimeWeekOverWeek,
  getReviewQueueDayOverDay,
  ACHIEVEMENT_DEFINITIONS,
  getLearningDays,
  getActiveDays,
} from '../utils/algorithm';
import { useNotification } from '../hooks/useNotification';
import { AchievementType } from '../types';
import WeeklyReportModal from '../components/WeeklyReportModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { 
    cards, 
    links, 
    getReviewQueue, 
    getReadingHeatmap, 
    readingRecords, 
    reviewHistories,
    getStreakInfo,
    newlyUnlockedAchievements,
    clearNewAchievements,
  } = useStore();
  const {
    settings: notificationSettings,
    permission: notificationPermission,
    isSupported: notificationSupported,
    enableNotifications,
    disableNotifications,
    setReminderTime,
    testNotification,
  } = useNotification();

  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  const reviewQueue = getReviewQueue();
  const heatmap = getReadingHeatmap();
  const streakInfo = getStreakInfo();
  const totalReadingTime = readingRecords.reduce((sum, r) => sum + r.duration, 0);
  const reviewStats = getReviewStatsByDay(reviewHistories, 7);
  const consecutiveDaysOff = getConsecutiveDaysWithoutReview(reviewHistories);
  const todayReviewed = getTodayReviewedCount(reviewHistories);
  const maxReviewedInWeek = Math.max(...reviewStats.map((s) => s.reviewed), 1);

  const weekActiveDays = (() => {
    const learningDays = getLearningDays(readingRecords, reviewHistories);
    const activeDays = getActiveDays(learningDays);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);
    const cutoffStr = format(weekAgo, 'yyyy-MM-dd');
    let count = 0;
    activeDays.forEach((date) => {
      if (date >= cutoffStr) {
        count++;
      }
    });
    return count;
  })();

  useEffect(() => {
    if (newlyUnlockedAchievements.length > 0) {
      const timer = setTimeout(() => {
        clearNewAchievements();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlockedAchievements, clearNewAchievements]);

  const cardsGrowth = getCardsWeekOverWeek(cards);
  const linksGrowth = getLinksWeekOverWeek(links);
  const readingGrowth = getReadingTimeWeekOverWeek(readingRecords);
  const reviewGrowth = getReviewQueueDayOverDay(cards);

  const recentCards = cards.slice(0, 5);

  const showStreakWarning = consecutiveDaysOff >= 2 && reviewQueue.length > 0;

  const formatGrowth = (growth: { changePercent: number; isPositive: boolean }) => {
    const sign = growth.changePercent > 0 ? '+' : '';
    return `${sign}${growth.changePercent}%`;
  };

  const stats = [
    {
      icon: FileText,
      label: '知识卡片',
      value: cards.length,
      color: 'from-amber-gold to-amber-gold-light',
      change: formatGrowth(cardsGrowth),
      growth: cardsGrowth,
      periodLabel: '较上周',
    },
    {
      icon: Network,
      label: '知识关联',
      value: links.length,
      color: 'from-blue-500 to-cyan-500',
      change: formatGrowth(linksGrowth),
      growth: linksGrowth,
      periodLabel: '较上周',
    },
    {
      icon: Flame,
      label: '连续打卡',
      value: `${streakInfo.currentStreak}天`,
      color: 'from-orange-500 to-red-500',
      change: `最长${streakInfo.longestStreak}天`,
      growth: { changePercent: 0, isPositive: true },
      periodLabel: '历史最长',
    },
    {
      icon: Clock,
      label: '本周学习',
      value: `${Math.floor(streakInfo.weekDuration / 60)}分钟`,
      color: 'from-emerald-mastered to-teal-500',
      change: `${weekActiveDays}天活跃`,
      growth: { changePercent: 0, isPositive: true },
      periodLabel: '活跃天数',
    },
    {
      icon: BookOpen,
      label: '总阅读时长',
      value: `${Math.floor(totalReadingTime / 60)}分钟`,
      color: 'from-purple-500 to-indigo-500',
      change: formatGrowth(readingGrowth),
      growth: readingGrowth,
      periodLabel: '较上周',
    },
    {
      icon: TrendingUp,
      label: '待复习',
      value: reviewQueue.length,
      color: 'from-rose-review to-pink-500',
      change: formatGrowth(reviewGrowth),
      growth: reviewGrowth,
      periodLabel: '较昨日',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            欢迎回来，探索者
          </h1>
          <p className="text-white/60">
            你的知识网络正在生长，每一个链接都是智慧的桥梁。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWeeklyReport(true)}
            className="p-3 rounded-xl transition-all duration-300 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white flex items-center gap-2"
            title="生成周报"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">生成周报</span>
          </button>
          <button
            onClick={() => setShowNotificationSettings(true)}
            className={`p-3 rounded-xl transition-all duration-300 ${
              notificationSettings.enabled && notificationPermission === 'granted'
                ? 'bg-amber-gold/20 text-amber-gold hover:bg-amber-gold/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            title="通知设置"
          >
            {notificationSettings.enabled && notificationPermission === 'granted' ? (
              <Bell className="w-5 h-5" />
            ) : (
              <BellOff className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => navigate('/cards/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            创建新卡片
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showStreakWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 border-rose-review/50 bg-rose-review/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-review/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-review-light" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-rose-review-light mb-1">
                  ⚠️ 连续 {consecutiveDaysOff} 天未复习
                </h3>
                <p className="text-sm text-white/60">
                  你已有 {consecutiveDaysOff} 天没有复习卡片了，坚持复习才能保持记忆效果。
                  现在还有 {reviewQueue.length} 张卡片等待复习，快开始吧！
                </p>
              </div>
              <button
                onClick={() => navigate('/review')}
                className="btn-primary flex-shrink-0"
              >
                立即复习
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newlyUnlockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-20 right-4 z-50 space-y-3"
          >
            {newlyUnlockedAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-4 border-amber-gold/50 bg-gradient-to-r from-amber-gold/20 to-transparent min-w-[280px]"
              >
                <div className="flex items-center gap-3">
                  <div className="text-4xl animate-bounce">
                    {achievement.icon}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-amber-gold">
                      🎉 成就解锁！
                    </h4>
                    <p className="font-medium text-white">
                      {achievement.name}
                    </p>
                    <p className="text-xs text-white/60">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={item} className="stat-card group">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${
                    stat.growth.isPositive
                      ? 'text-emerald-mastered'
                      : 'text-rose-review-light'
                  }`}>
                    {stat.change}
                  </span>
                  <p className="text-xs text-white/40 mt-0.5">
                    {stat.periodLabel}
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-white/50">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-white">
              最近更新
            </h2>
            <button
              onClick={() => navigate('/cards')}
              className="text-sm text-amber-gold hover:text-amber-gold-light flex items-center gap-1 transition-colors"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/cards/${card.id}`)}
                className="glass-card-hover p-4 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-gold/20 to-amber-gold-light/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-amber-gold" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{card.title}</h3>
                    <p className="text-xs text-white/50">
                      {formatDistanceToNow(card.updatedAt, {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {card.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <div className={`glass-card p-6 relative overflow-hidden ${
            reviewQueue.length > 0 ? 'border-rose-review/30' : 'border-emerald-mastered/30'
          }`}>
            {reviewQueue.length > 0 && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-review/20 to-transparent rounded-bl-full" />
            )}
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  reviewQueue.length > 0
                    ? 'bg-gradient-to-br from-rose-review/30 to-pink-500/30'
                    : 'bg-gradient-to-br from-emerald-mastered/30 to-teal-500/30'
                }`}>
                  <BookOpen className={`w-6 h-6 ${
                    reviewQueue.length > 0 ? 'text-rose-review-light' : 'text-emerald-mastered'
                  }`} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    今日复习
                  </h3>
                  <p className="text-xs text-white/50">间隔重复学习法</p>
                </div>
              </div>

              <div className="text-center py-4">
                <div className={`text-5xl font-bold mb-2 ${
                  reviewQueue.length > 0 ? 'text-rose-review-light' : 'text-emerald-mastered'
                }`}>
                  {reviewQueue.length}
                </div>
                <p className="text-white/60 text-sm mb-1">
                  {reviewQueue.length > 0 ? '张卡片待复习' : '今日已完成'}
                </p>
                {todayReviewed > 0 && (
                  <p className="text-emerald-mastered/80 text-xs">
                    今日已复习 {todayReviewed} 张
                  </p>
                )}
              </div>

              {reviewQueue.length > 0 ? (
                <>
                  <div className="mb-4">
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-review to-rose-review-light rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(reviewQueue.length * 8, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/review')}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    开始复习
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 text-emerald-mastered">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">保持良好节奏！</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-gold" />
                复习趋势
              </h3>
              <span className="text-xs text-white/50">最近 7 天</span>
            </div>
            <div className="flex items-end justify-between h-28 gap-1">
              {reviewStats.map((stat, index) => {
                const height = maxReviewedInWeek > 0
                  ? (stat.reviewed / maxReviewedInWeek) * 100
                  : 0;
                const isToday = index === reviewStats.length - 1;
                return (
                  <div key={stat.date} className="flex-1 flex flex-col items-center gap-2">
                    <span className={`text-xs font-medium ${
                      isToday ? 'text-amber-gold' : 'text-white/60'
                    }`}>
                      {stat.reviewed}
                    </span>
                    <div className="w-full flex-1 flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height, 5)}%` }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                        className={`w-full rounded-t-sm ${
                          isToday
                            ? 'bg-gradient-to-t from-amber-gold to-amber-gold-light'
                            : stat.reviewed > 0
                            ? 'bg-gradient-to-t from-emerald-mastered/60 to-emerald-mastered'
                            : 'bg-white/10'
                        }`}
                      />
                    </div>
                    <span className={`text-xs ${
                      isToday ? 'text-amber-gold font-medium' : 'text-white/40'
                    }`}>
                      {format(new Date(stat.date), 'EEE', { locale: zhCN })}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-white/50">本周总计</span>
              <span className="text-white font-medium">
                {reviewStats.reduce((sum, s) => sum + s.reviewed, 0)} 次复习
              </span>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              阅读活跃度
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (27 - i));
                const dateStr = date.toISOString().split('T')[0];
                const minutes = Math.floor((heatmap.get(dateStr) || 0) / 60);
                const intensity = Math.min(minutes / 60, 1);
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm transition-all duration-300 hover:scale-125`}
                    style={{
                      backgroundColor:
                        intensity > 0
                          ? `rgba(245, 158, 11, ${0.2 + intensity * 0.8})`
                          : 'rgba(255, 255, 255, 0.05)',
                    }}
                    title={`${dateStr}: ${minutes}分钟`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-white/40">
              <span>4周前</span>
              <div className="flex gap-1 items-center">
                <span>少</span>
                <div className="w-3 h-3 rounded-sm bg-white/10" />
                <div className="w-3 h-3 rounded-sm bg-amber-gold/30" />
                <div className="w-3 h-3 rounded-sm bg-amber-gold/60" />
                <div className="w-3 h-3 rounded-sm bg-amber-gold" />
                <span>多</span>
              </div>
              <span>今天</span>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-gold" />
              成就徽章
            </h3>
            <div className="space-y-3">
              {(Object.keys(ACHIEVEMENT_DEFINITIONS) as AchievementType[]).map((type) => {
                const def = ACHIEVEMENT_DEFINITIONS[type];
                const unlocked = streakInfo.achievements.some((a) => a.type === type);
                const progress = Math.min(
                  (streakInfo.currentStreak / def.days) * 100,
                  100
                );
                return (
                  <div
                    key={type}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      unlocked
                        ? 'bg-amber-gold/20 border border-amber-gold/40'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-3xl transition-all duration-300 ${
                          unlocked ? 'scale-110' : 'opacity-40 grayscale'
                        }`}
                      >
                        {def.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-medium text-sm ${
                              unlocked ? 'text-amber-gold' : 'text-white/60'
                            }`}
                          >
                            {def.name}
                          </span>
                          {unlocked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-mastered" />
                          ) : (
                            <span className="text-xs text-white/40">
                              {streakInfo.currentStreak}/{def.days}天
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40 mb-2">
                          {def.description}
                        </p>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full rounded-full ${
                              unlocked
                                ? 'bg-gradient-to-r from-amber-gold to-amber-gold-light'
                                : 'bg-gradient-to-r from-amber-gold/50 to-amber-gold-light/50'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-sm text-white/50">
                已解锁 <span className="text-amber-gold font-medium">{streakInfo.achievements.length}</span> / {Object.keys(ACHIEVEMENT_DEFINITIONS).length} 个成就
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showNotificationSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotificationSettings(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="glass-card p-6 mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-gold/20 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-amber-gold" />
                    </div>
                    通知设置
                  </h2>
                  <button
                    onClick={() => setShowNotificationSettings(false)}
                    className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {!notificationSupported ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-rose-review-light mx-auto mb-3" />
                    <p className="text-white/80">你的浏览器不支持通知功能</p>
                    <p className="text-sm text-white/50 mt-1">请使用现代浏览器以获得完整体验</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h3 className="font-medium text-white">每日复习提醒</h3>
                        <p className="text-xs text-white/50 mt-1">
                          在指定时间提醒你复习卡片
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          if (notificationSettings.enabled) {
                            disableNotifications();
                          } else {
                            await enableNotifications();
                          }
                        }}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                          notificationSettings.enabled && notificationPermission === 'granted'
                            ? 'bg-amber-gold'
                            : 'bg-white/20'
                        }`}
                      >
                        <motion.div
                          animate={{
                            x: notificationSettings.enabled && notificationPermission === 'granted' ? 28 : 4,
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                        />
                      </button>
                    </div>

                    {notificationPermission === 'denied' && (
                      <div className="p-4 bg-rose-review/10 border border-rose-review/30 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-rose-review-light flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-rose-review-light font-medium">
                              通知权限被拒绝
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                              请在浏览器设置中允许本网站发送通知
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {notificationSettings.enabled && notificationPermission === 'granted' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div>
                          <label className="text-sm text-white/70 mb-2 block">
                            提醒时间
                          </label>
                          <div className="flex items-center gap-3">
                            <select
                              value={notificationSettings.hour}
                              onChange={(e) =>
                                setReminderTime(
                                  parseInt(e.target.value),
                                  notificationSettings.minute
                                )
                              }
                              className="input-field flex-1"
                            >
                              {Array.from({ length: 24 }).map((_, h) => (
                                <option key={h} value={h}>
                                  {h.toString().padStart(2, '0')} 时
                                </option>
                              ))}
                            </select>
                            <span className="text-white/50">:</span>
                            <select
                              value={notificationSettings.minute}
                              onChange={(e) =>
                                setReminderTime(
                                  notificationSettings.hour,
                                  parseInt(e.target.value)
                                )
                              }
                              className="input-field flex-1"
                            >
                              {[0, 15, 30, 45].map((m) => (
                                <option key={m} value={m}>
                                  {m.toString().padStart(2, '0')} 分
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => testNotification()}
                          className="w-full btn-secondary flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          发送测试通知
                        </button>
                      </motion.div>
                    )}

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-xs text-white/40 text-center">
                        提醒将在每天指定时间发送，仅当有待复习卡片时才会通知
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <WeeklyReportModal isOpen={showWeeklyReport} onClose={() => setShowWeeklyReport(false)} />
    </motion.div>
  );
}
