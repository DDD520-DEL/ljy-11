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
  X,
  Flame,
  Trophy,
  BarChart3,
  Star,
  Target,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import {
  getReviewStatsByDay,
  getConsecutiveDaysWithoutReview,
  getTodayReviewedCount,
  getReviewQueueDayOverDay,
  ACHIEVEMENT_DEFINITIONS,
  getTimeRangeDates,
  getCardsPeriodComparison,
  getLinksPeriodComparison,
  getReadingTimePeriodComparison,
  getActiveDaysInRange,
  getReadingDurationInRange,
  getReviewCompletionRate,
} from '../utils/algorithm';
import { useNotification } from '../hooks/useNotification';
import { AchievementType, TimeRange } from '../types';
import WeeklyReportModal from '../components/WeeklyReportModal';
import DailyDiscovery from '../components/DailyDiscovery';
import { useI18n } from '../i18n';

export default function DashboardPage() {
  const { language, t } = useI18n();
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
    getFavoriteCards,
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
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const getAchievementName = (type: string): string => {
    switch (type) {
      case 'streak_7': return t('achievement.streak7Name');
      case 'streak_30': return t('achievement.streak30Name');
      case 'streak_100': return t('achievement.streak100Name');
      default: return '';
    }
  };

  const getAchievementDesc = (type: string): string => {
    switch (type) {
      case 'streak_7': return t('achievement.streak7Desc');
      case 'streak_30': return t('achievement.streak30Desc');
      case 'streak_100': return t('achievement.streak100Desc');
      default: return '';
    }
  };

  const dateLocale = language === 'zh-CN' ? zhCN : enUS;

  const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
    { value: 'week', label: t('dashboard.thisWeek') },
    { value: 'month', label: t('dashboard.thisMonth') },
    { value: 'last30', label: t('dashboard.last30Days') },
  ];

  const TIME_RANGE_PERIOD_LABELS: Record<TimeRange, string> = {
    week: t('dashboard.comparedLastWeek'),
    month: t('dashboard.comparedLastMonth'),
    last30: t('dashboard.comparedLast30'),
  };

  const TIME_RANGE_TREND_LABELS: Record<TimeRange, string> = {
    week: t('dashboard.last7Days'),
    month: t('dashboard.thisMonth'),
    last30: t('dashboard.last30Days2'),
  };

  const reviewQueue = getReviewQueue();
  const heatmap = getReadingHeatmap();
  const streakInfo = getStreakInfo();
  const rangeInfo = getTimeRangeDates(timeRange);
  const reviewStats = getReviewStatsByDay(reviewHistories, rangeInfo.days);
  const consecutiveDaysOff = getConsecutiveDaysWithoutReview(reviewHistories);
  const todayReviewed = getTodayReviewedCount(reviewHistories);
  const maxReviewedInRange = Math.max(...reviewStats.map((s) => s.reviewed), 1);
  const favoriteCards = getFavoriteCards();

  const activeDaysInRange = getActiveDaysInRange(readingRecords, reviewHistories, timeRange);
  const readingDurationInRange = getReadingDurationInRange(readingRecords, timeRange);
  const reviewCompletionRate = getReviewCompletionRate(cards, reviewHistories, timeRange);

  useEffect(() => {
    if (newlyUnlockedAchievements.length > 0) {
      const timer = setTimeout(() => {
        clearNewAchievements();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlockedAchievements, clearNewAchievements]);

  const cardsGrowth = getCardsPeriodComparison(cards, timeRange);
  const linksGrowth = getLinksPeriodComparison(links, timeRange);
  const readingGrowth = getReadingTimePeriodComparison(readingRecords, timeRange);
  const reviewGrowth = getReviewQueueDayOverDay(cards);

  const periodLabel = TIME_RANGE_PERIOD_LABELS[timeRange];

  const recentCards = cards
    .filter((card) => {
      const dateKey = new Date(card.createdAt).toISOString().split('T')[0];
      return dateKey >= rangeInfo.start.toISOString().split('T')[0];
    })
    .slice(0, 5);

  const showStreakWarning = consecutiveDaysOff >= 2 && reviewQueue.length > 0;

  const formatGrowth = (growth: { changePercent: number; isPositive: boolean }) => {
    const sign = growth.changePercent > 0 ? '+' : '';
    return `${sign}${growth.changePercent}%`;
  };

  const stats = [
    {
      icon: FileText,
      label: t('dashboard.newCards'),
      value: cardsGrowth.currentPeriod,
      color: 'from-amber-gold to-amber-gold-light',
      change: formatGrowth(cardsGrowth),
      growth: cardsGrowth,
      periodLabel,
    },
    {
      icon: Star,
      label: t('dashboard.myFavorites'),
      value: favoriteCards.length,
      color: 'from-amber-400 to-yellow-400',
      change: favoriteCards.length > 0 ? t('dashboard.clickToView') : t('dashboard.goFavorite'),
      growth: { changePercent: 0, isPositive: true },
      periodLabel: t('dashboard.importantCards'),
      onClick: () => navigate('/favorites'),
    },
    {
      icon: Network,
      label: t('dashboard.newLinks'),
      value: linksGrowth.currentPeriod,
      color: 'from-blue-500 to-cyan-500',
      change: formatGrowth(linksGrowth),
      growth: linksGrowth,
      periodLabel,
    },
    {
      icon: Target,
      label: t('dashboard.reviewRate'),
      value: `${reviewCompletionRate}%`,
      color: 'from-emerald-mastered to-teal-500',
      change: reviewCompletionRate >= 80 ? t('dashboard.excellent') : reviewCompletionRate >= 50 ? t('dashboard.keepItUp') : t('dashboard.needsWork'),
      growth: { changePercent: 0, isPositive: reviewCompletionRate >= 50 },
      periodLabel: TIME_RANGE_TREND_LABELS[timeRange],
    },
    {
      icon: Flame,
      label: t('dashboard.currentStreak'),
      value: `${streakInfo.currentStreak}${t('dashboard.dayUnit')}`,
      color: 'from-orange-500 to-red-500',
      change: `${t('dashboard.longestPrefix')}${streakInfo.longestStreak}${t('dashboard.longestSuffix')}`,
      growth: { changePercent: 0, isPositive: true },
      periodLabel: t('dashboard.allTimeBest'),
    },
    {
      icon: Clock,
      label: t('dashboard.studyTime'),
      value: `${Math.floor(readingDurationInRange / 60)}${t('dashboard.minuteUnit')}`,
      color: 'from-purple-500 to-indigo-500',
      change: `${activeDaysInRange}${t('dashboard.daysActive')}`,
      growth: readingGrowth,
      periodLabel: formatGrowth(readingGrowth),
    },
    {
      icon: TrendingUp,
      label: t('dashboard.toReview'),
      value: reviewQueue.length,
      color: 'from-rose-review to-pink-500',
      change: formatGrowth(reviewGrowth),
      growth: reviewGrowth,
      periodLabel: t('dashboard.comparedYesterday'),
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-white/60">
            {t('dashboard.welcomeDesc')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 rounded-xl p-1 gap-1">
            {TIME_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  timeRange === option.value
                    ? 'bg-amber-gold text-white shadow-lg shadow-amber-gold/25'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowWeeklyReport(true)}
            className="p-3 rounded-xl transition-all duration-300 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white flex items-center gap-2"
            title={t('dashboard.generateWeeklyReport')}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">{t('dashboard.generateWeeklyReport')}</span>
          </button>
          <button
            onClick={() => setShowNotificationSettings(true)}
            className={`p-3 rounded-xl transition-all duration-300 ${
              notificationSettings.enabled && notificationPermission === 'granted'
                ? 'bg-amber-gold/20 text-amber-gold hover:bg-amber-gold/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            title={t('dashboard.notificationSettings')}
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
            {t('dashboard.createNewCard')}
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
                  {t('dashboard.noReviewWarnPrefix')} {consecutiveDaysOff} {t('dashboard.noReviewWarnSuffix')}
                </h3>
                <p className="text-sm text-white/60">
                  {t('dashboard.noReviewDesc1')} {consecutiveDaysOff} {t('dashboard.noReviewDesc2')} {reviewQueue.length} {t('dashboard.noReviewDesc3')}
                </p>
              </div>
              <button
                onClick={() => navigate('/review')}
                className="btn-primary flex-shrink-0"
              >
                {t('dashboard.startReviewNow')}
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
                      {t('dashboard.achievementUnlocked')}
                    </h4>
                    <p className="font-medium text-white">
                      {getAchievementName(achievement.type) || achievement.name}
                    </p>
                    <p className="text-xs text-white/60">
                      {getAchievementDesc(achievement.type) || achievement.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={timeRange}
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              variants={item}
              className={`stat-card group ${stat.onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
              onClick={stat.onClick}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 text-white ${stat.label === t('dashboard.myFavorites') && favoriteCards.length > 0 ? 'fill-white' : ''}`} />
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${
                    stat.label === t('dashboard.myFavorites')
                      ? 'text-amber-gold'
                      : stat.growth.isPositive
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
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={item}>
            <DailyDiscovery />
          </motion.div>

          <motion.div variants={item} className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-white">
                {timeRange === 'week' ? t('dashboard.thisWeekUpdates') : timeRange === 'month' ? t('dashboard.thisMonthUpdates') : t('dashboard.recentUpdates')}
              </h2>
              <button
                onClick={() => navigate('/cards')}
                className="text-sm text-amber-gold hover:text-amber-gold-light flex items-center gap-1 transition-colors"
              >
                {t('dashboard.viewAll')} <ArrowRight className="w-4 h-4" />
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
                          locale: dateLocale,
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
        </div>

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
                    {t('dashboard.todayReview')}
                  </h3>
                  <p className="text-xs text-white/50">{t('dashboard.spacedRepetition')}</p>
                </div>
              </div>

              <div className="text-center py-4">
                <div className={`text-5xl font-bold mb-2 ${
                  reviewQueue.length > 0 ? 'text-rose-review-light' : 'text-emerald-mastered'
                }`}>
                  {reviewQueue.length}
                </div>
                <p className="text-white/60 text-sm mb-1">
                  {reviewQueue.length > 0 ? t('dashboard.cardsToReview') : t('dashboard.todayCompleted')}
                </p>
                {todayReviewed > 0 && (
                  <p className="text-emerald-mastered/80 text-xs">
                    {t('dashboard.todayReviewedPrefix')} {todayReviewed} {t('dashboard.todayReviewedSuffix')}
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
                    {t('dashboard.startReview')}
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 text-emerald-mastered">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">{t('dashboard.goodPace')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-gold" />
                {t('dashboard.reviewTrend')}
              </h3>
              <span className="text-xs text-white/50">{TIME_RANGE_TREND_LABELS[timeRange]}</span>
            </div>
            <div className="flex items-end justify-between h-28 gap-1">
              {reviewStats.map((stat, index) => {
                const height = maxReviewedInRange > 0
                  ? (stat.reviewed / maxReviewedInRange) * 100
                  : 0;
                const isToday = index === reviewStats.length - 1;
                const showLabel = timeRange === 'last30'
                  ? index % 5 === 0 || isToday
                  : true;
                return (
                  <div key={stat.date} className="flex-1 flex flex-col items-center gap-2">
                    <span className={`text-xs font-medium ${
                      isToday ? 'text-amber-gold' : 'text-white/60'
                    }`}>
                      {stat.reviewed > 0 ? stat.reviewed : ''}
                    </span>
                    <div className="w-full flex-1 flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height, 5)}%` }}
                        transition={{ delay: index * 0.02, duration: 0.5 }}
                        className={`w-full rounded-t-sm ${
                          isToday
                            ? 'bg-gradient-to-t from-amber-gold to-amber-gold-light'
                            : stat.reviewed > 0
                            ? 'bg-gradient-to-t from-emerald-mastered/60 to-emerald-mastered'
                            : 'bg-white/10'
                        }`}
                      />
                    </div>
                    {showLabel && (
                      <span className={`text-xs ${
                        isToday ? 'text-amber-gold font-medium' : 'text-white/40'
                      }`}>
                        {timeRange === 'last30'
                          ? format(new Date(stat.date), 'd')
                          : format(new Date(stat.date), 'EEE', { locale: dateLocale })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-white/50">{TIME_RANGE_TREND_LABELS[timeRange]}{t('dashboard.trendTotalPrefix')}</span>
              <span className="text-white font-medium">
                {reviewStats.reduce((sum, s) => sum + s.reviewed, 0)} {t('dashboard.trendTotalSuffix')}
              </span>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              {t('dashboard.readingActivity')}
            </h3>
            <div className={`grid gap-1 ${
              timeRange === 'week' ? 'grid-cols-7' : timeRange === 'month' ? 'grid-cols-7' : 'grid-cols-6'
            }`}>
              {Array.from({ length: rangeInfo.days }).map((_, i) => {
                const date = new Date(rangeInfo.start);
                date.setDate(date.getDate() + i);
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
                    title={`${dateStr}: ${minutes}${t('dashboard.minuteUnit')}`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-white/40">
              <span>{format(rangeInfo.start, 'M/d')}</span>
              <div className="flex gap-1 items-center">
                <span>{t('dashboard.activityLow')}</span>
                <div className="w-3 h-3 rounded-sm bg-white/10" />
                <div className="w-3 h-3 rounded-sm bg-amber-gold/30" />
                <div className="w-3 h-3 rounded-sm bg-amber-gold/60" />
                <div className="w-3 h-3 rounded-sm bg-amber-gold" />
                <span>{t('dashboard.activityHigh')}</span>
              </div>
              <span>{format(rangeInfo.end, 'M/d')}</span>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-gold" />
              {t('dashboard.achievementBadges')}
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
                            {getAchievementName(type) || def.name}
                          </span>
                          {unlocked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-mastered" />
                          ) : (
                            <span className="text-xs text-white/40">
                              {streakInfo.currentStreak}/{def.days}{t('dashboard.dayUnit')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40 mb-2">
                          {getAchievementDesc(type) || def.description}
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
                {t('dashboard.unlockedPrefix')} <span className="text-amber-gold font-medium">{streakInfo.achievements.length}</span> / {Object.keys(ACHIEVEMENT_DEFINITIONS).length} {t('dashboard.unlockedSuffix')}
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
                    {t('dashboard.notificationModalTitle')}
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
                    <p className="text-white/80">{t('dashboard.noNotificationSupport')}</p>
                    <p className="text-sm text-white/50 mt-1">{t('dashboard.useModernBrowser')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h3 className="font-medium text-white">{t('dashboard.dailyReviewReminder')}</h3>
                        <p className="text-xs text-white/50 mt-1">
                          {t('dashboard.dailyReviewDesc')}
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
                              {t('dashboard.notifPermissionDeniedTitle')}
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                              {t('dashboard.notifPermissionDeniedDesc')}
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
                            {t('dashboard.reminderTime')}
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
                                  {h.toString().padStart(2, '0')} {t('dashboard.hourUnit')}
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
                                  {m.toString().padStart(2, '0')} {t('dashboard.minuteUnit')}
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
                          {t('dashboard.sendTestNotif')}
                        </button>
                      </motion.div>
                    )}

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-xs text-white/40 text-center">
                        {t('dashboard.notifBottomTip')}
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
